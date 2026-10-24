"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";

/** Nomor WA format internasional tanpa "+": 62 lalu 8-13 digit. Nomor 08xx diubah otomatis. */
const waNumber = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+/, "").replace(/^0/, "62"))
  .pipe(z.string().regex(/^62\d{8,13}$/, "Tulis nomor WA seperti 0812 3456 0917."));

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Nama minimal 3 huruf.").max(80, "Nama maksimal 80 huruf."),
  phone_wa: z.union([z.literal("").transform(() => null), waNumber]),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, ["full_name", "phone_wa"]);
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  try {
    await withSession((token) => api.auth.updateMe(token, parsed.data));
    revalidatePath("/", "layout");
    return { ok: true, values };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Isi sandi lama.").max(200),
    new_password: z.string().min(8, "Sandi baru minimal 8 karakter.").max(200),
    confirm: z.string().max(200),
  })
  .refine((d) => d.new_password === d.confirm, { path: ["confirm"], message: "Ulangi sandi baru dengan sama persis." });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const { current_password, new_password } = parsed.data;
  try {
    await withSession((token) => api.auth.changePassword(token, { current_password, new_password }));
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}

/** P34: nomor WA tujuan per kolam. Hanya kolam yang nilainya berubah yang disimpan. */
export async function saveWaTargets(_: FormState, formData: FormData): Promise<FormState> {
  const entries = [...formData.entries()].filter(([key]) => key.startsWith("wa:"));
  const fieldErrors: Record<string, string> = {};
  const changes: { pondId: string; wa: string | null }[] = [];
  for (const [key, raw] of entries) {
    const pondId = key.slice(3);
    const value = String(raw).trim();
    const before = String(formData.get(`was:${pondId}`) ?? "");
    const parsed = value === "" ? { success: true as const, data: null } : waNumber.safeParse(value);
    if (!parsed.success) fieldErrors[key] = parsed.error.issues[0]?.message ?? "Nomor WA tidak valid.";
    else if ((parsed.data ?? "") !== before) changes.push({ pondId, wa: parsed.data });
  }
  const values = Object.fromEntries(entries.map(([k, v]) => [k, String(v)]));
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };
  try {
    for (const change of changes) {
      await withSession((token) => api.ponds.update(token, change.pondId, { wa_target: change.wa }));
    }
    revalidatePath("/pengaturan/tambak");
    return { ok: true, values: { saved: String(changes.length) } };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
