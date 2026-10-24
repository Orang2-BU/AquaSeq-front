import Image from "next/image";
import { REASONS } from "@/content/landing";
import { Reveal } from "@/components/motion/reveal";
import { ContactLink } from "../contact-link";

export function Reasons() {
  return (
    <section id="kenapa" className="landing-section landing-container reasons" aria-labelledby="kenapa-judul">
      <Reveal className="reasons-copy">
        <ul className="chips">
          {REASONS.chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
        <h2 id="kenapa-judul">{REASONS.title}</h2>
        <p>{REASONS.text}</p>
        <ContactLink />
      </Reveal>
      <div className="reason-grid">
        {REASONS.cards.map((card) => (
          <div key={card.title} className={`reason-card ${"accent" in card ? "accent" : ""}`}>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
        <div className="reason-photo">
          <Image src={REASONS.image.src} alt={REASONS.image.alt} fill sizes="(max-width: 767px) 100vw, 25vw" />
        </div>
      </div>
    </section>
  );
}
