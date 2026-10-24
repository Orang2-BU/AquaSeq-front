import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ClipboardList, Clock, Waves } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDateTime, formatNumber } from "@/lib/format";
import { formatProbability } from "@/lib/risk";
import { TASK_STATUS, isOpen } from "@/lib/tasks";
import { CORE_WATER, outOfRange } from "@/lib/water";
import { NoFarmState } from "@/components/app/empty-state";
import { Metric, PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Badge, Icon } from "@/components/ui";
import { MemberRowActions } from "../team-actions";

export const metadata: Metadata = { title: "Detail teknisi" };

export default function Page({ params }: PageProps<"/tim/[userId]">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Detail teknisi" />}>
        <Technician params={params} />
      </Suspense>
    </div>
  );
}

async function Technician({ params }: Pick<PageProps<"/tim/[userId]">, "params">) {
  const { userId } = await params;
  const { current } = await getActiveFarms();
  if (!current) return <NoFarmState text="Teknisi bergabung ke lokasi tambak. Siapkan lokasi dulu." />;
  const [members, ponds, tasks, logs, options] = await Promise.all([
    withSession((token) => api.members.list(token, current.id)),
    withSession((token) => api.ponds.list(token, current.id)),
    withSession((token) => api.tasks.list(token, current.id)),
    withSession((token) => api.waterLogs.list(token, current.id)),
    taskOptions(current.id),
  ]);
  const member = members.items.find((m) => m.user_id === userId && m.role === "teknisi");
  if (!member) notFound();

  const held = ponds.filter((p) => p.assignee?.id === member.user_id);
  const mine = tasks.filter((t) => t.assignee.id === member.user_id);
  const open = mine.filter((t) => isOpen(t.status)).toSorted((a, b) => a.due_at.localeCompare(b.due_at));
  const reported = mine.filter((t) => t.status === "selesai" || t.status === "dilaporkan");
  const late = mine.filter((t) => t.overdue).length;
  const recentLogs = logs.filter((l) => l.recorded_by.id === member.user_id).slice(0, 8);

  return (
    <>
      <Link className="back-link" href="/tim">
        <Icon icon={ArrowLeft} size={16} />
        Tim
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <h1>{member.full_name}</h1>
          <p>
            {member.email} · teknisi {current.name}
          </p>
        </div>
        <div className="detail-score">
          <Badge tone={member.active ? "ok" : "neutral"}>{member.active ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </div>
      <div className="detail-actions">
        {member.active && (
          <CreateTaskButton
            {...options}
            label="Beri tugas"
            defaults={{ assignee_id: member.user_id, pond_id: held[0]?.id }}
          />
        )}
        <MemberRowActions farmId={current.id} member={member} ponds={options.ponds} />
      </div>

      <section className="metric-grid three" aria-label="Ringkasan teknisi">
        <Metric icon={Waves} label="Kolam dipegang" value={held.length}>
          {held.length ? held.map((p) => p.pond_code).join(", ") : "Belum dibagi kolam"}
        </Metric>
        <Metric icon={ClipboardList} label="Tugas terbuka" value={open.length}>
          {reported.length} tugas sudah dilaporkan atau selesai
        </Metric>
        <Metric icon={Clock} label="Terlambat" value={late} risk={late > 0}>
          {late ? "Lewat jatuh tempo dan belum dilaporkan" : "Tidak ada tugas terlambat"}
        </Metric>
      </section>

      <div className="dashboard-grid even">
        <section className="panel" aria-labelledby="held-title">
          <div className="section-heading table-heading">
            <h2 id="held-title">Kolam yang dipegang</h2>
          </div>
          {held.length === 0 ? (
            <p className="table-empty">Belum ada kolam. Bagi kolam lewat menu ⋯.</p>
          ) : (
            <ul className="row-list">
              {held.map((pond) => (
                <li key={pond.id}>
                  <Link className="row-link" href={`/kolam/${pond.id}`}>
                    <span className="mono row-code">{pond.pond_code}</span>
                    <span className="row-main">
                      {pond.latest_result ? (
                        <RiskBadge result={pond.latest_result} />
                      ) : (
                        <span className="small muted">Belum ada sampel</span>
                      )}
                    </span>
                    <span className="row-value">
                      {pond.latest_result?.status === "VALID"
                        ? formatProbability(pond.latest_result.probability_pct)
                        : "-"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel" aria-labelledby="open-title">
          <div className="section-heading table-heading">
            <h2 id="open-title">Tugas terbuka</h2>
            <Link className="text-link small" href={`/tugas?status=semua&teknisi=${member.user_id}`}>
              Semua tugas
            </Link>
          </div>
          {open.length === 0 ? (
            <p className="table-empty">Tidak ada tugas terbuka.</p>
          ) : (
            <ul className="row-list">
              {open.map((task) => (
                <li key={task.id}>
                  <Link className="row-link" href={`/tugas/${task.id}`}>
                    <span className="mono row-code">{task.pond.pond_code}</span>
                    <span className="row-main">
                      <span className="row-title">{task.title}</span>
                      <span className={`small ${task.overdue ? "overdue" : "muted"}`}>
                        {formatDateTime(task.due_at)}
                      </span>
                    </span>
                    <Badge tone={task.overdue ? "crit" : TASK_STATUS[task.status].tone}>
                      {task.overdue ? "Terlambat" : TASK_STATUS[task.status].label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="logs-title">
        <div className="section-heading table-heading">
          <h2 id="logs-title">Catatan kimia air terakhir</h2>
          <Link className="text-link small" href="/kimia-air">
            Riwayat kimia air
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="table-empty">Belum ada catatan dari teknisi ini.</p>
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Kolam</th>
                  <th scope="col">Waktu</th>
                  {CORE_WATER.map((p) => (
                    <th key={p.key} scope="col" className="numeric">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Kolam" className="table-title mono">
                      {log.pond.pond_code}
                    </td>
                    <td data-label="Waktu">{formatDateTime(log.measured_at)}</td>
                    {CORE_WATER.map((p) => (
                      <td
                        key={p.key}
                        data-label={p.label}
                        className={`numeric ${outOfRange(p, log[p.key]) ? "risk-high" : ""}`}
                      >
                        {formatNumber(log[p.key], p.digits)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
