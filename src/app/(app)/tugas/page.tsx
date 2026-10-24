import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { api, type Task } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { taskOptions } from "@/lib/farm-data";
import { formatDateTime } from "@/lib/format";
import { TASK_KIND, TASK_STATUS, isOpen } from "@/lib/tasks";
import { EmptyState, NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { SelectFilter } from "@/components/app/select-filter";
import { CreateTaskButton } from "@/components/app/task-dialog";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Tugas" };

const FILTERS: { value: string; label: string; match: (t: Task) => boolean }[] = [
  { value: "terbuka", label: "Terbuka", match: (t) => isOpen(t.status) },
  { value: "dinilai", label: "Perlu dinilai", match: (t) => t.status === "dilaporkan" },
  { value: "terlambat", label: "Terlambat", match: (t) => t.overdue },
  { value: "selesai", label: "Selesai", match: (t) => t.status === "selesai" },
  { value: "semua", label: "Semua", match: () => true },
];

export default function Page({ searchParams }: PageProps<"/tugas">) {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Tugas" />}>
        <Tasks searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Tasks({ searchParams }: Pick<PageProps<"/tugas">, "searchParams">) {
  const query = await searchParams;
  const filter = FILTERS.find((f) => f.value === one(query.status)) ?? FILTERS[0];
  const teknisi = one(query.teknisi) ?? "";
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Tugas</h1>
        </div>
        <NoFarmState text="Tugas dibuat untuk kolam di lokasi tambak. Siapkan lokasi dan kolam dulu." />
      </>
    );
  }
  const [tasks, options] = await Promise.all([
    withSession((token) => api.tasks.list(token, current.id)),
    taskOptions(current.id),
  ]);
  const byTechnician = teknisi ? tasks.filter((t) => t.assignee.id === teknisi) : tasks;
  // Terlambat dan perlu dinilai dulu, lalu jatuh tempo terdekat.
  const urgency = (t: Task) => (t.overdue ? 0 : t.status === "dilaporkan" ? 1 : isOpen(t.status) ? 2 : 3);
  const shown = byTechnician
    .filter(filter.match)
    .toSorted((a, b) => urgency(a) - urgency(b) || a.due_at.localeCompare(b.due_at));
  const people = [...new Map(tasks.map((t) => [t.assignee.id, t.assignee.full_name]))].toSorted((a, b) =>
    a[1].localeCompare(b[1]),
  );
  const href = (status: string) => {
    const params = new URLSearchParams({ status });
    if (teknisi) params.set("teknisi", teknisi);
    return `/tugas?${params}`;
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tugas</h1>
          <p>
            {current.name} · {tasks.filter((t) => isOpen(t.status)).length} terbuka
          </p>
        </div>
        <div className="page-actions">
          <CreateTaskButton {...options} />
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas"
          text="Buat tugas dari peringatan atau detail kolam. Instruksinya terisi dari rekomendasi analisis."
        />
      ) : (
        <section className="panel">
          <div className="table-toolbar">
            <nav className="filter-pills" aria-label="Filter status tugas">
              {FILTERS.map((f) => (
                <Link
                  key={f.value}
                  className={`filter-pill ${f === filter ? "selected" : ""}`}
                  href={href(f.value)}
                  aria-current={f === filter ? "page" : undefined}
                >
                  {f.label} <span>{byTechnician.filter(f.match).length}</span>
                </Link>
              ))}
            </nav>
            <SelectFilter
              label="Teknisi"
              param="teknisi"
              value={teknisi}
              basePath="/tugas"
              keep={{ status: filter.value }}
              options={[{ value: "", label: "Semua teknisi" }, ...people.map(([value, label]) => ({ value, label }))]}
            />
          </div>
          {shown.length === 0 ? (
            <div className="table-empty">
              <p>Tidak ada tugas dengan filter ini.</p>
              <Link className="button secondary" href="/tugas?status=semua">
                Tampilkan semua tugas
              </Link>
            </div>
          ) : (
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Tugas</th>
                    <th scope="col">Kolam</th>
                    <th scope="col">Teknisi</th>
                    <th scope="col">Jatuh tempo</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((task) => (
                    <tr key={task.id}>
                      <td data-label="Tugas" className="table-title">
                        <Link className="table-link plain" href={`/tugas/${task.id}`}>
                          {task.title}
                        </Link>
                        <span className="table-sub">{TASK_KIND[task.kind]}</span>
                      </td>
                      <td data-label="Kolam">
                        <Link className="mono" href={`/kolam/${task.pond.id}`}>
                          {task.pond.pond_code}
                        </Link>
                      </td>
                      <td data-label="Teknisi">{task.assignee.full_name}</td>
                      <td data-label="Jatuh tempo" className={task.overdue ? "overdue" : undefined}>
                        {formatDateTime(task.due_at)}
                      </td>
                      <td data-label="Status">
                        <Badge tone={task.overdue ? "crit" : TASK_STATUS[task.status].tone}>
                          {task.overdue ? "Terlambat" : TASK_STATUS[task.status].label}
                        </Badge>
                      </td>
                    </tr>
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
