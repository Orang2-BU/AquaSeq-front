"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { messageOf, type FormState } from "@/lib/forms";

const MAX_BYTES = 2 * 1024 * 1024;

/** Unggah tabel kelimpahan 16S satu sampel; backend yang membaca CSV dan menghitung metrik. */
export async function uploadMicrobiome(_: FormState, formData: FormData): Promise<FormState> {
  const sampleId = String(formData.get("sample_id") ?? "");
  const source = String(formData.get("source") ?? "").trim();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { fieldErrors: { file: "Pilih berkas CSV kelimpahan." } };
  if (file.size > MAX_BYTES) return { fieldErrors: { file: "Berkas maksimal 2 MB." } };
  if (!/\.(csv|txt)$/i.test(file.name)) return { fieldErrors: { file: "Gunakan berkas .csv." } };
  if (source.length > 120) return { fieldErrors: { source: "Sumber maksimal 120 karakter." } };
  try {
    const csv = await file.text();
    await withSession((token) => api.samples.uploadMicrobiome(token, sampleId, { csv, source: source || undefined }));
    revalidatePath(`/sampel/${sampleId}`);
    return { ok: true };
  } catch (error) {
    const { error: message, fieldErrors } = messageOf(error);
    // Galat isi CSV dari backend ada di `fields.csv`; tampilkan di input berkas.
    return { error: message, fieldErrors: fieldErrors?.csv ? { file: fieldErrors.csv } : fieldErrors };
  }
}

/** Minta backend menulis (ulang) penjelasan ilmiah sampel; hasil diperiksa backend sebelum disimpan. */
export async function writeExplanation(_: FormState, formData: FormData): Promise<FormState> {
  const sampleId = String(formData.get("sample_id") ?? "");
  if (!sampleId) return { error: "Sampel tidak dikenali." };
  try {
    await withSession((token) => api.samples.explain(token, sampleId));
    revalidatePath(`/sampel/${sampleId}`);
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}
