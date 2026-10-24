"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fromLocalInput } from "@/lib/format";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";

const ref = z.string().min(1).max(100);
const optionalRef = ref.optional().or(z.literal("").transform(() => undefined));
const fields = {
  title: z.string().trim().min(3, "Judul minimal 3 huruf.").max(120, "Judul maksimal 120 huruf."),
  instruction: z.string().trim().min(5, "Tulis instruksi untuk teknisi.").max(2000, "Instruksi terlalu panjang."),
  due_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Isi tanggal dan jam jatuh tempo.")
    .transform(fromLocalInput),
  assignee_id: z.string().min(1, "Pilih teknisi.").max(100),
};

const createSchema = z.object({
  ...fields,
  pond_id: z.string().min(1, "Pilih kolam.").max(100),
  kind: z.enum(["tindakan", "ambil_sampel", "catat_air"], "Pilih jenis tugas."),
  source_sample_id: optionalRef,
  source_alert_id: optionalRef,
});

const FIELDS = ["pond_id", "assignee_id", "kind", "title", "instruction", "due_at"];

export async function createTask(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, FIELDS);
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  try {
    await withSession((token) => api.tasks.create(token, parsed.data));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}

const editSchema = z.object({ ...fields, id: ref });

export async function editTask(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, ["assignee_id", "title", "instruction", "due_at"]);
  const parsed = editSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { id, ...body } = parsed.data;
  try {
    await withSession((token) => api.tasks.update(token, id, body));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}

const reviewSchema = z
  .object({
    id: ref,
    status: z.enum(["selesai", "diminta_ulang", "batal"]),
    owner_note: z.string().trim().max(1000, "Catatan maksimal 1000 huruf.").optional(),
  })
  .refine((d) => d.status !== "diminta_ulang" || (d.owner_note?.length ?? 0) >= 3, {
    path: ["owner_note"],
    message: "Tulis apa yang perlu diperbaiki teknisi.",
  });

/** Tutup, minta ulang (catatan wajib), atau batalkan tugas. */
export async function reviewTask(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, ["owner_note"]);
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { id, status, owner_note } = parsed.data;
  try {
    await withSession((token) => api.tasks.update(token, id, { status, owner_note: owner_note || undefined }));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
