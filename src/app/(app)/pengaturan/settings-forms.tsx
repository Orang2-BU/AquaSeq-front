"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/forms";
import { Field } from "@/components/ui/field";
import { changePassword, saveWaTargets, updateProfile } from "./actions";

function Alert({ state, success }: { state: FormState; success: string }) {
  if (state.error) {
    return (
      <p className="form-alert" role="alert">
        {state.error}
      </p>
    );
  }
  return state.ok ? (
    <p className="form-success" role="status">
      {success}
    </p>
  ) : null;
}

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, {} as FormState);
  const v = state.values ?? { full_name: name, phone_wa: phone };
  return (
    <form action={action} className="auth-form" noValidate>
      <Alert state={state} success="Profil tersimpan." />
      <Field
        name="full_name"
        label="Nama lengkap"
        autoComplete="name"
        required
        defaultValue={v.full_name}
        error={state.fieldErrors?.full_name}
      />
      <div className="form-field">
        <span className="field-label">Email</span>
        <p className="invite-email">{email}</p>
      </div>
      <Field
        name="phone_wa"
        label="Nomor WhatsApp (opsional)"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        hint="Dipakai untuk menerima pesan peringatan."
        defaultValue={v.phone_wa}
        error={state.fieldErrors?.phone_wa}
      />
      <div className="dialog-actions start">
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan profil"}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as FormState);
  return (
    // key: kosongkan isian sandi setelah berhasil.
    <form key={state.ok ? "done" : "edit"} action={action} className="auth-form" noValidate>
      <Alert state={state} success="Sandi diganti. Pakai sandi baru saat masuk berikutnya." />
      <Field
        name="current_password"
        label="Sandi lama"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.current_password}
      />
      <Field
        name="new_password"
        label="Sandi baru"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Minimal 8 karakter."
        error={state.fieldErrors?.new_password}
      />
      <Field
        name="confirm"
        label="Ulangi sandi baru"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <div className="dialog-actions start">
        <button className="button secondary" type="submit" disabled={pending}>
          {pending ? "Mengganti..." : "Ganti sandi"}
        </button>
      </div>
    </form>
  );
}

/** Format nomor 62xxx jadi 0xxx supaya mudah dibaca. */
const local = (wa: string | null) => (wa ? wa.replace(/^62/, "0") : "");

export function WaTargetsForm({ ponds }: { ponds: { id: string; pond_code: string; wa_target: string | null }[] }) {
  const [state, action, pending] = useActionState(saveWaTargets, {} as FormState);
  const saved = state.ok ? Number(state.values?.saved ?? 0) : null;
  return (
    <form action={action} className="auth-form" noValidate>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      {saved !== null && (
        <p className="form-success" role="status">
          {saved ? `${saved} nomor diperbarui.` : "Tidak ada perubahan."}
        </p>
      )}
      <div className="wa-grid">
        {ponds.map((pond) => {
          const name = `wa:${pond.id}`;
          return (
            <div key={pond.id}>
              <input type="hidden" name={`was:${pond.id}`} value={pond.wa_target ?? ""} />
              <Field
                name={name}
                label={`Kolam ${pond.pond_code}`}
                type="tel"
                inputMode="tel"
                placeholder="0812 3456 0917"
                defaultValue={state.ok ? local(pond.wa_target) : (state.values?.[name] ?? local(pond.wa_target))}
                error={state.fieldErrors?.[name]}
              />
            </div>
          );
        })}
      </div>
      <div className="dialog-actions start">
        <button className="button primary" type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan nomor WA"}
        </button>
      </div>
    </form>
  );
}
