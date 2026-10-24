"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { demoLogin, login } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";
import { Field } from "@/components/ui/field";

const empty: FormState = {};

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState(login, empty);
  const [demoState, demoAction, demoPending] = useActionState(demoLogin, empty);
  const busy = pending || demoPending;
  return (
    <>
      <form action={action} className="auth-form" noValidate>
        {state.error && (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        )}
        <input type="hidden" name="next" value={next} />
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
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
        <button className="button primary" type="submit" disabled={busy}>
          {pending ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
      <p className="auth-divider">atau coba tanpa daftar</p>
      <form action={demoAction} className="demo-actions">
        {demoState.error && (
          <p className="form-alert" role="alert">
            {demoState.error}
          </p>
        )}
        <button className="button secondary" type="submit" name="role" value="pemilik" disabled={busy}>
          Masuk sebagai demo pemilik
        </button>
        <button className="button secondary" type="submit" name="role" value="teknisi" disabled={busy}>
          Masuk sebagai demo teknisi
        </button>
      </form>
    </>
  );
}
