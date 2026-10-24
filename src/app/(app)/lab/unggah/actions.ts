"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api, type BatchInput } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { MAX_CSV_BYTES, parseQpcr, summarize, toMetaWells } from "@/lib/csv/qpcr";
import { messageOf, type FormState } from "@/lib/forms";

const chem = (min: number, max: number) => z.number().min(min).max(max).nullable();
// Rentang sama dengan validasi backend (09-API-KONTRAK §5).
const chemistrySchema = z.object({
  temp_c: chem(15, 40),
  ph: chem(5, 10),
  do_mg_l: chem(0, 20),
  tan_mg_l: chem(0, 20),
  no2_mg_l: chem(0, 20),
  h2s_mg_l: chem(0, 2),
  tom_mg_l: chem(0, 500),
  alkalinity: chem(0, 400),
  salinity_ppt: chem(0, 60),
});

const column = z.number().int().min(0).max(200).nullable();

const payloadSchema = z.object({
  csv: z.string().min(1).max(MAX_CSV_BYTES),
  columns: z.object({ well: column, sample_code: column, target: column, ct: column, tm: column }),
  excluded: z.record(z.string().regex(/^[A-H](?:[1-9]|1[0-2])$/), z.string().trim().min(2).max(100)),
  run: z.object({
    lab_name: z.string().trim().min(2, "Isi nama lab.").max(120),
    instrument: z.string().trim().min(2, "Isi nama alat.").max(120),
    tested_at: z.iso.date("Isi tanggal uji."),
    file_name: z.string().trim().min(1).max(200),
  }),
  samples: z
    .array(
      z.object({
        sample_code: z.string().min(1).max(60),
        pond_id: z.string().min(1).max(100),
        sampling_date: z.iso.date(),
        water_log_id: z.string().max(100).nullable(),
        chemistry: chemistrySchema,
      }),
    )
    .min(1, "Pilih kolam untuk minimal satu sampel.")
    .max(96),
});

export type UploadPayload = z.input<typeof payloadSchema>;

const DAY_MS = 86_400_000;

/** Langkah terakhir P17: validasi ulang CSV di server, ringkas Ct, kirim satu batch atomik ke backend. */
export async function submitBatch(_: FormState, formData: FormData): Promise<FormState> {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Data unggahan rusak. Muat ulang halaman lalu coba lagi." };
  }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data unggahan belum lengkap." };
  const { csv, columns, excluded, run, samples } = parsed.data;

  const result = parseQpcr(csv, columns);
  if (result.errors.length) return { error: `CSV masih punya ${result.errors.length} baris bermasalah.` };
  const qc = new Map(summarize(result.wells, excluded).map((s) => [s.sample_code, s]));

  const { current } = await getActiveFarms();
  if (!current) return { error: "Pilih lokasi aktif dulu." };
  const ponds = await withSession((token) => api.ponds.list(token, current.id));

  const body: BatchInput = { run, samples: [] };
  for (const s of samples) {
    const summary = qc.get(s.sample_code);
    const pond = ponds.find((p) => p.id === s.pond_id);
    if (!summary) return { error: `Sampel ${s.sample_code} tidak ada di CSV.` };
    if (!pond) return { error: `Kolam untuk sampel ${s.sample_code} tidak ditemukan di lokasi ini.` };
    if (summary.ct.ct_ppc === null) {
      return { error: `Sampel ${s.sample_code} tidak punya Ct PPC. Tambahkan well PPC atau jangan kirim sampel ini.` };
    }
    const doc = pond.stocked_at
      ? Math.max(0, Math.round((Date.parse(s.sampling_date) - Date.parse(pond.stocked_at)) / DAY_MS))
      : 0;
    body.samples.push({
      pond_id: pond.id,
      sample_code: s.sample_code,
      sampling_date: s.sampling_date,
      cycle_day: doc,
      source_type: "GSI_LAB",
      features: { ...summary.ct, ct_ppc: summary.ct.ct_ppc, ...s.chemistry },
      meta: {
        wells: toMetaWells(result.wells, s.sample_code, excluded),
        standards: result.standards,
        water_log_id: s.water_log_id,
      },
    });
  }

  let batchId: string;
  try {
    batchId = (await withSession((token) => api.samples.createBatch(token, body))).batch_id;
    revalidatePath("/", "layout");
  } catch (error) {
    return messageOf(error);
  }
  redirect(`/lab/unggahan/${batchId}`);
}
