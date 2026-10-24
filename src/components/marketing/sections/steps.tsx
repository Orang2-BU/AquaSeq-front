import Image from "next/image";
import { STEPS } from "@/content/landing";
import { Reveal } from "@/components/motion/reveal";
import { ContactLink } from "../contact-link";
import { SectionLabel } from "../section-label";

export function Steps() {
  return (
    <section id="cara-kerja" className="landing-section landing-container" aria-labelledby="cara-kerja-judul">
      <div className="section-head">
        <SectionLabel />
        <h2 id="cara-kerja-judul">{STEPS.title}</h2>
      </div>
      <ol className="step-cards">
        {STEPS.items.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.06} className="step-card">
              <span className="step-photo">
                <Image src={step.image.src} alt={step.image.alt} fill sizes="(max-width: 767px) 100vw, 25vw" />
              </span>
              <span className="step-body">
                <span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </span>
                <span className="step-num" aria-hidden>
                  {i + 1}
                </span>
              </span>
            </Reveal>
          </li>
        ))}
      </ol>
      <div className="section-action">
        <ContactLink />
      </div>
    </section>
  );
}
