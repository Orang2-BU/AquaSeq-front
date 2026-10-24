import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui";

/** Fallback Suspense halaman: judul + panel kosong selama data dimuat. */
export function PageSkeleton({ title }: { title: string }) {
  return (
    <>
      <div className="page-heading">
        <h1>{title}</h1>
      </div>
      <section className="panel location-grid-skeleton" aria-busy="true" aria-label={`Memuat ${title.toLowerCase()}`} />
    </>
  );
}

/** Kartu metrik (08-DESIGN): ikon dalam lingkaran + label, angka `metric`, satu kalimat arti. */
export function Metric({
  icon,
  label,
  value,
  risk,
  small,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  /** Angka berarti risiko (warna `risk-tinggi`). */
  risk?: boolean;
  /** Nilai berupa teks (tanggal), bukan angka. */
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-icon">
          <Icon icon={icon} />
        </span>
        <h2>{label}</h2>
      </div>
      <strong className={`metric-value ${small ? "small-value" : ""} ${risk ? "risk-high" : ""}`}>{value}</strong>
      <p>{children}</p>
    </article>
  );
}
