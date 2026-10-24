"use client";

import { useActionState } from "react";
import { acceptInvitation } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";
import { Field } from "@/components/ui/field";

export function AcceptForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(acceptInvitation, {} as FormState);
  return (
    <form action={action} className="auth-form" noValidate>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <div className="form-field">
        <span className="field-label">Email</span>
        <p className="invite-email">{email}</p>
      </div>
      <Field
        name="full_name"
        label="Nama lengkap"
        autoComplete="name"
        required
        defaultValue={state.values?.full_name}
        error={state.fieldErrors?.full_name}
      />
      <Field
        name="password"
        label="Sandi"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Minimal 8 karakter."
        error={state.fieldErrors?.password}
      />
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Membuat akun..." : "Gabung dan masuk"}
      </button>
    </form>
  );
}
