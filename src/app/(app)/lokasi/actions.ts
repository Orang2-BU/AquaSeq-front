"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { FARM_COOKIE, cookieOptions } from "@/lib/auth/cookies";
import { withSession } from "@/lib/auth/session";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";

const YEAR = 365 * 24 * 60 * 60;

const farmSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(3, "Nama lokasi minimal 3 huruf.").max(80, "Nama lokasi maksimal 80 huruf."),
  regency: z.string().trim().min(3, "Isi kabupaten atau kota.").max(80, "Maksimal 80 huruf."),
  address: z.string().trim().max(200, "Alamat maksimal 200 huruf.").optional(),
  /** Onboarding: langsung jadikan lokasi aktif. */
  activate: z.literal("1").optional(),
});

export type SavedFarm = FormState<{ id: string; name: string }>;

/** Buat lokasi baru (tanpa id) atau ubah lokasi yang ada. */
export async function saveFarm(_: SavedFarm, formData: FormData): Promise<SavedFarm> {
  const values = valuesOf(formData, ["name", "regency", "address"]);
  const parsed = farmSchema.safeParse({
    ...values,
    id: formData.get("id") || undefined,
    activate: formData.get("activate") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { id, activate, ...input } = parsed.data;
  try {
    const farm = await withSession((token) =>
      id ? api.farms.update(token, id, input) : api.farms.create(token, input),
    );
    if (activate) (await cookies()).set(FARM_COOKIE, farm.id, cookieOptions(YEAR));
    revalidatePath("/", "layout");
    return { ok: true, data: { id: farm.id, name: farm.name } };
  } catch (error) {
    return { ...messageOf(error), values };
  }
}

export async function archiveFarm(_: FormState, formData: FormData): Promise<FormState> {
  const id = z.string().min(1).max(100).safeParse(formData.get("id"));
  if (!id.success) return { error: "Lokasi tidak dikenali." };
  try {
    await withSession((token) => api.farms.archive(token, id.data));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}
