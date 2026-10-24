import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Sprout } from "lucide-react";
import { api } from "@/lib/api";
import { loadEntity, withSession } from "@/lib/auth/session";
import { CYCLE_OUTCOME } from "@/lib/cycles";
import { formatDate, formatNumber } from "@/lib/format";
import { CycleButton } from "@/components/app/cycle-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Hasil siklus" };

export default function Page({ params }: PageProps<"/kolam/[pondId]/siklus">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Hasil siklus" />}>
        <Cycles params={params} />
      </Suspense>
    </div>
  );
}

async function Cycles({ params }: Pick<PageProps<"/kolam/[pondId]/siklus">, "params">) {
  const { pondId } = await params;
  const pond = await loadEntity((token) => api.ponds.get(token, pondId));
  const cycles = await withSession((token) => api.ponds.cycles(token, pond.id));
  return (
    <>
      <Link className="back-link" href={`/kolam/${pond.id}`}>
        <Icon icon={ArrowLeft} size={16} />
        Kolam {pond.pond_code}
      </Link>
      <div className="page-heading">
        <div>
          <h1>Hasil siklus kolam {pond.pond_code}</h1>
          <p>Siklus berjalan: ke-{pond.current_cycle}. Hasil panen dan wabah dipakai untuk kalibrasi model backend.</p>
        </div>
        <div className="page-actions">
          <CycleButton pond={pond} />
        </div>
      </div>
      {cycles.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Belum ada siklus selesai"
          text="Catat hasil siklus saat panen atau saat wabah terjadi. Data ini membantu model jadi lebih tepat untuk tambakmu."
        />
      ) : (
        <section className="panel">
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Siklus</th>
                  <th scope="col">Hasil</th>
                  <th scope="col" className="numeric">
                    Panen
                  </th>
                  <th scope="col">Tanggal wabah</th>
                  <th scope="col">Patogen dugaan</th>
                  <th scope="col">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c) => (
                  <tr key={c.cycle_number}>
                    <td data-label="Siklus" className="table-title">
                      Siklus ke-{c.cycle_number}
                    </td>
                    <td data-label="Hasil">
                      <Badge tone={c.outcome === "HARVEST_SUCCESS" ? "ok" : "crit"}>{CYCLE_OUTCOME[c.outcome]}</Badge>
                    </td>
                    <td data-label="Panen" className="numeric">
                      {formatNumber(c.actual_harvest_kg, 0)} kg
                    </td>
                    <td data-label="Tanggal wabah">{c.outbreak_date ? formatDate(c.outbreak_date) : "-"}</td>
                    <td data-label="Patogen dugaan">{c.primary_suspect_pathogen ?? "-"}</td>
                    <td data-label="Catatan" className="table-note-cell">
                      {c.notes ?? "-"}
                    </td>
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
