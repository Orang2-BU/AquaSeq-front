import Link from "next/link";
import { ChevronRight, Droplets, TestTube, Wrench, type LucideIcon } from "lucide-react";
import type { Task, TaskKind } from "@/lib/api";
import { TASK_KIND, TASK_STATUS, dueLabel } from "@/lib/tasks";
import { Badge, Icon } from "@/components/ui";

export const KIND_ICON: Record<TaskKind, LucideIcon> = {
  tindakan: Wrench,
  ambil_sampel: TestTube,
  catat_air: Droplets,
};

/** Kartu tugas di HP teknisi (08-DESIGN pola "Tugas teknisi"): ikon jenis, judul, kolam, pill waktu di kanan. */
export function TechTaskCard({ task }: { task: Task }) {
  const status = TASK_STATUS[task.status];
  return (
    <Link className={`tech-task ${task.overdue ? "overdue" : ""}`} href={`/teknisi/tugas/${task.id}`}>
      <span className={`tech-task-icon kind-${task.kind}`}>
        <Icon icon={KIND_ICON[task.kind]} size={20} />
      </span>
      <span className="tech-task-main">
        <span className="tech-task-title">{task.title}</span>
        <span className="tech-task-meta">
          Kolam <span className="mono">{task.pond.pond_code}</span> · {TASK_KIND[task.kind]}
        </span>
        {(task.status === "diminta_ulang" || task.status === "dikerjakan") && (
          <span className="tech-task-status">
            <Badge tone={status.tone}>{status.label}</Badge>
            {task.status === "diminta_ulang" && task.owner_note && <span className="small">{task.owner_note}</span>}
          </span>
        )}
      </span>
      <span className="tech-task-due">{task.overdue ? `Terlambat · ${dueLabel(task)}` : dueLabel(task)}</span>
      <Icon icon={ChevronRight} size={18} className="tech-task-chevron" />
    </Link>
  );
}
