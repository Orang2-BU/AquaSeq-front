"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { MotionConfig, useReducedMotion } from "motion/react";

/** Scroll halus + aturan gerak area landing (08-DESIGN Area Landing). Tidak dimuat di (app). */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const content = <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  // Reduced-motion: Lenis tidak dijalankan, scroll bawaan browser.
  if (reduce) return content;
  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: true }}>
      {content}
    </ReactLenis>
  );
}
