import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Icon } from "@/components/ui";

/** 404 di dalam shell aplikasi (kolam, sampel, atau tugas yang tidak ada). */
export default function NotFound() {
  return (
    <div className="page-enter">
      <EmptyState
        icon={Compass}
        title="Data tidak ditemukan"
        text="Kolam, sampel, atau tugas ini mungkin sudah diarsipkan atau alamatnya salah ketik."
      >
        <Link className="button secondary" href="/app">
          <Icon icon={ArrowLeft} />
          Ke beranda
        </Link>
      </EmptyState>
    </div>
  );
}
