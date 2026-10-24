"use client";

import { useActionState } from "react";
import { inviteTechnician, type SentInvitation } from "@/app/(app)/mulai/actions";
import { Field } from "@/components/ui/field";

/** Undang teknisi lewat email dan bagi kolam: onboarding langkah 3 dan "Undang teknisi" di P25. */
export function InviteForm({
  farmId,
  ponds,
  secondary,
}: {
  farmId: string;
  ponds: { id: string; pond_code: string }[];
  /** Tombol kedua (lewati/tutup); menerima jumlah undangan yang sudah terkirim. */
  secondary: (sentCount: number) => React.ReactNode;
}) {
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
      <p className="muted">
        Teknisi menerima email berisi tautan untuk membuat sandi, lalu hanya melihat kolam yang kamu bagikan.
      </p>
      {sent.length > 0 && (
        <p className="form-success" role="status">
          Undangan terkirim ke {sent.join(", ")}. Kamu bisa mengundang teknisi lain.
        </p>
      )}
      {/* key: kosongkan form setelah undangan terkirim. */}
      <form key={sent.length} action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="farm_id" value={farmId} />
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
          {secondary(sent.length)}
          <button className="button primary" type="submit" disabled={pending}>
            {pending ? "Mengirim..." : "Kirim undangan"}
          </button>
        </div>
      </form>
    </>
  );
}
