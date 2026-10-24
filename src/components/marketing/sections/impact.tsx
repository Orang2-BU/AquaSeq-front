import Image from "next/image";
import { IMPACT } from "@/content/landing";
import { Reveal } from "@/components/motion/reveal";

export function Impact() {
  return (
    <section className="landing-container">
      <Reveal className="impact">
        <div className="impact-copy">
          <h2>{IMPACT.title}</h2>
          <p>{IMPACT.text.map((part) => (part.hl ? <strong key={part.text}>{part.text}</strong> : part.text))}</p>
          <p className="impact-source">Sumber: {IMPACT.source}</p>
        </div>
        <div className="impact-mission">
          <h3>{IMPACT.mission.title}</h3>
          <p>{IMPACT.mission.text}</p>
        </div>
        <div className="impact-photo">
          <Image src={IMPACT.image.src} alt={IMPACT.image.alt} fill sizes="(max-width: 1023px) 100vw, 40vw" />
        </div>
      </Reveal>
    </section>
  );
}
