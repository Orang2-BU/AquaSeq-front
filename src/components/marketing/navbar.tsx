"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/content/landing";
import { BrandSymbol, BrandWordmark } from "@/components/shell/brand";
import { ContactLink } from "./contact-link";

/** Animasi kapsul: pegas cepat tanpa pantulan berlebih (token gerak landing). */
const PILL = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

/**
 * Navbar landing: lebar penuh di atas halaman; setelah scroll 24px menyusut ke tengah jadi kapsul
 * membulat yang melayang (animasi `layout` Motion, berbasis transform). Drawer kanan di < 1200px.
 * Reduced-motion: `MotionConfig reducedMotion="user"` di SmoothScroll mematikan animasinya.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const node = drawer.current;
    const button = trigger.current;
    node?.showModal();
    lenis?.stop();
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", close);
    return () => {
      node?.close();
      lenis?.start();
      desktop.removeEventListener("change", close);
      button?.focus();
    };
  }, [open, lenis]);

  return (
    <header className={`landing-nav ${scrolled ? "solid" : ""}`}>
      <motion.div
        layout
        layoutDependency={scrolled}
        transition={PILL}
        className="landing-nav-inner"
        // Radius lewat style supaya Motion mengoreksinya selama animasi skala.
        style={{ borderRadius: scrolled ? 999 : 0 }}
      >
        <motion.div layout="position" layoutDependency={scrolled} transition={PILL}>
          <Link href="/" className="landing-brand" aria-label="AquaSeq, ke beranda">
            <BrandSymbol />
            <BrandWordmark />
          </Link>
        </motion.div>
        <motion.nav
          layout="position"
          layoutDependency={scrolled}
          transition={PILL}
          className="landing-nav-links"
          aria-label="Navigasi landing"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </motion.nav>
        <motion.div layout="position" layoutDependency={scrolled} transition={PILL} className="landing-nav-actions">
          <Link href="/masuk" className="landing-nav-login">
            Masuk
          </Link>
          <ContactLink />
          <button
            ref={trigger}
            className="landing-burger"
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="landing-drawer"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden size={20} strokeWidth={1.75} />
          </button>
        </motion.div>
      </motion.div>
      {open && (
        <dialog
          ref={drawer}
          id="landing-drawer"
          className="landing-drawer"
          aria-label="Menu"
          data-lenis-prevent
          onCancel={() => setOpen(false)}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="landing-drawer-body">
            <button className="landing-burger" aria-label="Tutup menu" onClick={() => setOpen(false)}>
              <X aria-hidden size={20} strokeWidth={1.75} />
            </button>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/masuk" onClick={() => setOpen(false)}>
              Masuk
            </Link>
            <ContactLink />
          </div>
        </dialog>
      )}
    </header>
  );
}
