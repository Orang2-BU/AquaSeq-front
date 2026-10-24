import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Tombol pill landing (08-DESIGN Area Landing > Components): pill ink, teks lalu lingkaran putih berpanah
// yang berputar 45deg saat hover (hanya motion-safe).
export function PillLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  /** Tautan keluar (mis. WhatsApp): tab baru, tanpa akses ke halaman ini. */
  external?: boolean;
}) {
  const content = (
    <>
      {children}
      <span className="pill-link-icon" aria-hidden>
        <ArrowUpRight size={18} strokeWidth={1.75} />
      </span>
    </>
  );
  return external ? (
    <a href={href} className="pill-link" target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link href={href} className="pill-link">
      {content}
    </Link>
  );
}
