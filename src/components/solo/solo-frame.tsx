import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/shell/brand";

/** Bingkai halaman di luar shell aplikasi (masuk, akun, publik) dengan gaya template yang sama. */
export function SoloFrame({ children }: { children: ReactNode }) {
  return (
    <div className="solo-frame">
      <header className="public-header">
        <Link href="/" className="brand" aria-label="AquaSeq, ke beranda">
          <BrandLockup />
        </Link>
      </header>
      {children}
      <footer className="public-footer">
        <span>
          AquaSeq <span className="footer-divider">/</span> Politeknik Negeri Jember
        </span>
        <Link href="/privasi" className="text-link">
          Kebijakan privasi
        </Link>
      </footer>
    </div>
  );
}
