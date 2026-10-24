import type { Tone } from "@/components/ui";
import type { TaskKind, TaskStatus } from "@/lib/api";

// Label tugas (09-API-KONTRAK §7). Status "terlambat" ditandai backend lewat `overdue`.

export const TASK_STATUS: Record<TaskStatus, { label: string; tone: Tone }> = {
  baru: { label: "Baru", tone: "neutral" },
  dikerjakan: { label: "Dikerjakan", tone: "neutral" },
  dilaporkan: { label: "Perlu dinilai", tone: "warn" },
  selesai: { label: "Selesai", tone: "ok" },
  diminta_ulang: { label: "Diminta ulang", tone: "warn" },
  batal: { label: "Batal", tone: "neutral" },
};

export const TASK_KIND: Record<TaskKind, string> = {
  tindakan: "Tindakan",
  ambil_sampel: "Ambil sampel",
  catat_air: "Catat kimia air",
};

/** Tugas yang masih berjalan (belum selesai atau batal). */
export const isOpen = (status: TaskStatus) => status !== "selesai" && status !== "batal";
