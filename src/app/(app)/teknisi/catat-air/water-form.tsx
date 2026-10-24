"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, ChevronDown, History, Save } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/format";
import { WATER_FIELDS, WATER_PARAMS, nh3Zone, outOfRange } from "@/lib/water";
import { Badge, Icon } from "@/components/ui";
import { saveWaterLog, type SavedLog } from "./actions";

type FieldKey = (typeof WATER_FIELDS)[number];
export type WaterValues = Record<FieldKey, number | null>;
export type LoggerPond = {
  id: string;
  pond_code: string;
  loggedToday: boolean;
  last: { at: string; by: string; values: WaterValues } | null;
};

const CORE: FieldKey[] = ["temp_c", "ph", "do_mg_l", "tan_mg_l"];
const EXTRA: FieldKey[] = ["no2_mg_l", "h2s_mg_l", "tom_mg_l", "alkalinity", "salinity_ppt", "transparency_cm"];
const param = (key: FieldKey) => WATER_PARAMS.find((p) => p.key === key) ?? { key, label: key, unit: "", digits: 2 };
const blank = () => Object.fromEntries(WATER_FIELDS.map((k) => [k, ""])) as Record<FieldKey, string>;
const toText = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));
const toNumber = (s: string) => (s.trim() === "" ? null : Number(s.replace(",", ".")));

/** Rentang acuan sebagai teks pendek ("≥ 4", "7,5-8,5", "≤ 1"). */
function acuan(key: FieldKey) {
  const p = param(key);
  const f = (n: number) => String(n).replace(".", ",");
  if ("min" in p && p.min !== undefined && "max" in p && p.max !== undefined) return `${f(p.min)}-${f(p.max)}`;
  if ("min" in p && p.min !== undefined) return `≥ ${f(p.min)}`;
  if ("max" in p && p.max !== undefined) return `≤ ${f(p.max)}`;
  return "";
}

/** P38: pilih kolam lalu isi ukuran harian. Setelah simpan, tampil NH₃ bebas dari backend. */
export function WaterLogger({ ponds, initialPond, now }: { ponds: LoggerPond[]; initialPond: string; now: string }) {
  const [pondId, setPondId] = useState(initialPond);
  const [round, setRound] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const pond = ponds.find((p) => p.id === pondId) ?? ponds[0];
  const done = (id: string) => saved.includes(id) || ponds.find((p) => p.id === id)?.loggedToday;
  const nextPond = ponds.find((p) => p.id !== pond.id && !done(p.id));

  return (
    <>
      <fieldset className="pond-chips">
        <legend className="field-label">Kolam</legend>
        {ponds.map((p) => (
          <label key={p.id} className={`pond-chip-option ${done(p.id) ? "logged" : ""}`}>
            <input
              type="radio"
              name="pond_choice"
              value={p.id}
              checked={p.id === pond.id}
              onChange={() => {
                setPondId(p.id);
                setRound((r) => r + 1);
              }}
            />
            <span>
              {done(p.id) && <Icon icon={Check} size={14} />}
              {p.pond_code}
            </span>
          </label>
        ))}
      </fieldset>
      <p className="small muted chip-legend">
        <Icon icon={Check} size={12} /> sudah dicatat hari ini
      </p>
      <WaterForm
        key={`${pond.id}-${round}`}
        pond={pond}
        now={now}
        nextPond={nextPond}
        onSaved={() => setSaved((s) => [...s, pond.id])}
        onNext={(id) => {
          setPondId(id);
          setRound((r) => r + 1);
        }}
      />
    </>
  );
}

function WaterForm({
  pond,
  now,
  nextPond,
  onSaved,
  onNext,
}: {
  pond: LoggerPond;
  now: string;
  nextPond: LoggerPond | undefined;
  onSaved: () => void;
  onNext: (pondId: string) => void;
}) {
  const [state, action, pending] = useActionState(async (prev: SavedLog, data: FormData) => {
    const result = await saveWaterLog(prev, data);
    if (result.ok) onSaved();
    return result;
  }, {} as SavedLog);
  const [values, setValues] = useState<Record<FieldKey, string>>(() => ({ ...blank(), ...state.values }));
  const errors = state.fieldErrors ?? {};
  const last = pond.last;

  if (state.ok && state.data) {
    const log = state.data;
    const zone = nh3Zone(log.nh3_mg_l);
    return (
      <section className="water-result" role="status" aria-labelledby="result-title">
        <h2 id="result-title">
          <Icon icon={Check} /> Catatan kolam {pond.pond_code} tersimpan
        </h2>
        <div className="nh3">
          <span className="small muted">NH₃ bebas (dihitung server analisis)</span>
          <strong>
            {formatNumber(log.nh3_mg_l, 3)} <span className="unit">mg/L</span>
          </strong>
          <Badge tone={zone.tone}>{zone.label}</Badge>
        </div>
        <dl className="kv-strip">
          {CORE.map((key) => {
            const p = param(key);
            return (
              <div key={key}>
                <dt>{p.label}</dt>
                <dd className={outOfRange(p, log[key]) ? "risk-high" : undefined}>
                  {formatNumber(log[key], p.digits)} <span className="unit">{p.unit}</span>
                </dd>
              </div>
            );
          })}
        </dl>
        <div className="water-result-actions">
          {nextPond ? (
            <button type="button" className="button primary" onClick={() => onNext(nextPond.id)}>
              Catat kolam {nextPond.pond_code}
            </button>
          ) : (
            <p className="small muted">Semua kolammu sudah dicatat hari ini.</p>
          )}
          <Link className="button secondary" href="/teknisi">
            Ke tugas saya
          </Link>
        </div>
      </section>
    );
  }

  const field = (key: FieldKey, big: boolean) => {
    const p = param(key);
    const number = toNumber(values[key]);
    const warn = number !== null && !Number.isNaN(number) && outOfRange(p, number);
    const error = errors[key];
    const id = `w-${key}`;
    return (
      <div key={key} className={`water-field ${big ? "big" : ""} ${warn ? "warn" : ""}`}>
        <label htmlFor={id}>
          {p.label} {p.unit && <span className="unit">{p.unit}</span>}
        </label>
        <input
          id={id}
          name={key}
          inputMode="decimal"
          autoComplete="off"
          value={values[key]}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          required={big}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-hint`}
        />
        <p id={`${id}-hint`} className={error ? "form-error" : warn ? "water-warn" : "form-hint"}>
          {error ?? (warn ? `Di luar acuan (${acuan(key)})` : acuan(key) ? `Acuan ${acuan(key)}` : " ")}
        </p>
      </div>
    );
  };

  return (
    <form action={action} className="water-form" noValidate>
      <input type="hidden" name="pond_id" value={pond.id} />
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <div className="water-last">
        <Icon icon={History} size={16} />
        <span>
          {last ? `Catatan terakhir ${formatDateTime(last.at)} oleh ${last.by}` : "Belum ada catatan untuk kolam ini."}
        </span>
        {last && (
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              setValues(
                Object.fromEntries(WATER_FIELDS.map((k) => [k, toText(last.values[k])])) as Record<FieldKey, string>,
              )
            }
          >
            Pakai nilai kemarin
          </button>
        )}
      </div>
      <div className="water-grid">{CORE.map((k) => field(k, true))}</div>
      <details className="water-extra">
        <summary>
          Parameter tambahan (opsional) <Icon icon={ChevronDown} size={16} />
        </summary>
        <div className="water-grid small">{EXTRA.map((k) => field(k, false))}</div>
      </details>
      <div className="form-field">
        <label className="field-label" htmlFor="measured_at">
          Waktu ukur
        </label>
        <input
          id="measured_at"
          name="measured_at"
          type="datetime-local"
          defaultValue={state.values?.measured_at ?? now}
          aria-invalid={errors.measured_at ? true : undefined}
        />
        {errors.measured_at && <p className="form-error">{errors.measured_at}</p>}
      </div>
      <div className="sticky-action">
        <button className="button primary wide" type="submit" disabled={pending}>
          <Icon icon={Save} />
          {pending ? "Menyimpan..." : `Simpan catatan kolam ${pond.pond_code}`}
        </button>
      </div>
    </form>
  );
}
