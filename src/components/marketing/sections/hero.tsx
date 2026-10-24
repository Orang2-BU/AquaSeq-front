import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HERO } from "@/content/landing";
import { ContactLink } from "../contact-link";

export function Hero() {
  const { card } = HERO;
  return (
    <section className="landing-container">
      <div className="hero">
        <Image src={HERO.image.src} alt={HERO.image.alt} fill priority sizes="100vw" className="hero-photo" />
        <div className="hero-copy">
          <h1>
            {HERO.strong}
            <span className="light">{HERO.light}</span>
          </h1>
          <p>&ldquo;{HERO.quote}&rdquo;</p>
          <ContactLink />
        </div>
        <Link href={card.href} className="hero-card">
          <span className="hero-card-top">
            <span>{card.text}</span>
            <span className="round-arrow" aria-hidden>
              <ArrowUpRight size={18} strokeWidth={1.75} />
            </span>
          </span>
          <span className="hero-card-photo">
            <Image src={card.image.src} alt="" fill sizes="240px" />
          </span>
          <span className="sr-only">{card.label}</span>
        </Link>
      </div>
    </section>
  );
}
