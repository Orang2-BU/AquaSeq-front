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

/** Batas peluang tiap kelas dari backend (`classifyRisk`), hanya untuk garis acuan grafik. */
export const CLASS_THRESHOLDS = [5, 25, 60];

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
  MODERATE_INCREASE: "Naik perlahan",
  STABLE: "Stabil",
  DECREASING: "Turun",
  INSUFFICIENT_DATA: "Data belum cukup",
};

/** Urutan default daftar kolam: peluang tertinggi dulu, lalu sampel ditolak, lalu kolam tanpa sampel. */
export function riskRank(result: Pick<SdriResult, "status" | "probability_pct"> | null): number {
  if (!result) return -2;
  return result.status === "VALID" ? result.probability_pct : -1;
}

/** Alasan penolakan sampel untuk ditampilkan; sampel valid tidak punya alasan. */
export function rejectedReason(status: SdriResult["status"]): string {
  return status === "REJECTED_INHIBITOR"
    ? "Kontrol kualitas di luar rentang: reaksi terhambat inhibitor"
    : status === "REJECTED_INVALID_QC"
      ? "Kontrol mutu run tidak lolos"
      : "";
}

export const SUBSCORES = [
  { key: "s_qpcr", label: "S_qPCR", meaning: "Kadar jejak patogen (panel jejak penyakit)" },
  { key: "s_bio", label: "S_Bio", meaning: "Bioindikator (amoA terhadap 16S)" },
  { key: "s_chem", label: "S_Chem", meaning: "Kimia air (DO, TAN, NO₂, H₂S, TOM)" },
] as const;

/** Subskor terbesar sebagai "pemicu utama" di pesan WA. Hanya memilih, tidak menghitung skor. */
export function primaryDriver(result: Pick<SdriResult, "s_qpcr" | "s_bio" | "s_chem">): string {
  const top = SUBSCORES.toSorted((a, b) => result[b.key] - result[a.key])[0];
  return `${top.meaning} (${top.label} ${result[top.key].toLocaleString("id-ID")})`;
}
