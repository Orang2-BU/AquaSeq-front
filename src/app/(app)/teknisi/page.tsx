import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCheck, ClipboardList, Droplets, Waves } from "lucide-react";
import type { Task } from "@/lib/api";
import { technicianData } from "@/lib/farm-data";
import { formatWeekday, greeting, todayWib } from "@/lib/format";
import { riskOf } from "@/lib/risk";
import { bucketOf, dayOffsetOf, dueLabel, type TaskBucket } from "@/lib/tasks";
import { EmptyState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { TechTaskCard } from "@/components/app/tech-task-card";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Tugas saya" };

const SECTIONS: { bucket: TaskBucket; title: string; hint?: string }[] = [
  { bucket: "terlambat", title: "Terlambat", hint: "Kerjakan ini dulu, lalu laporkan." },
  { bucket: "hari_ini", title: "Hari ini" },
  { bucket: "mendatang", title: "Berikutnya" },
  { bucket: "menunggu", title: "Menunggu dinilai pemilik" },
];

export default function Page() {
  return (
    <div className="page-enter tech-page">
      <Suspense fallback={<PageSkeleton title="Tugas saya" />}>
        <MyTasks />
      </Suspense>
    </div>
  );
}

async function MyTasks() {
  const { me, farm, tasks, ponds } = await technicianData();
  const firstName = me.full_name.split(" ")[0];
  const byBucket = (bucket: TaskBucket) => tasks.filter((t) => bucketOf(t) === bucket);
  // Progres hari ini: tugas yang jatuh tempo hari ini atau terlambat, dibanding yang sudah dilaporkan/selesai.
  const todayTasks = tasks.filter((t) => dayOffsetOf(t) <= 0 && t.status !== "batal");
  const doneToday = todayTasks.filter((t) => t.status === "dilaporkan" || t.status === "selesai").length;
  const next: Task | undefined = [...byBucket("terlambat"), ...byBucket("hari_ini"), ...byBucket("mendatang")][0];
  const unlogged = ponds.filter((p) => !p.loggedToday);
  const risky = ponds.filter((p) => p.latest_result && ["tinggi", "bahaya"].includes(riskOf(p.latest_result).tone));
  const done = byBucket("selesai").toReversed().slice(0, 3);

  return (
    <>
      <div className="tech-greeting">
        <h1>
          {greeting()}, {firstName}
        </h1>
        <p>
          {formatWeekday(todayWib())}
          {farm && ` · ${farm.name}`}
        </p>
      </div>

      <section className="spotlight tech-today" aria-labelledby="today-title">
        <div className="spotlight-head">
          <div>
            <h2 id="today-title">
              {todayTasks.length
                ? `${doneToday} dari ${todayTasks.length} tugas hari ini dilaporkan`
                : "Tidak ada tugas hari ini"}
            </h2>
            <p>{next ? "Tugas berikutnya" : "Semua tugas sudah dilaporkan. Catat kimia air bila belum."}</p>
          </div>
        </div>
        {todayTasks.length > 0 && (
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={todayTasks.length}
            aria-valuenow={doneToday}
            aria-label="Progres tugas hari ini"
          >
            <span style={{ transform: `scaleX(${doneToday / todayTasks.length})` }} />
          </div>
        )}
        {next && (
          <Link className="tech-next" href={`/teknisi/tugas/${next.id}`}>
            <span>
              <strong>{next.title}</strong>
              <span>
                Kolam {next.pond.pond_code} · {next.overdue ? "terlambat, " : ""}
                {dueLabel(next)}
              </span>
            </span>
            <Icon icon={ArrowRight} />
          </Link>
        )}
      </section>

      <div className="tech-shortcuts">
        <Link className="tech-shortcut" href="/teknisi/catat-air">
          <span className="metric-icon">
            <Icon icon={Droplets} />
          </span>
          <span>
            <strong>Catat kimia air</strong>
            <span>
              {unlogged.length ? `${unlogged.length} kolam belum dicatat hari ini` : "Semua kolam sudah dicatat"}
            </span>
          </span>
        </Link>
        <Link className="tech-shortcut" href="/teknisi/kolam">
          <span className="metric-icon">
            <Icon icon={Waves} />
          </span>
          <span>
            <strong>Kolam saya</strong>
            <span>
              {ponds.length} kolam{risky.length ? ` · ${risky.length} berisiko` : ""}
            </span>
          </span>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas"
          text="Tugas dari pemilik tambak muncul di sini. Sambil menunggu, catat kimia air kolam yang kamu pegang."
        />
      ) : (
        <>
          {SECTIONS.map(({ bucket, title, hint }) => {
            const items = byBucket(bucket);
            if (!items.length) return null;
            return (
              <section key={bucket} className={`tech-section ${bucket}`} aria-labelledby={`sec-${bucket}`}>
                <div className="tech-section-head">
                  <h2 id={`sec-${bucket}`}>
                    {title} <span>{items.length}</span>
                  </h2>
                  {hint && <p>{hint}</p>}
                </div>
                <ul className="tech-task-list">
                  {items.map((task) => (
                    <li key={task.id}>
                      <TechTaskCard task={task} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {done.length > 0 && (
            <section className="tech-section" aria-labelledby="sec-selesai">
              <div className="tech-section-head">
                <h2 id="sec-selesai">
                  <Icon icon={CheckCheck} size={18} /> Selesai baru-baru ini
                </h2>
              </div>
              <ul className="tech-task-list done">
                {done.map((task) => (
                  <li key={task.id}>
                    <TechTaskCard task={task} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
