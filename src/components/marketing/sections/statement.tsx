import Image from "next/image";
import { STATEMENT } from "@/content/landing";
import { Reveal } from "@/components/motion/reveal";
import { SectionLabel } from "../section-label";

export function Statement() {
  return (
    <section className="landing-section landing-container statement">
      <div className="statement-side">
        <SectionLabel />
        <span className="statement-thumb wide">
          <Image src={STATEMENT.left.src} alt={STATEMENT.left.alt} fill sizes="120px" />
        </span>
      </div>
      <Reveal>
        <p className="statement-text">
          {STATEMENT.strong}
          <span className="light">{STATEMENT.light}</span>
        </p>
      </Reveal>
      <span className="statement-thumb square">
        <Image src={STATEMENT.right.src} alt={STATEMENT.right.alt} fill sizes="120px" />
      </span>
    </section>
  );
}
