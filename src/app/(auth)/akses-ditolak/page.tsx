import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Akses ditolak" };

export default function Page() {
  return (
    <section className="placeholder-panel">
      <div className="placeholder-card">
        <span className="placeholder-symbol">
          <Icon icon={ShieldAlert} size={32} />
        </span>
        <h1>Akses ditolak</h1>
        <p>
          Halaman ini bukan untuk akunmu, atau data ini milik lokasi lain. Teknisi hanya melihat kolam yang dibagikan
          pemilik.
        </p>
        <Link className="button secondary" href="/app">
          <Icon icon={ArrowLeft} />
          Ke beranda
        </Link>
      </div>
    </section>
  );
}
