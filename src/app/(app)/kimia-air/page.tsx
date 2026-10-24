import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Download, Droplets } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDateTime, formatNumber } from "@/lib/format";
import { WATER_PARAMS, outOfRange } from "@/lib/water";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { SelectFilter } from "@/components/app/select-filter";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Riwayat kimia air" };

const SHOWN = WATER_PARAMS.filter((p) =>
  ["temp_c", "ph", "do_mg_l", "tan_mg_l", "nh3_mg_l", "no2_mg_l", "tom_mg_l", "salinity_ppt"].includes(p.key),
);

export default function Page({ searchParams }: PageProps<"/kimia-air">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Riwayat kimia air" />}>
        <WaterLogs searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function WaterLogs({ searchParams }: Pick<PageProps<"/kimia-air">, "searchParams">) {
  const query = await searchParams;
  const pondCode = one(query.kolam) ?? "";
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Riwayat kimia air</h1>
        </div>
        <NoFarmState text="Catatan kimia air dibuat teknisi untuk kolam di lokasi tambak." />
      </>
    );
  }
  const logs = await withSession((token) => api.waterLogs.list(token, current.id));
  const codes = [...new Set(logs.map((l) => l.pond.pond_code))].toSorted();
  const shown = pondCode ? logs.filter((l) => l.pond.pond_code === pondCode) : logs;
  const flagged = shown.filter((l) => SHOWN.some((p) => outOfRange(p, l[p.key]))).length;

  return (
    <>
      <Link className="back-link" href="/kolam">
        <Icon icon={ArrowLeft} size={16} />
        Kolam
      </Link>
      <div className="page-heading">
        <div>
          <h1>Riwayat kimia air</h1>
          <p>
            {current.name} · {shown.length} catatan
            {flagged > 0 && ` · ${flagged} dengan nilai di luar rentang acuan`}
          </p>
        </div>
        {logs.length > 0 && (
          <div className="page-actions">
            <a className="button secondary" href="/kimia-air/ekspor" download>
              <Icon icon={Download} />
              Ekspor CSV
            </a>
          </div>
        )}
      </div>
      {logs.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title="Belum ada catatan kimia air"
          text="Teknisi mencatat suhu, pH, DO, dan TAN dari HP. Catatan muncul di sini setelah disimpan."
        />
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <p className="small muted">Angka berwarna di luar rentang acuan budidaya vaname (penanda, bukan skor).</p>
            <SelectFilter
              label="Kolam"
              param="kolam"
              value={pondCode}
              basePath="/kimia-air"
              options={[{ value: "", label: "Semua kolam" }, ...codes.map((c) => ({ value: c, label: `Kolam ${c}` }))]}
            />
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Kolam</th>
                  <th scope="col">Waktu</th>
                  {SHOWN.map((p) => (
                    <th key={p.key} scope="col" className="numeric">
                      {p.label} {p.unit && <span className="unit">{p.unit}</span>}
                    </th>
                  ))}
                  <th scope="col">Pencatat</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Kolam" className="table-title">
                      <Link className="mono table-link" href={`/kolam/${log.pond.id}?tab=kimia-air`}>
                        {log.pond.pond_code}
                      </Link>
                    </td>
                    <td data-label="Waktu">{formatDateTime(log.measured_at)}</td>
                    {SHOWN.map((p) => (
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
          </div>
        </section>
      )}
    </>
  );
}
