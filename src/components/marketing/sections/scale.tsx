import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SCALE } from "@/content/landing";
import { SectionLabel } from "../section-label";

export function Scale() {
  const { highlight } = SCALE;
  return (
    <section id="teknologi" className="landing-section landing-container" aria-labelledby="teknologi-judul">
      <div className="scale">
        <Image src={SCALE.image.src} alt={SCALE.image.alt} fill sizes="100vw" className="scale-photo" />
        <div className="scale-head">
          <SectionLabel />
          <h2 id="teknologi-judul">
            {SCALE.strong}
            <span className="light">{SCALE.light}</span>
          </h2>
          <p>{SCALE.note}</p>
        </div>
        <p className="scale-watermark" aria-hidden>
          {SCALE.watermark}
        </p>
        <div className="scale-highlight">
          <p className="scale-value">{highlight.value}</p>
          <p>{highlight.text}</p>
          <Link href={highlight.href} className="round-arrow light" aria-label={highlight.label}>
            <ArrowUpRight aria-hidden size={18} strokeWidth={1.75} />
          </Link>
        </div>
        <ul className="scale-stats">
          {SCALE.stats.map((stat, i) => (
            <li key={stat.text} className={i === 0 ? "accent" : undefined}>
              <strong>{stat.value}</strong>
              <span>{stat.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
