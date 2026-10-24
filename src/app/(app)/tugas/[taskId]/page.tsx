import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { loadEntity } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDateTime, formatNumber } from "@/lib/format";
import { TASK_KIND, TASK_STATUS, isOpen } from "@/lib/tasks";
import { WATER_PARAMS } from "@/lib/water";
import { PageSkeleton } from "@/components/app/page-parts";
import { Badge, Icon } from "@/components/ui";
import { TaskReview } from "./task-review";

export const metadata: Metadata = { title: "Detail tugas" };

export default function Page({ params }: PageProps<"/tugas/[taskId]">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Detail tugas" />}>
        <TaskDetailView params={params} />
      </Suspense>
    </div>
  );
}

/** Label angka ukur laporan dari kunci parameter kimia air. */
const measuredLabel = (key: string) => {
  const param = WATER_PARAMS.find((p) => p.key === key);
  return param ? { label: param.label, unit: param.unit, digits: param.digits } : { label: key, unit: "", digits: 2 };
};

async function TaskDetailView({ params }: Pick<PageProps<"/tugas/[taskId]">, "params">) {
  const { taskId } = await params;
  const task = await loadEntity((token) => api.tasks.get(token, taskId));
  const options = await taskOptions(task.farm_id);
  const status = TASK_STATUS[task.status];

  return (
    <>
      <Link className="back-link" href="/tugas">
        <Icon icon={ArrowLeft} size={16} />
        Tugas
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <h1>{task.title}</h1>
          <p>
            {TASK_KIND[task.kind]} · kolam{" "}
            <Link className="text-link mono" href={`/kolam/${task.pond.id}`}>
              {task.pond.pond_code}
            </Link>{" "}
            · untuk {task.assignee.full_name}
          </p>
        </div>
        <div className="detail-score">
          {task.overdue && <Badge tone="crit">Terlambat</Badge>}
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      {isOpen(task.status) && <TaskReview task={task} {...options} />}

      <div className="detail-grid reverse">
        <div className="stack">
          <section className="panel" aria-labelledby="instruction-title">
            <div className="section-heading table-heading">
              <h2 id="instruction-title">Instruksi</h2>
            </div>
            <div className="instruction-card">
              <p className="instruction-text">{task.instruction}</p>
              {task.source_sample_id && (
                <p className="small">
                  Dari hasil analisis sampel.{" "}
                  <Link className="text-link" href={`/sampel/${task.source_sample_id}`}>
                    Lihat rincian skor
                  </Link>
                </p>
              )}
              {task.owner_note && task.status === "diminta_ulang" && (
                <p className="owner-note">Catatan untuk teknisi: {task.owner_note}</p>
              )}
            </div>
          </section>

          <section className="panel" aria-labelledby="report-title">
            <div className="section-heading table-heading">
              <h2 id="report-title">Laporan teknisi</h2>
            </div>
            {task.reports.length === 0 ? (
              <p className="table-empty">
                {task.overdue
                  ? `Belum dilaporkan dan sudah lewat jatuh tempo. Hubungi ${task.assignee.full_name}.`
                  : `Belum dilaporkan. ${task.assignee.full_name} melapor dari HP setelah tugas selesai.`}
              </p>
            ) : (
              <ul className="report-list">
                {task.reports.toReversed().map((report) => (
                  <li key={report.id} className="report-card">
                    <p className="small muted">
                      {report.reported_by.full_name} · {formatDateTime(report.reported_at)}
                    </p>
                    <p>{report.note}</p>
                    {report.measured && Object.keys(report.measured).length > 0 && (
                      <dl className="kv-strip">
                        {Object.entries(report.measured).map(([key, value]) => {
                          const m = measuredLabel(key);
                          return (
                            <div key={key}>
                              <dt>{m.label}</dt>
                              <dd>
                                {formatNumber(value, m.digits)} <span className="unit">{m.unit}</span>
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
                            {/* Foto lewat proxy server berisi cookie sesi, jadi tanpa optimasi gambar Next. */}
                            <Image
                              src={`/api/files/${photo.id}`}
                              alt={`Foto laporan ${i + 1} dari ${report.reported_by.full_name}`}
                              fill
                              sizes="(max-width: 767px) 50vw, 240px"
                              unoptimized
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="stack">
          <section className="panel">
            <dl className="info-list">
              <div>
                <dt>Jatuh tempo</dt>
                <dd className={task.overdue ? "overdue" : undefined}>{formatDateTime(task.due_at)}</dd>
              </div>
              <div>
                <dt>Teknisi</dt>
                <dd>
                  <Link className="text-link" href={`/tim/${task.assignee.id}`}>
                    {task.assignee.full_name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt>Diberikan oleh</dt>
                <dd>{task.created_by.full_name}</dd>
              </div>
              <div>
                <dt>Dibuat</dt>
                <dd>{formatDateTime(task.created_at)}</dd>
              </div>
            </dl>
          </section>
          <section className="panel" aria-labelledby="history-title">
            <div className="section-heading table-heading">
              <h2 id="history-title">Riwayat status</h2>
            </div>
            <ol className="timeline">
              {task.history.map((h, i) => (
                <li key={`${h.at}-${i}`}>
                  <strong>{h.status === "dilaporkan" ? "Dilaporkan" : TASK_STATUS[h.status].label}</strong>
                  <span className="small muted">
                    {h.by.full_name} · {formatDateTime(h.at)}
                  </span>
                  {h.note && <span className="small">{h.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
