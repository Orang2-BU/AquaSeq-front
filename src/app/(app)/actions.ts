"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FARM_COOKIE, cookieOptions } from "@/lib/auth/cookies";
import { getActiveFarms } from "@/lib/auth/session";

const YEAR = 365 * 24 * 60 * 60;

/** Ganti lokasi aktif. Hanya lokasi yang memang bisa diakses pengguna yang diterima. */
export async function selectFarm(farmId: string) {
  const id = z.string().min(1).max(100).parse(farmId);
  const { farms } = await getActiveFarms();
  if (!farms.some((f) => f.id === id)) return;
  (await cookies()).set(FARM_COOKIE, id, cookieOptions(YEAR));
  revalidatePath("/", "layout");
}
