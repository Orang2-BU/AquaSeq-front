"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { messageOf, type FormState } from "@/lib/forms";

const ref = z.string().min(1).max(100);
const memberSchema = z.object({ farm_id: ref, user_id: ref });

async function run(call: (token: string) => Promise<unknown>): Promise<FormState> {
  try {
    await withSession(call);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return messageOf(error);
  }
}

export async function setMemberActive(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = memberSchema.extend({ active: z.enum(["1", "0"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Teknisi tidak dikenali." };
  const { farm_id, user_id, active } = parsed.data;
  return run((token) => api.members.update(token, farm_id, user_id, { active: active === "1" }));
}

export async function assignPonds(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = memberSchema.extend({ pond_ids: z.array(ref).max(200) }).safeParse({
    farm_id: formData.get("farm_id"),
    user_id: formData.get("user_id"),
    pond_ids: formData.getAll("pond_ids"),
  });
  if (!parsed.success) return { error: "Pilihan kolam tidak dikenali." };
  const { farm_id, user_id, pond_ids } = parsed.data;
  return run((token) => api.members.assignPonds(token, farm_id, user_id, pond_ids));
}

export async function revokeInvitation(_: FormState, formData: FormData): Promise<FormState> {
  const id = ref.safeParse(formData.get("id"));
  if (!id.success) return { error: "Undangan tidak dikenali." };
  return run((token) => api.invitations.revoke(token, id.data));
}
