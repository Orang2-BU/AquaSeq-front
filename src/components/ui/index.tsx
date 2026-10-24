import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Komponen dasar template Soft Op Dashboard (port dari implementasi acuan K-DASP).
// Tanpa "use client" supaya Server Component bisa mengoper ikon; Modal ada di modal.tsx.

export type Tone = "neutral" | "ok" | "warn" | "crit";

export function Icon({
  icon: Glyph,
  size = 18,
  ...props
}: { icon: LucideIcon; size?: number } & ComponentProps<"svg">) {
  return <Glyph size={size} strokeWidth={1.75} aria-hidden="true" {...props} />;
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`badge ${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
