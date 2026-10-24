import Link from "next/link";
import { MapPin, Rocket, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui";

/** Empty state halaman: placeholder starter + kalimat langkah berikutnya (08-DESIGN "Empty state"). */
export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="placeholder-panel">
      <div className="placeholder-card">
        <span className="placeholder-symbol">
          <Icon icon={icon} size={32} />
        </span>
        <h2>{title}</h2>
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}

/** Halaman yang butuh lokasi aktif, saat pemilik belum punya lokasi. */
export function NoFarmState({ text }: { text: string }) {
  return (
    <EmptyState icon={MapPin} title="Belum ada lokasi aktif" text={text}>
      <Link className="button primary" href="/mulai">
        <Icon icon={Rocket} />
        Siapkan tambak
      </Link>
    </EmptyState>
  );
}
