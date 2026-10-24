import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarCheck, ClipboardList, FlaskConical, ShieldAlert, Upload } from "lucide-react";
import { api, type Pond } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatProbability, riskOf, riskRank } from "@/lib/risk";
import { isOpen } from "@/lib/tasks";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { Metric, PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Trend } from "@/components/app/trend";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Dasbor" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Dasbor" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

/** Rata-rata peluang sampel valid terakhir dan sebelumnya per lokasi (ringkasan tampilan, bukan skor baru). */
async function weeklyAverage(ponds: Pond[]) {
  const trajectories = await Promise.all(ponds.map((p) => withSession((token) => api.ponds.trajectory(token, p.id))));
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  return {
    now: mean(trajectories.flatMap((t) => t.history.slice(-1).map((h) => h.probability_pct))),
    before: mean(trajectories.flatMap((t) => t.history.slice(-2, -1).map((h) => h.probability_pct))),
  };
}

async function Dashboard() {
  const { farms, current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Dasbor</h1>
        </div>
        <NoFarmState text="Buat lokasi, tambahkan kolam, lalu unggah hasil lab pertama untuk melihat risiko." />
      </>
    );
  }

  const [ponds, tasks] = await Promise.all([
    withSession((token) => api.ponds.list(token, current.id)),
    withSession((token) => api.tasks.list(token, current.id)),
  ]);
  const [options, averages] = await Promise.all([
    taskOptions(current.id, ponds),
    Promise.all(
      farms.map(async (farm) => ({
        farm,
        ...(await weeklyAverage(
          farm.id === current.id ? ponds : await withSession((token) => api.ponds.list(token, farm.id)),
        )),
      })),
    ),
  ]);

  const sampled = ponds.filter((p) => p.latest_result);
  const latestDate = sampled
    .map((p) => p.latest_sampling_date ?? "")
    .toSorted()
    .at(-1);
  const heading = (
    <div className="page-heading">
      <div>
        <h1>Dasbor</h1>
        <p>
          {current.name}
          {latestDate && ` · sampling terakhir ${formatDate(latestDate)}`}
        </p>
      </div>
      <div className="page-actions">
        <Link className="button secondary" href="/lab/unggah">
          <Icon icon={Upload} />
          Unggah hasil lab
        </Link>
      </div>
    </div>
  );

  if (sampled.length === 0) {
    return (
      <>
        {heading}
        <EmptyState
          icon={FlaskConical}
          title="Belum ada hasil lab"
          text="Unggah CSV qPCR pertama untuk melihat peluang wabah dan kelas risiko tiap kolam."
        >
          <Link className="button primary" href="/lab/unggah">
            <Icon icon={Upload} />
            Unggah hasil lab
          </Link>
        </EmptyState>
      </>
    );
  }

  const ranked = sampled.toSorted((a, b) => riskRank(b.latest_result) - riskRank(a.latest_result));
  const top = ranked[0];
  const topResult = top.latest_result;
  const tone = (p: Pond) => (p.latest_result ? riskOf(p.latest_result).tone : null);
  const danger = ponds.filter((p) => tone(p) === "bahaya").length;
  const high = ponds.filter((p) => tone(p) === "tinggi").length;
  const rejected = ponds.filter((p) => tone(p) === "ditolak").length;
  const open = tasks.filter((t) => isOpen(t.status));
  const overdue = open.filter((t) => t.overdue).length;
  const toReview = open.filter((t) => t.status === "dilaporkan").length;
  const watch = ranked.filter((p) => tone(p) !== "aman").slice(0, 6);
  const due = open.toSorted((a, b) => a.due_at.localeCompare(b.due_at)).slice(0, 5);
  const topTask = open.find((t) => t.pond.id === top.id);
  const scale = Math.max(10, ...averages.flatMap((a) => [a.now ?? 0, a.before ?? 0])) * 1.15;

  return (
    <>
      {heading}
      <section className="metric-grid" aria-label="Ringkasan">
        <Metric icon={ShieldAlert} label="Kolam berisiko" value={danger + high} risk={danger + high > 0}>
          {danger} Bahaya · {high} Waspada tinggi
        </Metric>
        <Metric icon={ClipboardList} label="Tugas terbuka" value={open.length} risk={overdue > 0}>
          {overdue ? `${overdue} terlambat` : "Tidak ada yang terlambat"}
          {toReview > 0 && ` · ${toReview} perlu dinilai`}
        </Metric>
        <Metric icon={FlaskConical} label="Sampel ditolak" value={rejected}>
          {rejected ? "Perlu ambil sampel ulang" : "Semua sampel terakhir valid"}
        </Metric>
        <Metric icon={CalendarCheck} label="Sampling terakhir" value={latestDate ? formatDate(latestDate) : "-"} small>
          {sampled.length} dari {ponds.length} kolam punya hasil
        </Metric>
      </section>

      <div className="dashboard-grid">
        {topResult && (
          <section className="spotlight" aria-labelledby="spotlight-title">
            <div className="spotlight-head">
              <div>
                <h2 id="spotlight-title">
                  Kolam <span className="mono-large">{top.pond_code}</span> paling berisiko
                </h2>
                <p>
                  Sampel {top.latest_sampling_date ? formatDate(top.latest_sampling_date) : "-"}
                  {top.assignee ? ` · dipegang ${top.assignee.full_name}` : " · belum ada teknisi"}
                </p>
              </div>
              {current.provenance === "simulasi" && <Badge tone="warn">Data simulasi</Badge>}
            </div>
            <div className="spotlight-score">
              {topResult.status === "VALID" ? (
                <strong className="score-xl">{formatProbability(topResult.probability_pct)}</strong>
              ) : (
                <strong className="score-xl">Ditolak</strong>
              )}
              <RiskBadge result={topResult} />
              <Trend trend={top.trend} />
            </div>
            <p className="spotlight-reason">{topResult.recommendation}</p>
            <div className="spotlight-actions">
              {topTask ? (
                <Link className="button inverse" href={`/tugas/${topTask.id}`}>
                  Lihat tugas berjalan
                </Link>
              ) : (
                <CreateTaskButton
                  {...options}
                  variant="inverse"
                  defaults={{
                    pond_id: top.id,
                    title: `Tindak lanjut kolam ${top.pond_code}`,
                    instruction: topResult.recommendation,
                  }}
                />
              )}
              <Link className="spotlight-link" href={`/kolam/${top.id}`}>
                Detail kolam <Icon icon={ArrowRight} size={16} />
              </Link>
            </div>
          </section>
        )}

        <section className="panel" aria-labelledby="watch-title">
          <div className="section-heading table-heading">
            <h2 id="watch-title">Kolam yang perlu dipantau</h2>
            <Link className="text-link small" href="/kolam">
              Semua kolam
            </Link>
          </div>
          {watch.length === 0 ? (
            <p className="table-empty">Semua kolam Aman pada sampling terakhir.</p>
          ) : (
            <ul className="row-list">
              {watch.map((pond) => (
                <li key={pond.id}>
                  <Link className="row-link" href={`/kolam/${pond.id}`}>
                    <span className="mono row-code">{pond.pond_code}</span>
                    <span className="row-main">
                      {pond.latest_result && <RiskBadge result={pond.latest_result} />}
                      <Trend trend={pond.trend} />
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
      </div>

      <div className="dashboard-grid even">
        <section className="panel" aria-labelledby="due-title">
          <div className="section-heading table-heading">
            <h2 id="due-title">Tugas jatuh tempo</h2>
            <Link className="text-link small" href="/tugas">
              Semua tugas
            </Link>
          </div>
          {due.length === 0 ? (
            <p className="table-empty">Tidak ada tugas terbuka.</p>
          ) : (
            <ul className="row-list">
              {due.map((task) => (
                <li key={task.id}>
                  <Link className="row-link" href={`/tugas/${task.id}`}>
                    <span className="mono row-code">{task.pond.pond_code}</span>
                    <span className="row-main">
                      <span className="row-title">{task.title}</span>
                      <span className="small muted">{task.assignee.full_name}</span>
                    </span>
                    <span className={`row-value small ${task.overdue ? "overdue" : ""}`}>
                      {task.overdue ? "Terlambat · " : ""}
                      {formatDateTime(task.due_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="avg-title">
          <div className="section-heading table-heading">
            <div>
              <h2 id="avg-title">Rata-rata peluang per lokasi</h2>
              <p>Sampling terakhir dibanding sebelumnya</p>
            </div>
          </div>
          <ul className="bar-list">
            {averages.map(({ farm, now, before }) => (
              <li key={farm.id}>
                <span className="bar-label">{farm.name}</span>
                {now === null ? (
                  <span className="small muted">Belum ada hasil lab</span>
                ) : (
                  <>
                    <span className="bar-track" aria-hidden="true">
                      <span className="bar now" style={{ width: `${(now / scale) * 100}%` }} />
                      {before !== null && (
                        <span className="bar before" style={{ width: `${(before / scale) * 100}%` }} />
                      )}
                    </span>
                    <span className="bar-value">
                      {formatProbability(now)}
                      {before !== null && <span className="muted"> dari {formatProbability(before)}</span>}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="chart-legend">
            <span>
              <span className="legend-swatch now" /> Sampling terakhir
            </span>
            <span>
              <span className="legend-swatch before" /> Sebelumnya
            </span>
          </p>
        </section>
      </div>
    </>
  );
}
