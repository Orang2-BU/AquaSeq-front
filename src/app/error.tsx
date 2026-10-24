"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Icon } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="public-main">
      <section className="placeholder-panel">
        <div className="placeholder-card">
          <span className="placeholder-symbol">
            <Icon icon={TriangleAlert} size={32} />
          </span>
          <h1>Terjadi galat</h1>
          <p>Halaman gagal dimuat, mungkin karena server analisis sedang tidak terjangkau. Coba lagi sebentar lagi.</p>
          <button className="button secondary" onClick={reset}>
            <Icon icon={RotateCcw} />
            Coba lagi
          </button>
        </div>
      </section>
    </main>
  );
}
