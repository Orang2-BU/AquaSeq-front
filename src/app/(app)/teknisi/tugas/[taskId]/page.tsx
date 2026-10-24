import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Check, Clock, Droplets, Hourglass } from "lucide-react";
import { api, type TaskDetail } from "@/lib/api";
import { loadEntity, withSession } from "@/lib/auth/session";
import { formatDateTime, formatNumber } from "@/lib/format";
import { formatProbability, riskOf } from "@/lib/risk";
import { TASK_KIND, dueLabel } from "@/lib/tasks";
import { WATER_PARAMS } from "@/lib/water";
import { PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { KIND_ICON } from "@/components/app/tech-task-card";
import { Icon } from "@/components/ui";
import { ReportForm, StartTask } from "./task-work";

export const metadata: Metadata = { title: "Kerjakan tugas" };

const STEPS = [
  { status: "baru", label: "Diterima" },
  { status: "dikerjakan", label: "Dikerjakan" },
  { status: "dilaporkan", label: "Dilaporkan" },
  { status: "selesai", label: "Selesai" },
] as const;

export default function Page({ params }: PageProps<"/teknisi/tugas/[taskId]">) {
  return (
    <div className="page-enter tech-page">
      <Suspense fallback={<PageSkeleton title="Kerjakan tugas" />}>
        <WorkTask params={params} />
      </Suspense>
    </div>
  );
}

/** Posisi status di langkah: diminta ulang kembali ke "Dikerjakan". */
const stepIndex = (status: TaskDetail["status"]) =>
  status === "diminta_ulang"
    ? 1
    : Math.max(
        0,
        STEPS.findIndex((s) => s.status === status),
      );

async function WorkTask({ params }: Pick<PageProps<"/teknisi/tugas/[taskId]">, "params">) {
  const { taskId } = await params;
  const task = await loadEntity((token) => api.tasks.get(token, taskId));
  const sample = task.source_sample_id
    ? await withSession((token) => api.samples.get(token, task.source_sample_id ?? "")).catch(() => null)
    : null;
  const result = sample?.sdri_result;
  const current = stepIndex(task.status);
  const canStart = task.status === "baru";
  const canReport = task.status === "dikerjakan" || task.status === "diminta_ulang";
  const measuredLabel = (key: string) => WATER_PARAMS.find((p) => p.key === key);

  return (
    <>
      <Link className="back-link" href="/teknisi">
        <Icon icon={ArrowLeft} size={16} />
        Tugas saya
      </Link>

      <header className="tech-task-header">
        <span className={`tech-task-icon kind-${task.kind}`}>
          <Icon icon={KIND_ICON[task.kind]} size={22} />
        </span>
        <div>
          <p className="tech-task-meta">
            Kolam <span className="mono">{task.pond.pond_code}</span> · {TASK_KIND[task.kind]}
          </p>
          <h1>{task.title}</h1>
          <p className={`tech-due ${task.overdue ? "overdue" : ""}`}>
            <Icon icon={Clock} size={16} />
            {task.overdue ? "Terlambat, batas " : "Batas "}
            {dueLabel(task)} · dari {task.created_by.full_name}
          </p>
        </div>
      </header>

      <ol className="status-steps" aria-label="Status tugas">
        {STEPS.map((step, i) => (
          <li
            key={step.status}
            className={i < current ? "done" : i === current ? "current" : undefined}
            aria-current={i === current ? "step" : undefined}
          >
            <span className="status-dot-step">{i < current && <Icon icon={Check} size={12} />}</span>
            {step.label}
          </li>
        ))}
      </ol>

      {task.status === "diminta_ulang" && task.owner_note && (
        <section className="owner-note-box" role="status">
          <h2>Diminta ulang oleh pemilik</h2>
          <p>{task.owner_note}</p>
        </section>
      )}

      <section className="instruction-card big" aria-labelledby="instruction-title">
        <h2 id="instruction-title">Instruksi</h2>
        <p className="instruction-text">{task.instruction}</p>
      </section>

      {result && (
        <section className={`reason-box tone-${riskOf(result).tone}`} aria-labelledby="reason-title">
          <div className="reason-head">
            <h2 id="reason-title">Alasan dari hasil lab</h2>
            <RiskBadge result={result} />
          </div>
          <p>
            Sampel {sample.sample_code}
            {result.status === "VALID"
              ? `: peluang wabah ${formatProbability(result.probability_pct)}.`
              : " ditolak lab."}{" "}
            {result.recommendation}
          </p>
        </section>
      )}

      {task.kind === "catat_air" && canReport && (
        <Link className="tech-inline-link" href={`/teknisi/catat-air?kolam=${task.pond.id}`}>
          <Icon icon={Droplets} />
          Buka form catat kimia air kolam {task.pond.pond_code}
        </Link>
      )}

      {task.status === "dilaporkan" && (
        <section className="waiting-box" role="status">
          <Icon icon={Hourglass} />
          <p>Laporan terkirim. Menunggu {task.created_by.full_name} menilai.</p>
        </section>
      )}

      {task.reports.length > 0 && (
        <section className="tech-section" aria-labelledby="reports-title">
          <div className="tech-section-head">
            <h2 id="reports-title">Laporanmu</h2>
          </div>
          <ul className="report-list">
            {task.reports.toReversed().map((report) => (
              <li key={report.id} className="report-card">
                <p className="small muted">{formatDateTime(report.reported_at)}</p>
                <p>{report.note}</p>
                {report.measured && (
                  <dl className="kv-strip">
                    {Object.entries(report.measured).map(([key, value]) => {
                      const param = measuredLabel(key);
                      return (
                        <div key={key}>
                          <dt>{param?.label ?? key}</dt>
                          <dd>
                            {formatNumber(value, param?.digits ?? 2)} <span className="unit">{param?.unit}</span>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                )}
                {report.photos.length > 0 && (
                  <div className="photo-grid">
                    {report.photos.map((photo, i) => (
                      <a key={photo.id} href={`/api/files/${photo.id}`} target="_blank" rel="noreferrer">
                        <Image
                          src={`/api/files/${photo.id}`}
                          alt={`Foto laporan ${i + 1}`}
                          fill
                          sizes="(max-width: 767px) 33vw, 200px"
                          unoptimized
                        />
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {canStart && <StartTask taskId={task.id} />}
      {canReport && <ReportForm taskId={task.id} measure={task.kind !== "ambil_sampel"} />}
    </>
  );
}
