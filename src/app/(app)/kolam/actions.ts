"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";

const pondSchema = z.object({
  id: z.string().min(1).max(100),
  pond_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{1,12}$/, "Pakai huruf, angka, atau tanda hubung (maks 12)."),
  system: z.enum(["intensif", "bioflok"], "Pilih sistem budidaya."),
  area_sqm: z.coerce
    .number("Luas harus angka.")
    .positive("Luas harus lebih dari 0.")
    .max(100_000, "Luas terlalu besar.")
    .nullable(),
});

export async function updatePond(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, ["pond_code", "system", "area_sqm"]);
  const parsed = pondSchema.safeParse({ ...values, id: formData.get("id"), area_sqm: values.area_sqm || null });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { id, ...body } = parsed.data;
  try {
    await withSession((token) => api.ponds.update(token, id, body));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}

export async function archivePond(_: FormState, formData: FormData): Promise<FormState> {
  const id = z.string().min(1).max(100).safeParse(formData.get("id"));
  if (!id.success) return { error: "Kolam tidak dikenali." };
  try {
    await withSession((token) => api.ponds.archive(token, id.data));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}
