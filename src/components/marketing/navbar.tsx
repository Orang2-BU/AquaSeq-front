"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/content/landing";
import { BrandSymbol, BrandWordmark } from "@/components/shell/brand";
import { ContactLink } from "./contact-link";

/** Navbar landing: transparan di atas, padat setelah scroll 24px; drawer kanan di < 1024px. */
export function Navbar() {
  const home = usePathname() === "/";
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

  const solid = scrolled || !home;
  return (
    <header className={`landing-nav ${solid ? "solid" : ""}`}>
      <div className="landing-nav-inner">
        <Link href="/" className="landing-brand" aria-label="AquaSeq, ke beranda">
          <BrandSymbol />
          <BrandWordmark />
        </Link>
        <nav className="landing-nav-links" aria-label="Navigasi landing">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="landing-nav-actions">
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
        </div>
      </div>
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
