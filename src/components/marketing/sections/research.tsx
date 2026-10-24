import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { RESEARCH } from "@/content/landing";
import { Reveal } from "@/components/motion/reveal";
import { SectionLabel } from "../section-label";

export function Research() {
  return (
    <section id="riset" className="landing-section landing-container" aria-labelledby="riset-judul">
      <div className="section-head">
        <SectionLabel />
        <h2 id="riset-judul">{RESEARCH.title}</h2>
      </div>
      <div className="research-grid">
        {RESEARCH.items.map((item, i) => (
          <Reveal key={item.href} delay={i * 0.06} className={i === 0 ? "research-main" : "research-side"}>
            <a href={item.href} className="research-card" target="_blank" rel="noopener noreferrer">
              <span className="research-photo">
                <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 767px) 100vw, 40vw" />
              </span>
              <span className="research-body">
                <span className="research-source">{item.source}</span>
                <span className="research-title">{item.title}</span>
                <span className="research-text">{item.text}</span>
              </span>
              <span className="round-arrow" aria-hidden>
                <ArrowUpRight size={18} strokeWidth={1.75} />
              </span>
              <span className="sr-only">(buka artikel di tab baru)</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
