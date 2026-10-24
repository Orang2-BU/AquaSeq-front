import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { History } from "lucide-react";
import { api, type Activity } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/format";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { SelectFilter } from "@/components/app/select-filter";

export const metadata: Metadata = { title: "Log aktivitas" };

const KINDS = [
  { value: "tugas", label: "Tugas" },
  { value: "batch", label: "Hasil lab" },
  { value: "kolam", label: "Kolam" },
  { value: "anggota", label: "Anggota" },
  { value: "undangan", label: "Undangan" },
  { value: "peringatan", label: "Peringatan" },
  { value: "siklus", label: "Hasil siklus" },
];

/** Tautan ke entitas yang disentuh aktivitas. */
function entityHref(a: Activity): string | null {
  const id = encodeURIComponent(a.entity_id);
  if (a.entity === "task") return `/tugas/${id}`;
  if (a.entity === "batch") return `/lab/unggahan/${id}`;
  if (a.entity === "pond") return `/kolam/${id}`;
  if (a.entity === "member") return `/tim/${id}`;
  if (a.entity === "invitation") return "/tim";
  return null;
}

export default function Page({ searchParams }: PageProps<"/aktivitas">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Log aktivitas" />}>
        <ActivityLog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function ActivityLog({ searchParams }: Pick<PageProps<"/aktivitas">, "searchParams">) {
  const query = await searchParams;
  const actor = one(query.pelaku) ?? "";
  const kind = one(query.jenis) ?? "";
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Log aktivitas</h1>
        </div>
        <NoFarmState text="Aktivitas dicatat per lokasi tambak." />
      </>
    );
  }
  const items = await withSession((token) => api.activity.list(token, current.id));
  const actors = [...new Map(items.map((a) => [a.actor.id, a.actor.full_name]))];
  const shown = items.filter((a) => (!actor || a.actor.id === actor) && (!kind || a.action.startsWith(`${kind}.`)));
  const days = [...new Set(shown.map((a) => formatDate(a.at)))];

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Log aktivitas</h1>
          <p>{current.name} · siapa melakukan apa, terbaru di atas</p>
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada aktivitas"
          text="Aksi seperti unggah hasil lab dan buat tugas tercatat di sini."
        />
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <SelectFilter
              label="Pelaku"
              param="pelaku"
              value={actor}
              basePath="/aktivitas"
              keep={{ jenis: kind }}
              options={[{ value: "", label: "Semua orang" }, ...actors.map(([value, label]) => ({ value, label }))]}
            />
            <SelectFilter
              label="Jenis"
              param="jenis"
              value={kind}
              basePath="/aktivitas"
              keep={{ pelaku: actor }}
              options={[{ value: "", label: "Semua jenis" }, ...KINDS]}
            />
          </div>
          {shown.length === 0 ? (
            <div className="table-empty">
              <p>Tidak ada aktivitas dengan filter ini.</p>
              <Link className="button secondary" href="/aktivitas">
                Tampilkan semua
              </Link>
            </div>
          ) : (
            days.map((day) => (
              <section key={day} className="activity-day" aria-label={day}>
                <h2 className="activity-date">{day}</h2>
                <ol className="timeline">
                  {shown
                    .filter((a) => formatDate(a.at) === day)
                    .map((a, i) => {
                      const href = entityHref(a);
                      return (
                        <li key={`${a.at}-${i}`}>
                          <strong>{a.actor.full_name}</strong>
                          <span>
                            {href ? (
                              <Link className="text-link" href={href}>
                                {a.detail}
                              </Link>
                            ) : (
                              a.detail
                            )}
                          </span>
                          <span className="small muted">{formatDateTime(a.at)}</span>
                        </li>
                      );
                    })}
                </ol>
              </section>
            ))
          )}
        </section>
      )}
    </>
  );
}
