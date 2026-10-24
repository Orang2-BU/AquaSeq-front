import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClipboardCheck, FlaskConical, ShieldAlert, TimerOff } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDate, isPast, todayWib } from "@/lib/format";
import { formatProbability, riskOf, riskRank } from "@/lib/risk";
import { NoFarmState } from "@/components/app/empty-state";
import { Metric, PageSkeleton } from "@/components/app/page-parts";
import { PrintButton } from "@/components/app/print-button";
import { RiskBadge } from "@/components/app/risk-badge";
import { RiskDistribution } from "@/components/app/risk-distribution";
import { Trend } from "@/components/app/trend";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Laporan" };

const PERIODS = [
  { value: "7", label: "7 hari", days: 7 },
  { value: "30", label: "30 hari", days: 30 },
  { value: "90", label: "90 hari", days: 90 },
];
const DAY_MS = 86_400_000;

export default function Page({ searchParams }: PageProps<"/laporan">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Laporan" />}>
        <Report searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Report({ searchParams }: Pick<PageProps<"/laporan">, "searchParams">) {
  const { periode } = await searchParams;
  const period = PERIODS.find((p) => p.value === periode) ?? PERIODS[1];
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Laporan</h1>
        </div>
        <NoFarmState text="Laporan merangkum kolam, hasil lab, dan tugas satu lokasi." />
      </>
    );
  }
  const [ponds, tasks, batches] = await Promise.all([
    withSession((token) => api.ponds.list(token, current.id)),
    withSession((token) => api.tasks.list(token, current.id)),
    withSession((token) => api.batches.list(token, current.id)),
  ]);
  // Masuk periode bila waktu kejadian + panjang periode belum lewat.
  const inPeriod = (iso: string) => !isPast(new Date(Date.parse(iso) + period.days * DAY_MS).toISOString());
  const periodBatches = batches.filter((b) => inPeriod(b.tested_at));
  const periodTasks = tasks.filter((t) => inPeriod(t.created_at));
  const done = periodTasks.filter((t) => t.status === "selesai").length;
  const late = periodTasks.filter((t) => t.overdue).length;
  const risky = ponds
    .filter((p) => p.latest_result && riskOf(p.latest_result).tone !== "aman")
    .toSorted((a, b) => riskRank(b.latest_result) - riskRank(a.latest_result));
  const sampled = periodBatches.reduce((a, b) => a + b.sample_count, 0);
  const rejected = periodBatches.reduce((a, b) => a + b.rejected_count, 0);

  return (
    <div className="report">
      <div className="page-heading">
        <div>
          <h1>Laporan {current.name}</h1>
          <p>
            {period.label} terakhir · dibuat {formatDate(todayWib())}
            {current.provenance === "simulasi" && " · data simulasi"}
          </p>
        </div>
        <div className="page-actions no-print">
          <nav className="filter-pills" aria-label="Periode laporan">
            {PERIODS.map((p) => (
              <Link
                key={p.value}
                className={`filter-pill ${p === period ? "selected" : ""}`}
                href={`/laporan?periode=${p.value}`}
                aria-current={p === period ? "page" : undefined}
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <PrintButton />
        </div>
      </div>

      <section className="metric-grid" aria-label="Ringkasan periode">
        <Metric icon={FlaskConical} label="Sampel diuji" value={sampled}>
          {periodBatches.length} unggahan
        </Metric>
        <Metric icon={ShieldAlert} label="Sampel ditolak" value={rejected} risk={rejected > 0}>
          {sampled ? `${Math.round((rejected / sampled) * 100)}% dari sampel` : "Belum ada sampel"}
        </Metric>
        <Metric icon={ClipboardCheck} label="Tugas selesai" value={done}>
          dari {periodTasks.length} tugas dibuat
        </Metric>
        <Metric icon={TimerOff} label="Tugas terlambat" value={late} risk={late > 0}>
          {late ? "Belum dilaporkan lewat jatuh tempo" : "Semua tepat waktu"}
        </Metric>
      </section>

      <div className="dashboard-grid even">
        <section className="panel" aria-labelledby="dist-title">
          <div className="section-heading table-heading">
            <div>
              <h2 id="dist-title">Sebaran kelas saat ini</h2>
              <p>Sampel terakhir tiap kolam ({ponds.length} kolam)</p>
            </div>
          </div>
          <RiskDistribution ponds={ponds} />
        </section>

        <section className="panel" aria-labelledby="risky-title">
          <div className="section-heading table-heading">
            <h2 id="risky-title">Kolam yang perlu perhatian</h2>
          </div>
          {risky.length === 0 ? (
            <p className="table-empty">Semua kolam Aman pada sampling terakhir.</p>
          ) : (
            <div className="table-card">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th scope="col">Kolam</th>
                    <th scope="col" className="numeric">
                      Peluang
                    </th>
                    <th scope="col">Kelas</th>
                    <th scope="col">Tren</th>
                  </tr>
                </thead>
                <tbody>
                  {risky.map((p) => (
                    <tr key={p.id}>
                      <td data-label="Kolam" className="table-title mono">
                        {p.pond_code}
                      </td>
                      <td data-label="Peluang" className="numeric">
                        {p.latest_result?.status === "VALID" ? formatProbability(p.latest_result.probability_pct) : "-"}
                      </td>
                      <td data-label="Kelas">{p.latest_result && <RiskBadge result={p.latest_result} />}</td>
                      <td data-label="Tren">
                        <Trend trend={p.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="batches-title">
        <div className="section-heading table-heading">
          <h2 id="batches-title">Unggahan dalam periode</h2>
        </div>
        {periodBatches.length === 0 ? (
          <p className="table-empty">Tidak ada unggahan hasil lab dalam {period.label} terakhir.</p>
        ) : (
          <ul className="row-list">
            {periodBatches.map((b) => (
              <li key={b.batch_id}>
                <Link className="row-link" href={`/lab/unggahan/${b.batch_id}`}>
                  <span className="row-main">
                    <span className="row-title">{formatDate(b.tested_at)}</span>
                    <span className="small muted">{b.lab_name}</span>
                  </span>
                  <span className="row-value">{b.sample_count} sampel</span>
                  {b.rejected_count > 0 && <Badge tone="warn">{b.rejected_count} ditolak</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="calibration-note small muted">
        Skor dari model V1-GSI server analisis. Alat bantu keputusan, bukan diagnosis resmi.
      </p>
    </div>
  );
}
