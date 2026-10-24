import { CONTACT_EXTERNAL, CONTACT_HREF, CONTACT_LABEL } from "@/content/landing";
import { PillLink } from "./pill-link";

/** CTA utama landing: Hubungi tim (WhatsApp bila nomor sudah diisi). */
export function ContactLink() {
  return (
    <PillLink href={CONTACT_HREF} external={CONTACT_EXTERNAL}>
      {CONTACT_LABEL}
    </PillLink>
  );
}
