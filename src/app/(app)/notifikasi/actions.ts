"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api } from "@/lib/api";
import { roleOf } from "@/lib/auth/cookies";
import { getCurrentUser, withSession } from "@/lib/auth/session";
import { notificationHref } from "@/lib/notifications";

/** Buka notifikasi: tandai dibaca lalu pindah ke halaman entitasnya. */
export async function openNotification(formData: FormData) {
  const id = z.string().min(1).max(100).parse(formData.get("id"));
  const [{ items }, me] = await Promise.all([withSession((token) => api.notifications.list(token)), getCurrentUser()]);
  const item = items.find((n) => n.id === id);
  if (!item) redirect("/notifikasi");
  if (!item.read_at) await withSession((token) => api.notifications.read(token, { ids: [id] }));
  revalidatePath("/", "layout");
  redirect(notificationHref(item, roleOf(me)));
}

export async function readAllNotifications() {
  await withSession((token) => api.notifications.read(token, { all: true }));
  revalidatePath("/", "layout");
}
