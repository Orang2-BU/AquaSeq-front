import Link from "next/link";
import { FOOTER } from "@/content/landing";
import { BrandSymbol, BrandWordmark } from "@/components/shell/brand";

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container landing-footer-grid">
        <div>
          <span className="landing-footer-brand">
            <BrandSymbol />
            <BrandWordmark />
          </span>
          <p>{FOOTER.tagline}</p>
        </div>
        <nav aria-label="Tautan kaki">
          {FOOTER.links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p>{FOOTER.team}</p>
      </div>
      <p className="landing-container landing-footer-note">{FOOTER.note}</p>
    </footer>
  );
}
