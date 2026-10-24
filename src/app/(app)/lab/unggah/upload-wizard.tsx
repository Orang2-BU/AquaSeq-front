"use client";

import Link from "next/link";
import { startTransition, useActionState, useMemo, useState } from "react";
import { Check, CircleAlert, FileUp, Send } from "lucide-react";
import {
  FIELDS,
  MAX_CSV_BYTES,
  detectColumns,
  parseQpcr,
  pondCodeOf,
  standardCurve,
  summarize,
  type ColumnMap,
  type Exclusions,
} from "@/lib/csv/qpcr";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { FormState } from "@/lib/forms";
import { WATER_PARAMS } from "@/lib/water";
import { Plate } from "@/components/app/plate";
import { Icon } from "@/components/ui";
import { ingestDocument, submitBatch, type UploadPayload } from "./actions";
import { documentError } from "@/lib/documents";

export type PondOption = {
  id: string;
  pond_code: string;
  log: {
    id: string;
    measured_at: string;
    recorded_by: string;
    values: Record<ChemKey, number | null>;
  } | null;
};

const CHEM_KEYS = [
  "do_mg_l",
  "ph",
  "temp_c",
  "tan_mg_l",
  "no2_mg_l",
  "h2s_mg_l",
  "tom_mg_l",
  "alkalinity",
  "salinity_ppt",
] as const;
type ChemKey = (typeof CHEM_KEYS)[number];
const CHEM = CHEM_KEYS.map((key) => {
  const param = WATER_PARAMS.find((p) => p.key === key);
  return { key, label: param?.label ?? key, unit: param?.unit ?? "" };
});
const STEPS = ["Pilih file", "Cocokkan kolom", "Pratinjau QC", "Kolam & kimia air", "Kirim"] as const;
const FIELD_LABEL: Record<(typeof FIELDS)[number], string> = {
  well: "Well",
  sample_code: "Kode sampel",
  target: "Target",
  ct: "Kadar jejak (Ct)",
  tm: "Tm (opsional)",
};
const REASONS = ["Gelembung di well", "Kurva amplifikasi abnormal", "Salah pipet", "Puncak leleh ganda"];

type Assignment = { pond_id: string; sampling_date: string; edit: boolean; chemistry: Record<ChemKey, string> };

const chemText = (values: PondOption["log"]) =>
  Object.fromEntries(
    // Desimal koma (format Indonesia); dibaca balik dengan mengganti koma jadi titik.
    CHEM_KEYS.map((k) => [k, values?.values[k] == null ? "" : String(values.values[k]).replace(".", ",")]),
  ) as Record<ChemKey, string>;

/** P17: pilih file → cocokkan kolom → pratinjau QC → kolam & kimia air → kirim. */
export function UploadWizard({ ponds, today }: { ponds: PondOption[]; today: string }) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [text, setText] = useState("");
  const [columns, setColumns] = useState<ColumnMap | null>(null);
  const [run, setRun] = useState({ lab_name: "", instrument: "", tested_at: today });
  const [excluded, setExcluded] = useState<Exclusions>({});
  const [highlight, setHighlight] = useState("");
  const [exclude, setExclude] = useState({ position: "", reason: REASONS[0] });
  const [assign, setAssign] = useState<Record<string, Assignment>>({});
  const [state, action, pending] = useActionState(submitBatch, {} as FormState);

  const parsed = useMemo(() => (text ? parseQpcr(text, columns ?? undefined) : null), [text, columns]);
  const header = parsed?.header ?? [];
  const map = columns ?? (text ? detectColumns(header) : null);
  const qc = useMemo(() => (parsed ? summarize(parsed.wells, excluded) : []), [parsed, excluded]);
  const curve = parsed ? standardCurve(parsed.standards) : null;
  const ntc = parsed?.wells.filter((w) => w.sample_code.toUpperCase() === "NTC") ?? [];
  const ntcClean = ntc.length > 0 && ntc.every((w) => w.ct === null);

  const assignmentFor = (code: string): Assignment => {
    const existing = assign[code];
    if (existing) return existing;
    const pond = ponds.find((p) => p.pond_code === pondCodeOf(code));
    return {
      pond_id: pond?.id ?? "",
      sampling_date: run.tested_at,
      edit: false,
      chemistry: chemText(pond?.log ?? null),
    };
  };
  const setAssignment = (code: string, patch: Partial<Assignment>) =>
    setAssign((prev) => ({ ...prev, [code]: { ...assignmentFor(code), ...patch } }));
  const chosen = qc.filter((s) => assignmentFor(s.sample_code).pond_id);

  async function onFile(file: File | undefined) {
    setFileError("");
    if (!file) return;
    const error = documentError(file);
    if (error) return setFileError(error);
    if (!/\.csv$/i.test(file.name)) {
      setFileName(file.name);
      setText("");
      setFileError("Membaca dokumen di backend...");
      const form = new FormData();
      form.set("file", file);
      try {
        const result = await ingestDocument({}, form);
        setFileError(
          result.error ||
            `${result.data?.samples.length ?? 0} sampel terbaca. ${result.data?.warnings.map((w) => w.message).join(" ") || "Tidak ada peringatan dokumen."} Pratinjau dan pengiriman dokumen menunggu persetujuan tampilan. Gunakan CSV untuk alur kirim yang tersedia.`,
        );
      } catch {
        setFileError("Dokumen belum dapat dibaca. Muat ulang lalu coba lagi.");
      }
      return;
    }
    if (file.size > MAX_CSV_BYTES) return setFileError("Ukuran berkas lebih dari 2 MB.");
    setFileName(file.name);
    setText(await file.text());
    setColumns(null);
    setExcluded({});
    setAssign({});
  }

  const payload = (): UploadPayload => ({
    csv: text,
    columns: map ?? { well: null, sample_code: null, target: null, ct: null, tm: null },
    excluded,
    run: { ...run, file_name: fileName },
    samples: chosen.map((s) => {
      const a = assignmentFor(s.sample_code);
      const log = ponds.find((p) => p.id === a.pond_id)?.log ?? null;
      const chemistry = Object.fromEntries(
        CHEM_KEYS.map((k) => [k, a.chemistry[k].trim() === "" ? null : Number(a.chemistry[k].replace(",", "."))]),
      ) as Record<ChemKey, number | null>;
      const untouched = log && CHEM_KEYS.every((k) => chemistry[k] === log.values[k]);
      return {
        sample_code: s.sample_code,
        pond_id: a.pond_id,
        sampling_date: a.sampling_date,
        water_log_id: untouched ? log.id : null,
        chemistry,
      };
    }),
  });

  const canNext = [
    Boolean(text && run.lab_name.trim() && run.instrument.trim() && run.tested_at),
    Boolean(parsed && parsed.errors.length === 0 && parsed.wells.length > 0),
    qc.length > 0,
    chosen.length > 0,
    true,
  ][step];

  return (
    <>
      <ol className="toggle flow-steps" aria-label="Langkah unggah data eDNA">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`toggle-item ${i === step ? "selected" : ""} ${i < step ? "done" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            {i < step && <Icon icon={Check} size={14} />}
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <section className="panel wizard-panel">
        {step === 0 && (
          <div className="wizard-step">
            <div className="form-grid three">
              <div className="form-field">
                <label className="field-label" htmlFor="lab_name">
                  Nama lab
                </label>
                <input
                  id="lab_name"
                  value={run.lab_name}
                  onChange={(e) => setRun({ ...run, lab_name: e.target.value })}
                  placeholder="Lab Mikrobiologi Polije"
                />
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="instrument">
                  Alat laboratorium
                </label>
                <input
                  id="instrument"
                  value={run.instrument}
                  onChange={(e) => setRun({ ...run, instrument: e.target.value })}
                  placeholder="Bio-Rad CFX96"
                />
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="tested_at">
                  Tanggal uji
                </label>
                <input
                  id="tested_at"
                  type="date"
                  value={run.tested_at}
                  onChange={(e) => setRun({ ...run, tested_at: e.target.value })}
                />
              </div>
            </div>
            <label
              className={`drop-zone ${fileName ? "has-file" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                startTransition(() => {
                  void onFile(e.dataTransfer.files[0]);
                });
              }}
            >
              <input
                type="file"
                accept=".csv,.pdf,.docx,.xlsx"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  startTransition(() => {
                    void onFile(file);
                  });
                }}
                aria-describedby="file-help"
              />
              <Icon icon={FileUp} size={28} />
              <strong>{fileName || "Pilih atau seret CSV, PDF, DOCX, atau XLSX"}</strong>
              <span id="file-help" className="small muted">
                {fileName && parsed
                  ? `${parsed.wells.length} well terbaca`
                  : "CSV maksimal 2 MB; PDF/DOCX/XLSX maksimal 4 MB"}
              </span>
            </label>
            {fileError && (
              <p className="form-alert" role="alert">
                {fileError}
              </p>
            )}
            <p className="small muted">
              Belum punya format?{" "}
              <Link className="text-link" href="/lab/format">
                Lihat format CSV
              </Link>{" "}
              atau{" "}
              <a className="text-link" href="/templates/aquaseq-contoh-simulasi.csv" download>
                unduh contoh terisi (simulasi)
              </a>
              .
            </p>
          </div>
        )}

        {step === 1 && parsed && map && (
          <div className="wizard-step">
            <p className="muted">Kolom dicocokkan otomatis dari header. Ubah bila nama kolom dari alat berbeda.</p>
            <div className="form-grid five">
              {FIELDS.map((field) => (
                <div key={field} className="form-field">
                  <label className="field-label" htmlFor={`col-${field}`}>
                    {FIELD_LABEL[field]}
                  </label>
                  <select
                    id={`col-${field}`}
                    value={map[field] ?? ""}
                    onChange={(e) =>
                      setColumns({ ...map, [field]: e.target.value === "" ? null : Number(e.target.value) })
                    }
                  >
                    <option value="">Tidak ada</option>
                    {header.map((h, i) => (
                      <option key={`${h}-${i}`} value={i}>
                        {h || `Kolom ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="table-card">
              <table className="data-table compact">
                <thead>
                  <tr>
                    {header.map((h, i) => (
                      <th key={`${h}-${i}`} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.preview.map((row, r) => (
                    <tr key={r}>
                      {header.map((h, i) => (
                        <td key={`${h}-${i}`} data-label={h} className="mono">
                          {row[i] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.errors.length > 0 ? (
              <div className="error-rows" role="alert">
                <p>
                  <strong>{parsed.errors.length} baris bermasalah.</strong> Perbaiki di berkas lalu pilih ulang, atau
                  ubah pemetaan kolom.
                </p>
                <ul>
                  {parsed.errors.slice(0, 12).map((e) => (
                    <li key={`${e.row}-${e.message}`}>
                      <span className="mono">Baris {e.row}</span> {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="form-success" role="status">
                {parsed.wells.length} well dan {parsed.standards.length} titik kurva standar terbaca tanpa galat.
              </p>
            )}
          </div>
        )}

        {step === 2 && parsed && (
          <div className="wizard-step">
            <ol className="qc-pipeline" aria-label="Status kontrol run">
              <QcNode
                ok={Boolean(curve && curve.r2 >= 0.98 && curve.efficiency >= 90 && curve.efficiency <= 110)}
                warn={!curve}
                label="Kurva standar"
                detail={
                  curve
                    ? `slope ${formatNumber(curve.slope, 3)} · efisiensi ${formatNumber(curve.efficiency, 1)}% · R² ${formatNumber(curve.r2, 4)}`
                    : "Tidak ada (opsional)"
                }
              />
              <QcNode
                ok={qc.every((s) => s.ct.ct_ppc !== null)}
                label="Kontrol kualitas"
                detail={`${qc.filter((s) => s.ct.ct_ppc !== null).length} dari ${qc.length} sampel`}
              />
              <QcNode
                ok={ntcClean}
                warn={ntc.length === 0}
                label="NTC"
                detail={ntc.length ? (ntcClean ? "Bersih" : "Terdeteksi") : "Tidak ada"}
              />
              <QcNode
                ok={qc.every((s) => s.ct.ct_16s !== null)}
                label="16S"
                detail={`${qc.filter((s) => s.ct.ct_16s !== null).length} dari ${qc.length} teramplifikasi`}
              />
              <QcNode
                ok={qc.every((s) => s.replicate_sd <= 0.5)}
                label="Replikat"
                detail={`SD terbesar ${formatNumber(Math.max(0, ...qc.map((s) => s.replicate_sd)))}`}
              />
            </ol>
            <p className="small muted">
              Pratinjau ini hanya memeriksa kontrol. Gerbang kontrol kualitas dan skor diputuskan server analisis
              setelah dikirim.
            </p>
            <div className="qc-grid">
              <div className="table-card">
                <table className="data-table compact">
                  <thead>
                    <tr>
                      <th scope="col">Sampel</th>
                      <th scope="col" className="numeric">
                        pirA
                      </th>
                      <th scope="col" className="numeric">
                        Kontrol kualitas
                      </th>
                      <th scope="col" className="numeric">
                        16S
                      </th>
                      <th scope="col">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qc.map((s) => (
                      <tr key={s.sample_code} className={s.issues.length ? "row-warn" : undefined}>
                        <td data-label="Sampel" className="table-title">
                          <button
                            type="button"
                            className={`mono sample-pick ${highlight === s.sample_code ? "selected" : ""}`}
                            onClick={() => setHighlight(highlight === s.sample_code ? "" : s.sample_code)}
                            aria-pressed={highlight === s.sample_code}
                          >
                            {s.sample_code}
                          </button>
                        </td>
                        <td data-label="pirA" className="numeric">
                          {s.ct.ct_ahpnd === null ? "Und." : formatNumber(s.ct.ct_ahpnd)}
                        </td>
                        <td data-label="Kontrol kualitas" className="numeric">
                          {s.ct.ct_ppc === null ? "-" : formatNumber(s.ct.ct_ppc)}
                        </td>
                        <td data-label="16S" className="numeric">
                          {s.ct.ct_16s === null ? "-" : formatNumber(s.ct.ct_16s)}
                        </td>
                        <td data-label="Catatan" className="small">
                          {s.issues.length ? s.issues.join("; ") : <span className="muted">Kontrol lolos</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="stack">
                <Plate
                  wells={parsed.wells.map((w) => ({ ...w, excluded_reason: excluded[w.position] ?? null }))}
                  highlight={highlight || undefined}
                />
                <form
                  className="exclude-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (exclude.position) setExcluded({ ...excluded, [exclude.position]: exclude.reason });
                  }}
                >
                  <div className="form-field">
                    <label className="field-label" htmlFor="exclude-well">
                      Keluarkan well
                    </label>
                    <select
                      id="exclude-well"
                      value={exclude.position}
                      onChange={(e) => setExclude({ ...exclude, position: e.target.value })}
                    >
                      <option value="">Pilih well</option>
                      {parsed.wells
                        .filter((w) => !excluded[w.position] && (!highlight || w.sample_code === highlight))
                        .map((w) => (
                          <option key={w.position} value={w.position}>
                            {w.position} · {w.sample_code} · {w.target}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="field-label" htmlFor="exclude-reason">
                      Alasan
                    </label>
                    <select
                      id="exclude-reason"
                      value={exclude.reason}
                      onChange={(e) => setExclude({ ...exclude, reason: e.target.value })}
                    >
                      {REASONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <button className="button secondary" type="submit" disabled={!exclude.position}>
                    Keluarkan
                  </button>
                </form>
                {Object.keys(excluded).length > 0 && (
                  <ul className="excluded-list">
                    {Object.entries(excluded).map(([position, reason]) => (
                      <li key={position}>
                        <span>
                          <span className="mono">{position}</span> {reason}
                        </span>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() =>
                            setExcluded(Object.fromEntries(Object.entries(excluded).filter(([p]) => p !== position)))
                          }
                        >
                          Pakai lagi
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <p className="muted">
              Sampel dicocokkan ke kolam dari awalan kodenya. Kimia air terisi dari catatan teknisi terakhir dan bisa
              diubah.
            </p>
            <ul className="assign-samples">
              {qc.map((s) => {
                const a = assignmentFor(s.sample_code);
                const pond = ponds.find((p) => p.id === a.pond_id);
                return (
                  <li key={s.sample_code} className={a.pond_id ? undefined : "skipped"}>
                    <div className="assign-sample-head">
                      <strong className="mono">{s.sample_code}</strong>
                      <div className="form-field">
                        <label className="sr-only" htmlFor={`pond-${s.sample_code}`}>
                          Kolam untuk {s.sample_code}
                        </label>
                        <select
                          id={`pond-${s.sample_code}`}
                          value={a.pond_id}
                          onChange={(e) =>
                            setAssignment(s.sample_code, {
                              pond_id: e.target.value,
                              chemistry: chemText(ponds.find((p) => p.id === e.target.value)?.log ?? null),
                            })
                          }
                        >
                          <option value="">Jangan kirim</option>
                          {ponds.map((p) => (
                            <option key={p.id} value={p.id}>
                              Kolam {p.pond_code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label className="sr-only" htmlFor={`date-${s.sample_code}`}>
                          Tanggal sampling {s.sample_code}
                        </label>
                        <input
                          id={`date-${s.sample_code}`}
                          type="date"
                          value={a.sampling_date}
                          onChange={(e) => setAssignment(s.sample_code, { sampling_date: e.target.value })}
                        />
                      </div>
                      {a.pond_id && (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setAssignment(s.sample_code, { edit: !a.edit })}
                          aria-expanded={a.edit}
                        >
                          {a.edit ? "Selesai ubah" : "Ubah kimia air"}
                        </button>
                      )}
                    </div>
                    {a.pond_id && (
                      <p className="small muted">
                        {pond?.log
                          ? `Catatan ${formatDateTime(pond.log.measured_at)} oleh ${pond.log.recorded_by}: ${CHEM.slice(
                              0,
                              4,
                            )
                              .map((c) => `${c.label} ${a.chemistry[c.key] || "-"}`)
                              .join(" · ")}`
                          : "Belum ada catatan kimia air untuk kolam ini. Isi manual bila ada."}
                      </p>
                    )}
                    {a.pond_id && a.edit && (
                      <div className="chem-grid">
                        {CHEM.map((c) => (
                          <div key={c.key} className="form-field">
                            <label className="field-label" htmlFor={`${s.sample_code}-${c.key}`}>
                              {c.label} {c.unit && <span className="unit">{c.unit}</span>}
                            </label>
                            <input
                              id={`${s.sample_code}-${c.key}`}
                              inputMode="decimal"
                              value={a.chemistry[c.key]}
                              onChange={(e) =>
                                setAssignment(s.sample_code, { chemistry: { ...a.chemistry, [c.key]: e.target.value } })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === 4 && (
          <form action={action} className="wizard-step">
            <input type="hidden" name="payload" value={JSON.stringify(payload())} />
            <dl className="kv-grid">
              <div>
                <dt>Berkas</dt>
                <dd className="mono">{fileName}</dd>
              </div>
              <div>
                <dt>Lab dan alat</dt>
                <dd>
                  {run.lab_name} · {run.instrument}
                </dd>
              </div>
              <div>
                <dt>Sampel dikirim</dt>
                <dd>
                  {chosen.length} dari {qc.length}
                </dd>
              </div>
              <div>
                <dt>Well dikeluarkan</dt>
                <dd>{Object.keys(excluded).length}</dd>
              </div>
            </dl>
            {chosen.some((s) => s.issues.length) && (
              <p className="owner-note">
                <Icon icon={CircleAlert} size={16} /> {chosen.filter((s) => s.issues.length).length} sampel punya
                catatan kontrol. Server analisis bisa menolaknya.
              </p>
            )}
            {state.error && (
              <p className="form-alert" role="alert">
                {state.error}
              </p>
            )}
            <p className="small muted">
              Satu berkas dikirim sebagai satu batch. Data lab tidak bisa diubah setelah dikirim.
            </p>
            <div className="dialog-actions start">
              <button className="button primary" type="submit" disabled={pending}>
                <Icon icon={Send} />
                {pending ? "Mengirim ke analisis..." : "Kirim ke analisis"}
              </button>
            </div>
          </form>
        )}

        <div className="wizard-nav">
          <button type="button" className="button secondary" onClick={() => setStep(step - 1)} disabled={step === 0}>
            Kembali
          </button>
          {step < STEPS.length - 1 && (
            <button type="button" className="button primary" onClick={() => setStep(step + 1)} disabled={!canNext}>
              Lanjut
            </button>
          )}
        </div>
      </section>
    </>
  );
}

function QcNode({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: string }) {
  const status = ok ? "ok" : warn ? "warn" : "crit";
  return (
    <li className={`qc-node ${status}`}>
      <strong>{label}</strong>
      <span>{detail}</span>
    </li>
  );
}
