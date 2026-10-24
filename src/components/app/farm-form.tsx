"use client";

import { useActionState, useEffect, useEffectEvent } from "react";
import type { Farm } from "@/lib/api";
import { saveFarm, type SavedFarm } from "@/app/(app)/lokasi/actions";
import { Field } from "@/components/ui/field";

/** Form lokasi tambak: tambah/ubah di halaman Lokasi dan langkah 1 onboarding. */
export function FarmForm({
  farm,
  activate = false,
  submitLabel,
  onSaved,
  children,
}: {
  farm?: Pick<Farm, "id" | "name" | "regency" | "address">;
  activate?: boolean;
  submitLabel: string;
  onSaved: (saved: { id: string; name: string }) => void;
  children?: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(saveFarm, {} as SavedFarm);
  // Panggil onSaved sekali per hasil simpan, walau induk membuat fungsi baru tiap render.
  const handleSaved = useEffectEvent(onSaved);
  useEffect(() => {
    if (state.ok && state.data) handleSaved(state.data);
  }, [state]);
  const values = state.values ?? { name: farm?.name ?? "", regency: farm?.regency ?? "", address: farm?.address ?? "" };
  return (
    <form action={action} className="auth-form" noValidate>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      {farm && <input type="hidden" name="id" value={farm.id} />}
      {activate && <input type="hidden" name="activate" value="1" />}
      <Field name="name" label="Nama lokasi" required defaultValue={values.name} error={state.fieldErrors?.name} />
      <Field
        name="regency"
        label="Kabupaten atau kota"
        required
        defaultValue={values.regency}
        error={state.fieldErrors?.regency}
      />
      <Field
        name="address"
        label="Alamat (opsional)"
        autoComplete="street-address"
        defaultValue={values.address}
        error={state.fieldErrors?.address}
      />
      <div className="dialog-actions">
        {children}
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
