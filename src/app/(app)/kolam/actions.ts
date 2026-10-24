"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  } catch (error) {
    return messageOf(error);
  }
  if (formData.get("back") === "1") redirect("/kolam");
  return { ok: true };
}

const cycleSchema = z
  .object({
    pond_id: z.string().min(1).max(100),
    cycle_number: z.coerce.number("Isi nomor siklus.").int("Nomor siklus bilangan bulat.").min(1).max(99),
    outcome: z.enum(["HARVEST_SUCCESS", "OUTBREAK", "EMERGENCY_HARVEST"], "Pilih hasil siklus."),
    actual_harvest_kg: z.coerce
      .number("Panen harus angka.")
      .min(0, "Panen tidak boleh negatif.")
      .max(200_000)
      .optional(),
    outbreak_date: z.iso.date("Isi tanggal wabah.").optional(),
    primary_suspect_pathogen: z.enum(["AHPND", "WSSV", "EHP", "Lainnya"]).optional(),
    notes: z.string().trim().max(500, "Catatan maksimal 500 huruf.").optional(),
  })
  .refine((d) => d.outcome === "HARVEST_SUCCESS" || d.outbreak_date, {
    path: ["outbreak_date"],
    message: "Isi tanggal wabah mulai terlihat.",
  });

/** Catat akhir siklus (panen/wabah) untuk kalibrasi model backend (F19). */
export async function recordCycle(_: FormState, formData: FormData): Promise<FormState> {
  const names = ["cycle_number", "outcome", "actual_harvest_kg", "outbreak_date", "primary_suspect_pathogen", "notes"];
  const values = valuesOf(formData, names);
  const blankToUndefined = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v || undefined]));
  const parsed = cycleSchema.safeParse({ ...blankToUndefined, pond_id: formData.get("pond_id") });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { outbreak_date, primary_suspect_pathogen, ...body } = parsed.data;
  const outbreak = body.outcome !== "HARVEST_SUCCESS";
  try {
    await withSession((token) =>
      api.cycles.record(token, {
        ...body,
        outbreak_date: outbreak ? outbreak_date : undefined,
        primary_suspect_pathogen: outbreak ? primary_suspect_pathogen : undefined,
      }),
    );
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
