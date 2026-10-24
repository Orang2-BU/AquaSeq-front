"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";

const ref = z.string().min(1).max(100);

/** Teknisi mulai mengerjakan tugas (status → dikerjakan). */
export async function startTask(_: FormState, formData: FormData): Promise<FormState> {
  const id = ref.safeParse(formData.get("id"));
  if (!id.success) return { error: "Tugas tidak dikenali." };
  try {
    await withSession((token) => api.tasks.start(token, id.data));
    revalidatePath("/teknisi", "layout");
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}

const reading = (min: number, max: number, label: string) =>
  z.union([
    z.literal("").transform(() => undefined),
    z.coerce.number(`${label} harus angka.`).min(min, `${label} ${min}-${max}.`).max(max, `${label} ${min}-${max}.`),
  ]);

const reportSchema = z.object({
  id: ref,
  note: z.string().trim().min(5, "Ceritakan singkat apa yang dikerjakan.").max(1000, "Catatan maksimal 1000 huruf."),
  do_mg_l: reading(0, 20, "DO"),
  ph: reading(5, 10, "pH"),
  temp_c: reading(15, 40, "Suhu"),
  tan_mg_l: reading(0, 20, "TAN"),
});

const MEASURED = ["do_mg_l", "ph", "temp_c", "tan_mg_l"] as const;

/** Laporan teknisi: catatan, angka ukur opsional, maks 4 foto ≤ 1 MB (sudah dikompres di HP). */
export async function reportTask(_: FormState, formData: FormData): Promise<FormState> {
  const values = valuesOf(formData, ["note", ...MEASURED]);
  // Desimal koma (format Indonesia) diterima, sama seperti form catat air.
  const decimal = Object.fromEntries(MEASURED.map((k) => [k, values[k].replace(",", ".").trim()]));
  const parsed = reportSchema.safeParse({ ...values, ...decimal, id: formData.get("id") });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const photos = formData.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  if (photos.length > 4) return { fieldErrors: { photos: "Maksimal 4 foto." }, values };
  if (photos.some((p) => !p.type.startsWith("image/") || p.size > 1_000_000)) {
    return { fieldErrors: { photos: "Foto harus gambar dan maksimal 1 MB." }, values };
  }
  const { id, note, ...readings } = parsed.data;
  const measured = Object.fromEntries(
    Object.entries(readings).filter((entry): entry is [string, number] => entry[1] !== undefined),
  );
  try {
    await withSession((token) =>
      api.tasks.report(token, id, { note, measured: Object.keys(measured).length ? measured : null, photos }),
    );
    revalidatePath("/teknisi", "layout");
    return { ok: true };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
