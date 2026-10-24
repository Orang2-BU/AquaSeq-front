"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";
import { MAX_PONDS_PER_BATCH, parsePondCodes } from "@/lib/ponds";

export type CreatedPonds = FormState<{ id: string; pond_code: string }[]>;

const pondsSchema = z.object({
  farm_id: z.string().min(1).max(100),
  system: z.enum(["intensif", "bioflok"], "Pilih sistem budidaya."),
  area_sqm: z.coerce
    .number("Luas harus angka.")
    .positive("Luas harus lebih dari 0.")
    .max(100_000, "Luas terlalu besar.")
    .optional(),
});

/** Langkah 2 onboarding: buat beberapa kolam sekaligus dari daftar kode. */
export async function addPonds(_: CreatedPonds, formData: FormData): Promise<CreatedPonds> {
  const values = valuesOf(formData, ["codes", "system", "area_sqm"]);
  const parsed = pondsSchema.safeParse({
    ...values,
    farm_id: formData.get("farm_id"),
    area_sqm: values.area_sqm || undefined,
  });
  const { codes, invalid } = parsePondCodes(values.codes);
  const fieldErrors = parsed.success ? {} : fieldErrorsOf(parsed.error);
  if (invalid.length)
    fieldErrors.codes = `Kode tidak valid: ${invalid.join(", ")}. Pakai huruf, angka, atau tanda hubung (maks 12).`;
  else if (codes.length === 0) fieldErrors.codes = "Isi minimal satu kode kolam.";
  else if (codes.length > MAX_PONDS_PER_BATCH)
    fieldErrors.codes = `Maksimal ${MAX_PONDS_PER_BATCH} kolam sekali simpan.`;
  if (!parsed.success || Object.keys(fieldErrors).length) return { fieldErrors, values };

  const { farm_id, system, area_sqm } = parsed.data;
  const created: { id: string; pond_code: string }[] = [];
  const conflicts: string[] = [];
  try {
    for (const pond_code of codes) {
      try {
        const pond = await withSession((token) => api.ponds.create(token, farm_id, { pond_code, system, area_sqm }));
        created.push({ id: pond.id, pond_code: pond.pond_code });
      } catch (error) {
        if (!(error instanceof ApiError && error.code === "CONFLICT")) throw error;
        conflicts.push(pond_code);
      }
    }
  } catch (error) {
    return { ...messageOf(error), values };
  } finally {
    if (created.length) revalidatePath("/", "layout");
  }
  if (conflicts.length) {
    // Kolam yang berhasil tetap tersimpan; yang bentrok ditunjukkan supaya bisa diganti kodenya.
    return { data: created, error: `Kode sudah dipakai: ${conflicts.join(", ")}. Kolam lain sudah tersimpan.`, values };
  }
  return { ok: true, data: created };
}

export type SentInvitation = FormState<{ email: string }>;

const inviteSchema = z.object({
  farm_id: z.string().min(1).max(100),
  email: z.email("Format email belum benar.").max(254),
  pond_ids: z.array(z.string().max(100)).max(MAX_PONDS_PER_BATCH),
});

/** Undang teknisi lewat email dan bagi kolam (onboarding langkah 3 dan P25). */
export async function inviteTechnician(_: SentInvitation, formData: FormData): Promise<SentInvitation> {
  const values = valuesOf(formData, ["email"]);
  const parsed = inviteSchema.safeParse({
    farm_id: formData.get("farm_id"),
    email: values.email,
    pond_ids: formData.getAll("pond_ids"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { farm_id, ...body } = parsed.data;
  try {
    const invitation = await withSession((token) => api.invitations.create(token, farm_id, body));
    revalidatePath("/tim");
    return { ok: true, data: { email: invitation.email } };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
