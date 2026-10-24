import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BellOff, FlaskConical, ShieldAlert, TrendingUp, type LucideIcon } from "lucide-react";
import { api, type Alert } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDate } from "@/lib/format";
import { formatProbability } from "@/lib/risk";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { RiskBadge } from "@/components/app/risk-badge";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Icon } from "@/components/ui";
import { AlertActions } from "./alert-actions";

export const metadata: Metadata = { title: "Peringatan" };

const KINDS: { value: string; kind: Alert["kind"]; label: string }[] = [
  { value: "risiko", kind: "RISK_CLASS", label: "Kelas berisiko" },
  { value: "ditolak", kind: "REJECTED", label: "Sampel ditolak" },
  { value: "tren", kind: "TRAJECTORY", label: "Tren naik" },
];

const KIND_ICON: Record<Alert["kind"], LucideIcon> = {
  RISK_CLASS: ShieldAlert,
  REJECTED: FlaskConical,
  TRAJECTORY: TrendingUp,
};

export default function Page({ searchParams }: PageProps<"/peringatan">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Peringatan" />}>
        <Alerts searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Alerts({ searchParams }: Pick<PageProps<"/peringatan">, "searchParams">) {
  const { jenis } = await searchParams;
  const filter = KINDS.find((k) => k.value === jenis);
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Peringatan</h1>
        </div>
        <NoFarmState text="Peringatan muncul setelah kolam punya data eDNA." />
      </>
    );
  }
  const [alerts, options] = await Promise.all([
    withSession((token) => api.alerts.list(token, current.id)),
    taskOptions(current.id),
  ]);
  // Paling mendesak dulu: Bahaya, Waspada tinggi, lalu sampel ditolak dan tren naik.
  const order = (a: Alert) => (a.kind === "RISK_CLASS" ? 10 + a.probability_pct : a.kind === "REJECTED" ? 5 : 1);
  const sorted = alerts.toSorted((a, b) => order(b) - order(a));
  const shown = filter ? sorted.filter((a) => a.kind === filter.kind) : sorted;
  const holder = (pondId: string) => options.ponds.find((p) => p.id === pondId)?.assignee;

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Peringatan</h1>
          <p>
            {current.name} · {alerts.length ? `${alerts.length} perlu ditindaklanjuti` : "tidak ada peringatan aktif"}
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Tidak ada peringatan"
          text="Semua kolam aman pada sampling terakhir dan tidak ada tren naik. Peringatan baru muncul setelah data eDNA berikutnya."
        />
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <nav className="filter-pills" aria-label="Filter jenis peringatan">
              <Link
                className={`filter-pill ${filter ? "" : "selected"}`}
                href="/peringatan"
                aria-current={filter ? undefined : "page"}
              >
                Semua <span>{alerts.length}</span>
              </Link>
              {KINDS.map((k) => (
                <Link
                  key={k.value}
                  className={`filter-pill ${filter?.value === k.value ? "selected" : ""}`}
                  href={`/peringatan?jenis=${k.value}`}
                  aria-current={filter?.value === k.value ? "page" : undefined}
                >
                  {k.label} <span>{alerts.filter((a) => a.kind === k.kind).length}</span>
                </Link>
              ))}
            </nav>
          </div>
          {shown.length === 0 ? (
            <div className="table-empty">
              <p>Tidak ada peringatan jenis ini.</p>
              <Link className="button secondary" href="/peringatan">
                Tampilkan semua
              </Link>
            </div>
          ) : (
            <ul className="alert-list">
              {shown.map((alert) => {
                const assignee = holder(alert.pond_id);
                const result = {
                  status: alert.kind === "REJECTED" ? ("REJECTED_INHIBITOR" as const) : ("VALID" as const),
                  risk_class: alert.risk_class,
                };
                return (
                  <li key={alert.id} className={`alert-card kind-${alert.kind.toLowerCase()}`}>
                    <div className="alert-body">
                      <span className="alert-icon">
                        <Icon icon={KIND_ICON[alert.kind]} size={18} />
                      </span>
                      <div className="alert-main">
                        <div className="alert-head">
                          <Link className="mono table-link" href={`/kolam/${alert.pond_id}`}>
                            {alert.pond_code}
                          </Link>
                          <span className="alert-kind">{KINDS.find((k) => k.kind === alert.kind)?.label}</span>
                          <RiskBadge result={result} />
                          {alert.kind !== "REJECTED" && (
                            <strong className="alert-score">{formatProbability(alert.probability_pct)}</strong>
                          )}
                        </div>
                        <p className="alert-message">{alert.message}</p>
                        <p className="small muted">
                          Sejak {formatDate(alert.since)} ·{" "}
                          {assignee ? `dipegang ${assignee.full_name}` : "belum ada teknisi"}
                        </p>
                      </div>
                    </div>
                    <div className="alert-actions">
                      {alert.open_task_id ? (
                        <Link className="button secondary" href={`/tugas/${alert.open_task_id}`}>
                          Lihat tugas
                        </Link>
                      ) : (
                        <CreateTaskButton
                          {...options}
                          label="Buat tugas"
                          defaults={{
                            pond_id: alert.pond_id,
                            kind: alert.kind === "REJECTED" ? "ambil_sampel" : "tindakan",
                            title:
                              alert.kind === "REJECTED"
                                ? `Ambil sampel ulang kolam ${alert.pond_code}`
                                : `Tindak lanjut kolam ${alert.pond_code}`,
                            instruction: alert.message,
                            source_sample_id: alert.sample_id ?? undefined,
                            source_alert_id: alert.id,
                          }}
                        />
                      )}
                      <AlertActions alert={alert} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
