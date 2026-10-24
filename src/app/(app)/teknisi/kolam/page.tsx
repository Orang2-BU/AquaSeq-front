import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClipboardList, Droplets, Waves } from "lucide-react";
import { technicianData } from "@/lib/farm-data";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { formatProbability, rejectedReason, riskRank } from "@/lib/risk";
import { isOpen } from "@/lib/tasks";
import { CORE_WATER, outOfRange } from "@/lib/water";
import { EmptyState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { Trend } from "@/components/app/trend";
import { Badge, Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Kolam saya" };

export default function Page() {
  return (
    <div className="page-enter tech-page wide">
      <Suspense fallback={<PageSkeleton title="Kolam saya" />}>
        <MyPonds />
      </Suspense>
    </div>
  );
}

async function MyPonds() {
  const { farm, ponds, tasks } = await technicianData();
  // Kolam paling berisiko di atas supaya teknisi tahu mana yang diperhatikan dulu.
  const sorted = ponds.toSorted((a, b) => riskRank(b.latest_result) - riskRank(a.latest_result));
  const unlogged = ponds.filter((p) => !p.loggedToday).length;

  return (
    <>
      <div className="tech-greeting">
        <h1>Kolam saya</h1>
        <p>
          {ponds.length} kolam di {farm?.name ?? "lokasi ini"}
          {unlogged > 0 && ` · ${unlogged} belum dicatat hari ini`}
        </p>
      </div>
      {ponds.length === 0 ? (
        <EmptyState
          icon={Waves}
          title="Belum ada kolam"
          text="Pemilik tambak belum membagi kolam ke kamu. Kolam yang dibagikan muncul di sini."
        />
      ) : (
        <ul className="tech-pond-grid">
          {sorted.map((pond) => {
            const result = pond.latest_result;
            const log = pond.latestLog;
            const open = tasks.filter((t) => t.pond.id === pond.id && isOpen(t.status) && t.status !== "dilaporkan");
            return (
              <li key={pond.id} className="tech-pond">
                <div className="tech-pond-head">
                  <span className="mono-large tech-pond-code">{pond.pond_code}</span>
                  <span className="small muted">
                    {pond.system === "intensif" ? "Intensif" : "Bioflok"} · siklus ke-{pond.current_cycle}
                  </span>
                </div>
                {result ? (
                  <div className="tech-pond-score">
                    <strong>{result.status === "VALID" ? formatProbability(result.probability_pct) : "Ditolak"}</strong>
                    <RiskBadge result={result} />
                    <Trend trend={pond.trend} />
                  </div>
                ) : (
                  <p className="small muted">Belum ada hasil lab.</p>
                )}
                {result && (
                  <p className="tech-pond-reason">
                    {result.status === "VALID" ? result.recommendation : `${rejectedReason(result.status)}.`}
                    {pond.latest_sampling_date && (
                      <span className="small muted"> Sampel {formatDate(pond.latest_sampling_date)}.</span>
                    )}
                  </p>
                )}
                <div className="tech-pond-water">
                  <p className="small">
                    {pond.loggedToday ? (
                      <Badge tone="ok">Dicatat hari ini</Badge>
                    ) : (
                      <Badge tone="warn">Belum dicatat hari ini</Badge>
                    )}
                    {log && <span className="muted"> Terakhir {formatDateTime(log.measured_at)}</span>}
                  </p>
                  {log && (
                    <dl className="kv-strip">
                      {CORE_WATER.map((p) => (
                        <div key={p.key}>
                          <dt>{p.label}</dt>
                          <dd className={outOfRange(p, log[p.key]) ? "risk-high" : undefined}>
                            {formatNumber(log[p.key], p.digits)} <span className="unit">{p.unit}</span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
                <div className="tech-pond-actions">
                  <Link className="button primary" href={`/teknisi/catat-air?kolam=${pond.id}`}>
                    <Icon icon={Droplets} />
                    Catat air
                  </Link>
                  {open.length > 0 && (
                    <Link className="button secondary" href={`/teknisi/tugas/${open[0].id}`}>
                      <Icon icon={ClipboardList} />
                      {open.length} tugas terbuka
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
