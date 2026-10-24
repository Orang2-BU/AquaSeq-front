import type { Pond, SdriResult } from "@/lib/api";

// Satu-satunya pemetaan skor backend ke tampilan (07-RULES §8, 08-DESIGN "Skala risiko").
// Web tidak menghitung kelas; label dan warna mengikuti `risk_class` dan `status` dari backend.

export type RiskTone = "aman" | "ringan" | "tinggi" | "bahaya" | "ditolak";

const CLASSES: Record<number, { label: string; tone: RiskTone }> = {
  1: { label: "Aman", tone: "aman" },
  2: { label: "Waspada ringan", tone: "ringan" },
  3: { label: "Waspada tinggi", tone: "tinggi" },
  4: { label: "Bahaya", tone: "bahaya" },
};

export const RISK_FILTERS: { tone: RiskTone; label: string }[] = [
  ...Object.values(CLASSES),
  { tone: "ditolak", label: "Ditolak" },
];

/** Label dan nada warna hasil skor. Sampel ditolak tidak punya kelas. */
export function riskOf(result: Pick<SdriResult, "status" | "risk_class">): { label: string; tone: RiskTone } {
  if (result.status !== "VALID") return { label: "Ditolak", tone: "ditolak" };
  return CLASSES[result.risk_class] ?? { label: "Ditolak", tone: "ditolak" };
}

/** Peluang wabah satu desimal dengan koma (08-DESIGN Typography). */
export function formatProbability(pct: number): string {
  return `${pct.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export const TREND_LABEL: Record<Pond["trend"], string> = {
  RAPID_INCREASE: "Naik cepat",
  STABLE: "Stabil",
  DECREASING: "Turun",
  INSUFFICIENT_DATA: "Data belum cukup",
};

/** Urutan default daftar kolam: peluang tertinggi dulu, lalu sampel ditolak, lalu kolam tanpa sampel. */
export function riskRank(result: Pick<SdriResult, "status" | "probability_pct"> | null): number {
  if (!result) return -2;
  return result.status === "VALID" ? result.probability_pct : -1;
}
