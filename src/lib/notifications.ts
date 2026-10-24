import type { Notifications, Role } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

type Item = Notifications["items"][number];

/** Halaman tujuan notifikasi sesuai peran (teknisi membuka tugas di area teknisi). */
export function notificationHref(item: Pick<Item, "entity" | "entity_id">, role: Role): string {
  const id = encodeURIComponent(item.entity_id);
  if (item.entity === "task") return role === "teknisi" ? `/teknisi/tugas/${id}` : `/tugas/${id}`;
  if (item.entity === "pond") return `/kolam/${id}`;
  if (item.entity === "sample") return `/sampel/${id}`;
  return `/lab/unggahan/${id}`;
}

export const NOTIFICATION_KIND: Record<Item["kind"], string> = {
  tugas_baru: "Tugas baru",
  laporan_masuk: "Laporan masuk",
  peringatan_baru: "Peringatan baru",
  tugas_selesai: "Tugas selesai",
  tugas_terlambat: "Tugas terlambat",
};

/** Ringkasan untuk panel lonceng di top bar. */
export function shellNotification(item: Item) {
  return {
    id: item.id,
    title: item.title,
    subtitle: `${NOTIFICATION_KIND[item.kind]} · ${formatDateTime(item.created_at)}`,
    unread: !item.read_at,
  };
}
