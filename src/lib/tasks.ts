import type { Tone } from "@/components/ui";
import type { Task, TaskKind, TaskStatus } from "@/lib/api";
import { dayOffset, formatTime } from "@/lib/format";

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

export type TaskBucket = "terlambat" | "hari_ini" | "mendatang" | "menunggu" | "selesai";

/** Kelompok tugas di Tugas saya (P36): terlambat, hari ini, mendatang, menunggu dinilai, selesai. */
export function bucketOf(task: Task): TaskBucket {
  if (task.status === "dilaporkan") return "menunggu";
  if (!isOpen(task.status)) return "selesai";
  if (task.overdue) return "terlambat";
  return dayOffset(task.due_at) <= 0 ? "hari_ini" : "mendatang";
}

/** Label waktu ringkas di pill tugas: "16.00", "Besok 07.00", "Sen 09.00". */
export function dueLabel(task: Pick<Task, "due_at">): string {
  const offset = dayOffset(task.due_at);
  const time = formatTime(task.due_at);
  if (offset === 0) return time;
  if (offset === 1) return `Besok ${time}`;
  if (offset === -1) return `Kemarin ${time}`;
  const day = new Date(task.due_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
  return `${day} ${time}`;
}

/** Hari jatuh tempo relatif hari ini (WIB): 0 hari ini, negatif sudah lewat. */
export const dayOffsetOf = (task: Pick<Task, "due_at">) => dayOffset(task.due_at);
