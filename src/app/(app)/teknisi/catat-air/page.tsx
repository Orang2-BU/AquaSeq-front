import type { Metadata } from "next";
import { Suspense } from "react";
import { Droplets } from "lucide-react";
import { technicianData } from "@/lib/farm-data";
import { formatDateTime, formatNumber, nowLocalInput } from "@/lib/format";
import { CORE_WATER, WATER_FIELDS, outOfRange } from "@/lib/water";
import { EmptyState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { WaterLogger, type LoggerPond, type WaterValues } from "./water-form";

export const metadata: Metadata = { title: "Catat kimia air" };

export default function Page({ searchParams }: PageProps<"/teknisi/catat-air">) {
  return (
    <div className="page-enter tech-page">
      <Suspense fallback={<PageSkeleton title="Catat kimia air" />}>
        <WaterLog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function WaterLog({ searchParams }: Pick<PageProps<"/teknisi/catat-air">, "searchParams">) {
  const { kolam } = await searchParams;
  const { ponds } = await technicianData();
  const heading = (
    <div className="tech-greeting">
      <h1>Catat kimia air</h1>
      <p>Ukur sebelum pakan pagi. Suhu, pH, DO, dan TAN wajib; parameter lain bila ada alatnya.</p>
    </div>
  );
  if (ponds.length === 0) {
    return (
      <>
        {heading}
        <EmptyState
          icon={Droplets}
          title="Belum ada kolam yang kamu pegang"
          text="Pemilik tambak membagi kolam ke teknisi. Hubungi pemilik bila kolammu belum muncul."
        />
      </>
    );
  }
  const options: LoggerPond[] = ponds.map((p) => ({
    id: p.id,
    pond_code: p.pond_code,
    loggedToday: p.loggedToday,
    last: p.latestLog
      ? {
          at: p.latestLog.measured_at,
          by: p.latestLog.recorded_by.full_name,
          values: Object.fromEntries(WATER_FIELDS.map((k) => [k, p.latestLog?.[k] ?? null])) as WaterValues,
        }
      : null,
  }));
  const requested = typeof kolam === "string" ? ponds.find((p) => p.id === kolam) : undefined;
  const initial = requested ?? ponds.find((p) => !p.loggedToday) ?? ponds[0];
  const history = ponds
    .flatMap((p) => p.history.slice(0, 3))
    .toSorted((a, b) => b.measured_at.localeCompare(a.measured_at));

  return (
    <>
      {heading}
      <section className="panel tech-panel">
        <WaterLogger ponds={options} initialPond={initial.id} now={nowLocalInput()} />
      </section>
      <section className="tech-section" aria-labelledby="history-title">
        <div className="tech-section-head">
          <h2 id="history-title">Catatan terbaru</h2>
          <p>Tiga catatan terakhir tiap kolam. Angka berwarna di luar rentang acuan.</p>
        </div>
        <div className="table-card">
          <table className="data-table compact">
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
              {history.slice(0, 12).map((log) => (
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
      </section>
    </>
  );
}
