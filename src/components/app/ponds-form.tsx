"use client";

import { useActionState, useEffect, useEffectEvent, useState } from "react";
import { parsePondCodes } from "@/lib/ponds";
import { addPonds, type CreatedPonds } from "@/app/(app)/mulai/actions";
import { Field } from "@/components/ui/field";

type CreatedPond = { id: string; pond_code: string };

/** Buat beberapa kolam sekaligus dari daftar kode: onboarding langkah 2 dan "Tambah kolam" di P14. */
export function PondsForm({
  farmId,
  onDone,
  children,
}: {
  farmId: string;
  onDone: (ponds: CreatedPond[]) => void;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(addPonds, {} as CreatedPonds);
  const [codes, setCodes] = useState("");
  const preview = parsePondCodes(codes).codes.length;
  const handleDone = useEffectEvent(onDone);
  useEffect(() => {
    if (state.ok && state.data) handleDone(state.data);
  }, [state]);
  return (
    <form action={action} className="auth-form" noValidate>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="farm_id" value={farmId} />
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
        {children}
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
  );
}
