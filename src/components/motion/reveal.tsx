"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";

const subscribe = () => () => {};

/**
 * Naik 24px + muncul saat masuk layar, sekali (token gerak 08-DESIGN). Konten terlihat sejak HTML server:
 * keadaan tersembunyi hanya dipasang setelah hydration dan hanya bila gerak diizinkan (CSS reduced-motion),
 * jadi tanpa JavaScript atau sebelum hydration isinya tetap tampil.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div
      ref={ref}
      className={`reveal ${hydrated && !inView ? "pending" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
