import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Download, Waves } from "lucide-react";
import { api, type Pond } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { RISK_FILTERS, formatProbability, riskOf, riskRank, type RiskTone } from "@/lib/risk";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { RiskBadge } from "@/components/app/risk-badge";
import { Trend } from "@/components/app/trend";
import { Icon } from "@/components/ui";
import { SelectFilter } from "@/components/app/select-filter";
import { AddPondButton, PondRowActions } from "./pond-actions";

export const metadata: Metadata = { title: "Kolam" };

export default function Page({ searchParams }: PageProps<"/kolam">) {
  return (
    <div className="page-enter">
      <Suspense
        fallback={
          <>
            <div className="page-heading">
              <h1>Kolam</h1>
            </div>
            <section className="panel location-grid-skeleton" aria-busy="true" aria-label="Memuat kolam" />
          </>
        }
      >
        <PondList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

async function PondList({ searchParams }: Pick<PageProps<"/kolam">, "searchParams">) {
  const query = await searchParams;
  const kelas = RISK_FILTERS.find((f) => f.tone === one(query.kelas))?.tone;
  const teknisi = one(query.teknisi) ?? "";
  const { current } = await getActiveFarms();

  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Kolam</h1>
        </div>
        <NoFarmState text="Buat lokasi tambak dulu, lalu tambahkan kolamnya." />
      </>
    );
  }

  const ponds = (await withSession((token) => api.ponds.list(token, current.id))).toSorted(
    (a, b) => riskRank(b.latest_result) - riskRank(a.latest_result) || a.pond_code.localeCompare(b.pond_code),
  );
  const toneOf = (pond: Pond): RiskTone | null => (pond.latest_result ? riskOf(pond.latest_result).tone : null);
  const names = new Map<string, string>();
  for (const { assignee } of ponds) if (assignee) names.set(assignee.id, assignee.full_name);
  const technicians = [...names].map(([id, name]) => ({ id, name })).toSorted((a, b) => a.name.localeCompare(b.name));
  const byTechnician = ponds.filter((p) =>
    teknisi === "tanpa" ? !p.assignee : teknisi ? p.assignee?.id === teknisi : true,
  );
  const shown = kelas ? byTechnician.filter((p) => toneOf(p) === kelas) : byTechnician;
  const href = (tone?: RiskTone) => {
    const params = new URLSearchParams();
    if (tone) params.set("kelas", tone);
    if (teknisi) params.set("teknisi", teknisi);
    const search = params.toString();
    return search ? `/kolam?${search}` : "/kolam";
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Kolam</h1>
          <p>
            {current.name} · {ponds.length} kolam
          </p>
        </div>
        <div className="page-actions">
          {ponds.length > 0 && (
            <a className="button secondary" href="/kolam/ekspor" download>
              <Icon icon={Download} />
              Ekspor CSV
            </a>
          )}
          <AddPondButton farmId={current.id} farmName={current.name} />
        </div>
      </div>

      {ponds.length === 0 ? (
        <EmptyState
          icon={Waves}
          title="Belum ada kolam"
          text="Tambahkan kode kolam yang biasa dipakai di tambak, misalnya A1, A2, B1."
        />
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <nav className="filter-pills" aria-label="Filter kelas risiko">
              <Link
                className={`filter-pill ${kelas ? "" : "selected"}`}
                href={href()}
                aria-current={kelas ? undefined : "page"}
              >
                Semua <span>{byTechnician.length}</span>
              </Link>
              {RISK_FILTERS.map((f) => {
                const selected = f.tone === kelas;
                return (
                  <Link
                    key={f.tone}
                    className={`filter-pill ${selected ? "selected" : ""}`}
                    href={href(f.tone)}
                    aria-current={selected ? "page" : undefined}
                  >
                    {f.label} <span>{byTechnician.filter((p) => toneOf(p) === f.tone).length}</span>
                  </Link>
                );
              })}
            </nav>
            <SelectFilter
              label="Teknisi"
              param="teknisi"
              value={teknisi}
              basePath="/kolam"
              keep={{ kelas }}
              options={[
                { value: "", label: "Semua teknisi" },
                ...technicians.map((t) => ({ value: t.id, label: t.name })),
                { value: "tanpa", label: "Belum ada teknisi" },
              ]}
            />
          </div>

          {shown.length === 0 ? (
            <div className="table-empty">
              <p>Tidak ada kolam yang cocok dengan filter ini.</p>
              <Link className="button secondary" href="/kolam">
                Tampilkan semua kolam
              </Link>
            </div>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Kolam</th>
                    <th scope="col" className="numeric">
                      Peluang
                    </th>
                    <th scope="col">Kelas</th>
                    <th scope="col">Tren</th>
                    <th scope="col">Teknisi</th>
                    <th scope="col">Sampling terakhir</th>
                    <th scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((pond) => (
                    <PondRow key={pond.id} pond={pond} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}

function PondRow({ pond }: { pond: Pond }) {
  const result = pond.latest_result;
  return (
    <tr>
      <td data-label="Kolam" className="table-title">
        <Link className="mono table-link" href={`/kolam/${pond.id}`}>
          {pond.pond_code}
        </Link>
        <span className="table-sub">
          {[pond.name, pond.system === "intensif" ? "Intensif" : "Bioflok"].filter(Boolean).join(" · ")}
        </span>
      </td>
      <td data-label="Peluang" className="numeric">
        {result?.status === "VALID" ? formatProbability(result.probability_pct) : <span className="muted">-</span>}
      </td>
      <td data-label="Kelas">
        {result ? <RiskBadge result={result} /> : <span className="muted small">Belum ada sampel</span>}
      </td>
      <td data-label="Tren">
        <Trend trend={pond.trend} />
      </td>
      <td data-label="Teknisi">{pond.assignee?.full_name ?? <span className="muted">Belum ada</span>}</td>
      <td data-label="Sampling terakhir">
        {pond.latest_sampling_date ? formatDate(pond.latest_sampling_date) : <span className="muted">-</span>}
      </td>
      <td className="table-action">
        <PondRowActions pond={pond} />
      </td>
    </tr>
  );
}
