import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, History } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, loadEntity, withSession } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { formatProbability, rejectedReason } from "@/lib/risk";
import { TASK_KIND, TASK_STATUS } from "@/lib/tasks";
import { CORE_WATER, outOfRange } from "@/lib/water";
import { mitigationList } from "@/lib/edna";
import { DiseaseLine } from "@/components/app/edna-findings";
import { InsightsPanel } from "@/components/app/insights-panel";
import { PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { RiskChart } from "@/components/app/risk-chart";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Trend } from "@/components/app/trend";
import { Badge, Icon } from "@/components/ui";
import { PondMenu } from "./pond-menu";

export const metadata: Metadata = { title: "Detail kolam" };

const TABS = [
  { value: "sampel", label: "Sampel" },
  { value: "kimia-air", label: "Kimia air" },
  { value: "tugas", label: "Tugas" },
] as const;

export default function Page({ params, searchParams }: PageProps<"/kolam/[pondId]">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Detail kolam" />}>
        <PondDetail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PondDetail({ params, searchParams }: PageProps<"/kolam/[pondId]">) {
  const [{ pondId }, { tab: rawTab }] = await Promise.all([params, searchParams]);
  const tab = TABS.find((t) => t.value === rawTab)?.value ?? "sampel";
  const pond = await loadEntity((token) => api.ponds.get(token, pondId));
  const [trajectory, samples, logs, tasks, options, { farms }, insights] = await Promise.all([
    withSession((token) => api.ponds.trajectory(token, pond.id)),
    withSession((token) => api.ponds.samples(token, pond.id)),
    withSession((token) => api.ponds.waterLogs(token, pond.id)),
    withSession((token) => api.tasks.list(token, pond.farm_id)),
    taskOptions(pond.farm_id),
    getActiveFarms(),
    // Insight lapis B opsional: kolam tetap tampil walau backend belum siap.
    withSession((token) => api.ponds.insights(token, pond.id).catch(() => null)),
  ]);
  const farm = farms.find((f) => f.id === pond.farm_id);
  const result = pond.latest_result;
  const pondTasks = tasks.filter((t) => t.pond.id === pond.id).toReversed();
  const valid = result?.status === "VALID";

  return (
    <>
      <Link className="back-link" href="/kolam">
        <Icon icon={ArrowLeft} size={16} />
        Kolam
      </Link>
      <div className="page-heading detail-heading">
        <div>
          <h1>
            <span className="mono-large">{pond.pond_code}</span>
            {pond.name && <span className="heading-sub"> {pond.name}</span>}
          </h1>
          <p>
            {farm?.name} · {pond.system === "intensif" ? "Intensif" : "Bioflok"} · siklus ke-{pond.current_cycle}
            {samples[0] && ` · DOC ${samples[0].cycle_day}`}
            {pond.area_sqm !== null && ` · ${formatNumber(pond.area_sqm, 0)} m²`}
          </p>
        </div>
        <div className="detail-score">
          {result ? (
            <>
              <strong className="score-xl">{valid ? formatProbability(result.probability_pct) : "Ditolak"}</strong>
              <RiskBadge result={result} />
            </>
          ) : (
            <span className="muted">Belum ada sampel</span>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <CreateTaskButton
          {...options}
          label="Tugaskan teknisi"
          defaults={{
            pond_id: pond.id,
            kind: result && !valid ? "ambil_sampel" : "tindakan",
            title:
              result && !valid ? `Ambil sampel ulang kolam ${pond.pond_code}` : `Tindak lanjut kolam ${pond.pond_code}`,
            instruction: result?.recommendation,
            source_sample_id: samples[0]?.sample_id,
          }}
        />
        <Link className="button secondary" href={`/kolam/${pond.id}/siklus`}>
          <Icon icon={History} />
          Hasil siklus
        </Link>
        <PondMenu pond={pond} hasResult={Boolean(result)} />
      </div>

      <div className="detail-grid">
        <section className="spotlight" aria-labelledby="reason-title">
          <div className="spotlight-head">
            <h2 id="reason-title">{result ? "Rekomendasi eDNA" : "Belum ada data eDNA"}</h2>
            {farm?.provenance === "simulasi" && <Badge tone="warn">Data simulasi</Badge>}
          </div>
          {result ? (
            <>
              {!valid && (
                <p className="spotlight-reason">{rejectedReason(result.status)}. Sampel perlu diambil ulang.</p>
              )}
              <DiseaseLine result={result} inverse />
              <p className="spotlight-reason">{result.recommendation}</p>
              {valid && mitigationList(result).length > 0 && (
                <ol className="spotlight-mitigation">
                  {mitigationList(result)
                    .slice(0, 3)
                    .map((m) => (
                      <li key={m.action}>{m.action}</li>
                    ))}
                </ol>
              )}
              <ul className="spotlight-points">
                <li>
                  <Trend trend={trajectory.trend} /> {trajectory.alert_message}
                </li>
                <li>
                  Sampel terakhir {pond.latest_sampling_date ? formatDate(pond.latest_sampling_date) : "-"} · model{" "}
                  {result.model_version}
                </li>
                <li>{pond.assignee ? `Dipegang ${pond.assignee.full_name}` : "Belum ada teknisi pemegang kolam"}</li>
              </ul>
              {samples[0] && (
                <Link className="button inverse" href={`/sampel/${samples[0].sample_id}`}>
                  Lihat rincian skor
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="spotlight-reason">
                Unggah data eDNA air tambak yang memuat sampel kolam ini untuk melihat peluang wabah.
              </p>
              <Link className="button inverse" href="/lab/unggah">
                Unggah data eDNA
              </Link>
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="chart-title">
          <div className="section-heading table-heading">
            <div>
              <h2 id="chart-title">Riwayat peluang wabah</h2>
              <p>{trajectory.data_points} sampel valid</p>
            </div>
          </div>
          {samples.length ? (
            <div className="chart-card">
              <RiskChart samples={samples} />
            </div>
          ) : (
            <p className="table-empty">Grafik muncul setelah sampel pertama dianalisis.</p>
          )}
          {pond.latest_water_log && (
            <dl className="kv-strip">
              {CORE_WATER.map((p) => {
                const value = pond.latest_water_log?.[p.key] ?? null;
                return (
                  <div key={p.key}>
                    <dt>{p.label}</dt>
                    <dd className={outOfRange(p, value) ? "risk-high" : undefined}>
                      {formatNumber(value, p.digits)} <span className="unit">{p.unit}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </section>
      </div>

      {insights && <InsightsPanel insights={insights} />}

      <section className="panel" aria-label="Riwayat kolam">
        <nav className="tabs" aria-label="Bagian riwayat kolam">
          {TABS.map((t) => (
            <Link
              key={t.value}
              className={`tab ${tab === t.value ? "selected" : ""}`}
              href={`/kolam/${pond.id}${t.value === "sampel" ? "" : `?tab=${t.value}`}`}
              aria-current={tab === t.value ? "page" : undefined}
              scroll={false}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {tab === "sampel" &&
          (samples.length === 0 ? (
            <p className="table-empty">Belum ada sampel untuk kolam ini.</p>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Sampel</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col" className="numeric">
                      DOC
                    </th>
                    <th scope="col" className="numeric">
                      Peluang
                    </th>
                    <th scope="col">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((s) => (
                    <tr key={s.sample_id}>
                      <td data-label="Sampel" className="table-title">
                        <Link className="mono table-link" href={`/sampel/${s.sample_id}`}>
                          {s.sample_code}
                        </Link>
                      </td>
                      <td data-label="Tanggal">{formatDate(s.sampling_date)}</td>
                      <td data-label="DOC" className="numeric">
                        {s.cycle_day}
                      </td>
                      <td data-label="Peluang" className="numeric">
                        {s.sdri_result.status === "VALID" ? formatProbability(s.sdri_result.probability_pct) : "-"}
                      </td>
                      <td data-label="Kelas">
                        <RiskBadge result={s.sdri_result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {tab === "kimia-air" &&
          (logs.length === 0 ? (
            <p className="table-empty">Belum ada catatan kimia air. Teknisi mencatatnya dari HP.</p>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Waktu</th>
                    {CORE_WATER.map((p) => (
                      <th key={p.key} scope="col" className="numeric">
                        {p.label} {p.unit && <span className="unit">{p.unit}</span>}
                      </th>
                    ))}
                    <th scope="col">Pencatat</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td data-label="Waktu" className="table-title">
                        {formatDateTime(log.measured_at)}
                      </td>
                      {CORE_WATER.map((p) => (
                        <td
                          key={p.key}
                          data-label={p.label}
                          className={`numeric ${outOfRange(p, log[p.key]) ? "risk-high" : ""}`}
                        >
                          {formatNumber(log[p.key], p.digits)}
                        </td>
                      ))}
                      <td data-label="Pencatat">{log.recorded_by.full_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="table-note small muted">Angka berwarna di luar rentang acuan budidaya vaname.</p>
            </div>
          ))}

        {tab === "tugas" &&
          (pondTasks.length === 0 ? (
            <p className="table-empty">Belum ada tugas untuk kolam ini.</p>
          ) : (
            <ul className="row-list">
              {pondTasks.map((task) => (
                <li key={task.id}>
                  <Link className="row-link" href={`/tugas/${task.id}`}>
                    <span className="row-main">
                      <span className="row-title">{task.title}</span>
                      <span className="small muted">
                        {TASK_KIND[task.kind]} · {task.assignee.full_name} · jatuh tempo {formatDateTime(task.due_at)}
                      </span>
                    </span>
                    <Badge tone={task.overdue ? "crit" : TASK_STATUS[task.status].tone}>
                      {task.overdue ? "Terlambat" : TASK_STATUS[task.status].label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
      </section>
    </>
  );
}
