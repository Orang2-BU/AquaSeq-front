"use client";

import { useActionState } from "react";
import { register } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";
import { Field } from "@/components/ui/field";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, {} as FormState);
  return (
    <form action={action} className="auth-form" noValidate>
      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}
      <Field
        name="full_name"
        label="Nama lengkap"
        autoComplete="name"
        required
        defaultValue={state.values?.full_name}
        error={state.fieldErrors?.full_name}
      />
      <Field
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
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
        {pending ? "Membuat akun..." : "Buat akun pemilik"}
      </button>
    </form>
  );
}
