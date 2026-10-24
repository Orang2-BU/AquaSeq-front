import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { ApiError } from "@/lib/api";

// Bentuk hasil Server Action untuk form (02-AGENT §3).

export type FormState<T = undefined> = {
  ok?: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

/** Ambil pesan galat pertama per field dari Zod. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) result[String(issue.path[0])] ??= issue.message;
  return result;
}

/** Galat backend jadi pesan form; detail galat jaringan tidak ditampilkan. */
export function messageOf(error: unknown): Pick<FormState, "error" | "fieldErrors"> {
  // redirect() (mis. sesi habis di withSession) dilempar sebagai error internal Next; jangan ditelan.
  unstable_rethrow(error);
  if (error instanceof ApiError) return { error: error.message, fieldErrors: error.fields };
  return { error: "Server analisis tidak terjangkau. Coba lagi sebentar lagi." };
}

/** Nilai teks form untuk diisi ulang setelah galat (tanpa sandi). */
export function valuesOf(formData: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? "")]));
}
