import type { ComponentProps } from "react";

/** Input berlabel dengan pesan galat yang terhubung ke screen reader. */
export function Field({
  name,
  label,
  hint,
  error,
  ...props
}: { name: string; label: string; hint?: string; error?: string } & ComponentProps<"input">) {
  // Petunjuk diganti pesan galat saat ada galat, jadi hanya satu yang dirujuk.
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {hint && !error && (
        <p id={`${name}-hint`} className="form-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
