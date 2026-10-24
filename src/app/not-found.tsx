import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SoloFrame } from "@/components/solo/solo-frame";
import { Icon } from "@/components/ui";

export default function NotFound() {
  return (
    <SoloFrame>
      <main className="public-main">
        <section className="placeholder-panel">
          <div className="placeholder-card">
            <span className="placeholder-symbol">
              <Icon icon={Compass} size={32} />
            </span>
            <h1>Halaman tidak ditemukan</h1>
            <p>Alamatnya mungkin salah ketik atau halamannya sudah dipindah.</p>
            <Link className="button secondary" href="/app">
              <Icon icon={ArrowLeft} />
              Ke beranda
            </Link>
          </div>
        </section>
      </main>
    </SoloFrame>
  );
}
