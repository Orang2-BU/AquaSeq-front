import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { api, type SampleFeatures } from "@/lib/api";
import { getActiveFarms, loadEntity } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDate, formatNumber } from "@/lib/format";
import { SUBSCORES, formatProbability, rejectedReason, riskOf } from "@/lib/risk";
import { WATER_PARAMS, outOfRange } from "@/lib/water";
import { PageSkeleton } from "@/components/app/page-parts";
import { Plate } from "@/components/app/plate";
import { RiskBadge } from "@/components/app/risk-badge";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Rincian skor" };

const TARGETS: { key: keyof SampleFeatures; target: string; label: string; copies?: "ahpnd" | "wssv" | "ehp" }[] = [
  { key: "ct_ahpnd", target: "pirA", label: "AHPND (pirA)", copies: "ahpnd" },
  { key: "ct_wssv", target: "vp28", label: "WSSV (vp28)", copies: "wssv" },
  { key: "ct_ehp", target: "swp1", label: "EHP (swp1)", copies: "ehp" },
  { key: "ct_amoa", target: "amoA", label: "Bakteri nitrifikasi (amoA)" },
  { key: "ct_16s", target: "16S", label: "Total bakteri (16S)" },
  { key: "ct_ppc", target: "PPC", label: "Kontrol proses (PPC)" },
];

export default function Page({ params }: PageProps<"/sampel/[sampleId]">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Rincian skor" />}>
        <Breakdown params={params} />
      </Suspense>
    </div>
  );
}

async function Breakdown({ params }: Pick<PageProps<"/sampel/[sampleId]">, "params">) {
  const { sampleId } = await params;
  const sample = await loadEntity((token) => api.samples.get(token, sampleId));
  const pond = await loadEntity((token) => api.ponds.get(token, sample.pond.id));
  const [{ farms }, options] = await Promise.all([getActiveFarms(), taskOptions(pond.farm_id)]);
  const simulated = farms.find((f) => f.id === pond.farm_id)?.provenance === "simulasi";
  const r = sample.sdri_result;
  const valid = r.status === "VALID";
  const maxSub = Math.max(4, r.s_qpcr, r.s_bio, r.s_chem);
  const features = { ...sample.features, nh3_mg_l: sample.nh3_mg_l, transparency_cm: null };
  const wells = (sample.meta?.wells ?? []).map((w) => ({ ...w, sample_code: sample.sample_code }));

  return (
    <>
      <Link className="back-link" href={`/kolam/${pond.id}`}>
        <Icon icon={ArrowLeft} size={16} />
        Kolam {pond.pond_code}
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <h1>
            Rincian skor <span className="mono-large">{sample.sample_code}</span>
          </h1>
          <p>
            Kolam {pond.pond_code} · sampling {formatDate(sample.sampling_date)} · DOC {sample.cycle_day} · model{" "}
            {r.model_version}
          </p>
        </div>
        <div className="detail-score">
          <strong className="score-xl">{valid ? formatProbability(r.probability_pct) : "Ditolak"}</strong>
          <RiskBadge result={r} />
          {simulated && <Badge tone="warn">Data simulasi</Badge>}
        </div>
      </div>

      <div className="detail-actions">
        {sample.batch_id && (
          <Link className="button secondary" href={`/lab/unggahan/${sample.batch_id}`}>
            <Icon icon={FileSpreadsheet} />
            Buka unggahan
          </Link>
        )}
        {!valid && (
          <CreateTaskButton
            {...options}
            label="Tugaskan uji ulang"
            defaults={{
              pond_id: pond.id,
              kind: "ambil_sampel",
              title: `Ambil sampel ulang kolam ${pond.pond_code}`,
              instruction: r.recommendation,
              source_sample_id: sample.id,
            }}
          />
        )}
      </div>

      {!valid && (
        <section className="reject-box" role="status">
          <h2>Sampel ditolak: {rejectedReason(r.status)}</h2>
          <p>
            Ct PPC {formatNumber(sample.features.ct_ppc)} berada di luar rentang yang diterima backend, jadi hasil
            patogen tidak bisa dipercaya dan tidak diberi angka peluang. {r.recommendation}
          </p>
        </section>
      )}

      <ol className="chain">
        <li className="chain-step">
          <div className="chain-head">
            <span className="chain-index">1</span>
            <h2>Peluang wabah</h2>
          </div>
          <div className="chain-body">
            {valid ? (
              <p>
                <strong className="chain-value">{formatProbability(r.probability_pct)}</strong> · kelas{" "}
                {riskOf(r).label}. Backend mengubah nilai Z menjadi peluang 0-100% dengan fungsi logistik.
              </p>
            ) : (
              <p>Tidak dihitung karena gerbang PPC menolak sampel.</p>
            )}
            <p className="muted">{r.recommendation}</p>
          </div>
        </li>
        <li className="chain-step">
          <div className="chain-head">
            <span className="chain-index">2</span>
            <h2>Nilai Z (logit)</h2>
          </div>
          <div className="chain-body">
            <p>
              <strong className="chain-value mono-value">{valid ? formatNumber(r.z_score, 3) : "-"}</strong> · jumlah
              berbobot tiga subskor di bawah. Makin besar Z, makin tinggi peluang.
            </p>
          </div>
        </li>
        <li className="chain-step">
          <div className="chain-head">
            <span className="chain-index">3</span>
            <h2>Subskor</h2>
          </div>
          <ul className="chain-body subscore-list">
            {SUBSCORES.map((s) => (
              <li key={s.key}>
                <span className="subscore-name">
                  <strong>{s.label}</strong>
                  <span className="small muted">{s.meaning}</span>
                </span>
                <span className="bar-track" aria-hidden="true">
                  <span className="bar now" style={{ width: `${(r[s.key] / maxSub) * 100}%` }} />
                </span>
                <span className="bar-value mono-value">{formatNumber(r[s.key])}</span>
              </li>
            ))}
          </ul>
        </li>
        <li className="chain-step">
          <div className="chain-head">
            <span className="chain-index">4</span>
            <h2>Fitur sampel</h2>
          </div>
          <div className="chain-body feature-grid">
            <div className="table-card">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th scope="col">Target</th>
                    <th scope="col" className="numeric">
                      Ct rata-rata
                    </th>
                    <th scope="col" className="numeric">
                      Kopi/mL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TARGETS.map((t) => {
                    const ct = sample.features[t.key];
                    return (
                      <tr key={t.key}>
                        <td data-label="Target" className="table-title">
                          {t.label}
                        </td>
                        <td data-label="Ct rata-rata" className="numeric">
                          {ct === null ? <span className="muted">Undetermined</span> : formatNumber(ct)}
                        </td>
                        <td data-label="Kopi/mL" className="numeric">
                          {t.copies ? formatNumber(sample.copies_per_ml[t.copies], 0) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <dl className="kv-grid">
              {WATER_PARAMS.filter((p) => p.key !== "transparency_cm").map((p) => {
                const value = features[p.key];
                return (
                  <div key={p.key}>
                    <dt>{p.label}</dt>
                    <dd className={outOfRange(p, value) ? "risk-high" : undefined}>
                      {formatNumber(value, p.digits)} <span className="unit">{p.unit}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </li>
        <li className="chain-step">
          <div className="chain-head">
            <span className="chain-index">5</span>
            <h2>Well di plate</h2>
          </div>
          <div className="chain-body">
            {wells.length === 0 ? (
              <p className="muted">Data well tidak tersedia untuk sampel ini.</p>
            ) : (
              <>
                <div className="table-card">
                  <table className="data-table compact">
                    <thead>
                      <tr>
                        <th scope="col">Well</th>
                        <th scope="col">Target</th>
                        <th scope="col" className="numeric">
                          Ct
                        </th>
                        <th scope="col" className="numeric">
                          Tm
                        </th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wells.map((w) => (
                        <tr key={w.position}>
                          <td data-label="Well" className="table-title mono">
                            {w.position}
                          </td>
                          <td data-label="Target">{w.target}</td>
                          <td data-label="Ct" className="numeric">
                            {w.ct === null ? <span className="muted">Undetermined</span> : formatNumber(w.ct)}
                          </td>
                          <td data-label="Tm" className="numeric">
                            {w.tm === null ? "-" : `${formatNumber(w.tm, 1)} °C`}
                          </td>
                          <td data-label="Status">
                            {w.excluded_reason ? `Dikeluarkan: ${w.excluded_reason}` : "Dipakai"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Plate wells={wells} />
              </>
            )}
          </div>
        </li>
      </ol>

      <p className="calibration-note small muted">
        Model {r.model_version} memakai koefisien awal dan akan dikalibrasi dari data hasil siklus tambak. Skor ini alat
        bantu keputusan, bukan diagnosis resmi.
      </p>
    </>
  );
}
