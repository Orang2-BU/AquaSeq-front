"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { messageOf, type FormState } from "@/lib/forms";
import { primaryDriver } from "@/lib/risk";

const ref = z.string().min(1).max(100);

/** Tandai peringatan sudah ditangani; peringatan hilang dari daftar (09-API-KONTRAK §6). */
export async function ackAlert(_: FormState, formData: FormData): Promise<FormState> {
  const id = ref.safeParse(formData.get("id"));
  if (!id.success) return { error: "Peringatan tidak dikenali." };
  try {
    await withSession((token) => api.alerts.ack(token, id.data));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}

export type WhatsAppPreview = { message?: string; waTarget?: string | null; error?: string };

/** Teks peringatan WA dari backend (`/reports/whatsapp`) untuk sampel terakhir kolam. */
export async function previewWhatsApp(pondId: string): Promise<WhatsAppPreview> {
  const id = ref.safeParse(pondId);
  if (!id.success) return { error: "Kolam tidak dikenali." };
  try {
    const pond = await withSession((token) => api.ponds.get(token, id.data));
    const result = pond.latest_result;
    if (!result) return { error: "Kolam ini belum punya data eDNA." };
    const { whatsapp_message } = await withSession((token) =>
      api.reports.whatsapp(token, {
        pond_code: pond.pond_code,
        probability_pct: result.probability_pct,
        risk_class: result.risk_class,
        primary_driver: result.status === "VALID" ? primaryDriver(result) : "",
        action: result.recommendation,
      }),
    );
    return { message: whatsapp_message, waTarget: pond.wa_target };
  } catch (error) {
    return messageOf(error);
  }
}
