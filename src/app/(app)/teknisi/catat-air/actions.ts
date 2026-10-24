"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api, type WaterLog } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { fromLocalInput } from "@/lib/format";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";
import { WATER_FIELDS } from "@/lib/water";

const number = (min: number, max: number, label: string, unit: string) =>
  z.coerce
    .number(`${label} harus angka.`)
    .min(min, `${label} ${min}-${max} ${unit}.`.trim())
    .max(max, `${label} ${min}-${max} ${unit}.`.trim());
const optional = (min: number, max: number, label: string, unit: string) =>
  z.union([z.literal("").transform(() => undefined), number(min, max, label, unit)]);

// Rentang sama dengan validasi backend (09-API-KONTRAK §5); desimal koma diterima.
const schema = z.object({
  pond_id: z.string().min(1, "Pilih kolam.").max(100),
  measured_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Isi waktu ukur.")
    .transform(fromLocalInput),
  temp_c: number(15, 40, "Suhu", "°C"),
  ph: number(5, 10, "pH", ""),
  do_mg_l: number(0, 20, "DO", "mg/L"),
  tan_mg_l: number(0, 20, "TAN", "mg/L"),
  no2_mg_l: optional(0, 20, "NO₂", "mg/L"),
  h2s_mg_l: optional(0, 2, "H₂S", "mg/L"),
  tom_mg_l: optional(0, 500, "TOM", "mg/L"),
  alkalinity: optional(0, 400, "Alkalinitas", "mg/L"),
  salinity_ppt: optional(0, 60, "Salinitas", "ppt"),
  transparency_cm: optional(0, 200, "Kecerahan", "cm"),
});

export type SavedLog = FormState<WaterLog>;

/** Simpan catatan kimia air; NH₃ bebas dari respons backend ditampilkan sesudahnya. */
export async function saveWaterLog(_: SavedLog, formData: FormData): Promise<SavedLog> {
  const values = valuesOf(formData, ["pond_id", "measured_at", ...WATER_FIELDS]);
  const decimal = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.replace(",", ".").trim()]));
  const parsed = schema.safeParse(decimal);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { pond_id, ...body } = parsed.data;
  if (Date.parse(body.measured_at) > Date.now() + 10 * 60_000) {
    return { fieldErrors: { measured_at: "Waktu ukur tidak boleh di masa depan." }, values };
  }
  try {
    const log = await withSession((token) => api.ponds.logWater(token, pond_id, body));
    revalidatePath("/teknisi", "layout");
    return { ok: true, data: log };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}
