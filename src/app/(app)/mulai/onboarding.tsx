"use client";

import Link from "next/link";
import { useActionState, useEffect, useEffectEvent, useState } from "react";
import { Check } from "lucide-react";
import { parsePondCodes } from "@/lib/ponds";
import { FarmForm } from "@/components/app/farm-form";
import { Icon } from "@/components/ui";
import { Field } from "@/components/ui/field";
import { addPonds, inviteTechnician, type CreatedPonds, type SentInvitation } from "./actions";

const STEPS = ["Lokasi", "Kolam", "Undang teknisi"] as const;
type Pond = { id: string; pond_code: string };

/** P12: lokasi → kolam → undang teknisi (langkah 3 boleh dilewati). */
export function Onboarding() {
  const [step, setStep] = useState(0);
  const [farm, setFarm] = useState<{ id: string; name: string } | null>(null);
  const [ponds, setPonds] = useState<Pond[]>([]);
  return (
    <>
      <ol className="toggle flow-steps" aria-label="Langkah menyiapkan tambak">
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
      <section className="onboarding-card">
        {step === 0 && (
          <>
            <h2>Lokasi tambak</h2>
            <p className="muted">Satu lokasi berisi beberapa kolam dan teknisi. Lokasi lain bisa ditambah nanti.</p>
            <FarmForm
              activate
              submitLabel="Simpan dan lanjut"
              onSaved={(saved) => {
                setFarm(saved);
                setStep(1);
              }}
            />
          </>
        )}
        {step === 1 && farm && (
          <PondsStep
            farm={farm}
            onDone={(created) => {
              setPonds(created);
              setStep(2);
            }}
          />
        )}
        {step === 2 && farm && <InviteStep farm={farm} ponds={ponds} />}
      </section>
    </>
  );
}

function PondsStep({ farm, onDone }: { farm: { id: string; name: string }; onDone: (ponds: Pond[]) => void }) {
  const [state, action, pending] = useActionState(addPonds, {} as CreatedPonds);
  const [codes, setCodes] = useState("");
  const preview = parsePondCodes(codes).codes.length;
  const handleDone = useEffectEvent(onDone);
  useEffect(() => {
    if (state.ok && state.data) handleDone(state.data);
  }, [state]);
  return (
    <>
      <h2>Kolam di {farm.name}</h2>
      <p className="muted">Tulis kode kolam yang biasa dipakai di tambak, misalnya A1, A2, B1. Pisahkan dengan koma.</p>
      <form action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="farm_id" value={farm.id} />
        <div className="form-field">
          <label className="field-label" htmlFor="codes">
            Kode kolam
          </label>
          <textarea
            id="codes"
            name="codes"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="A1, A2, A3, B1, B2"
            aria-invalid={state.fieldErrors?.codes ? true : undefined}
            aria-describedby="codes-help"
          />
          <p id="codes-help" className={state.fieldErrors?.codes ? "form-error" : "form-hint"}>
            {state.fieldErrors?.codes ?? `${preview} kolam akan dibuat.`}
          </p>
        </div>
        <div className="form-field">
          <label className="field-label" htmlFor="system">
            Sistem budidaya
          </label>
          <select id="system" name="system" defaultValue={state.values?.system ?? "intensif"}>
            <option value="intensif">Intensif</option>
            <option value="bioflok">Bioflok</option>
          </select>
        </div>
        <Field
          name="area_sqm"
          label="Luas per kolam, m² (opsional)"
          inputMode="decimal"
          defaultValue={state.values?.area_sqm}
          error={state.fieldErrors?.area_sqm}
        />
        <div className="dialog-actions">
          {!state.ok && state.data && state.data.length > 0 && (
            <button type="button" className="button secondary" onClick={() => onDone(state.data ?? [])}>
              Lanjut dengan {state.data.length} kolam
            </button>
          )}
          <button className="button primary" type="submit" disabled={pending || preview === 0}>
            {pending ? "Membuat kolam..." : `Buat ${preview} kolam`}
          </button>
        </div>
      </form>
    </>
  );
}

function InviteStep({ farm, ponds }: { farm: { id: string; name: string }; ponds: Pond[] }) {
  // Daftar email terkirim ikut di state action, jadi tidak perlu effect.
  const [state, action, pending] = useActionState(
    async (prev: SentInvitation & { sent: string[] }, formData: FormData) => {
      const result = await inviteTechnician(prev, formData);
      return { ...result, sent: result.ok && result.data ? [...prev.sent, result.data.email] : prev.sent };
    },
    { sent: [] },
  );
  const { sent } = state;
  return (
    <>
      <h2>Undang teknisi</h2>
      <p className="muted">
        Teknisi menerima email berisi tautan untuk membuat sandi, lalu hanya melihat kolam yang kamu bagikan.
      </p>
      {sent.length > 0 && (
        <p className="form-success" role="status">
          Undangan terkirim ke {sent.join(", ")}. Undang teknisi lain atau lanjut ke dasbor.
        </p>
      )}
      {/* key: kosongkan form setelah undangan terkirim. */}
      <form key={sent.length} action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="farm_id" value={farm.id} />
        <Field
          name="email"
          label="Email teknisi"
          type="email"
          inputMode="email"
          autoComplete="off"
          defaultValue={state.ok ? "" : state.values?.email}
          error={state.fieldErrors?.email}
        />
        {ponds.length > 0 && (
          <fieldset className="pond-picker">
            <legend className="field-label">Kolam yang dipegang</legend>
            {ponds.map((pond) => (
              <label key={pond.id} className="pond-chip">
                <input type="checkbox" name="pond_ids" value={pond.id} />
                <span>{pond.pond_code}</span>
              </label>
            ))}
          </fieldset>
        )}
        <div className="dialog-actions">
          <Link className="button secondary" href="/dasbor">
            {sent.length ? "Selesai, ke dasbor" : "Lewati, nanti saja"}
          </Link>
          <button className="button primary" type="submit" disabled={pending}>
            {pending ? "Mengirim..." : "Kirim undangan"}
          </button>
        </div>
      </form>
    </>
  );
}
