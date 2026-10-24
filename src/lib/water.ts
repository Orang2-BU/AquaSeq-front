// Parameter kimia air (09-API-KONTRAK §5). Rentang acuan hanya penanda tampilan untuk budidaya vaname
// (SNI 8008:2014), bukan bagian skor; skor tetap dari backend.

type Key =
  | "temp_c"
  | "ph"
  | "do_mg_l"
  | "tan_mg_l"
  | "nh3_mg_l"
  | "no2_mg_l"
  | "h2s_mg_l"
  | "tom_mg_l"
  | "alkalinity"
  | "salinity_ppt"
  | "transparency_cm";

export const WATER_PARAMS: { key: Key; label: string; unit: string; digits: number; min?: number; max?: number }[] = [
  { key: "temp_c", label: "Suhu", unit: "°C", digits: 1, min: 28, max: 32 },
  { key: "ph", label: "pH", unit: "", digits: 1, min: 7.5, max: 8.5 },
  { key: "do_mg_l", label: "DO", unit: "mg/L", digits: 1, min: 4 },
  { key: "tan_mg_l", label: "TAN", unit: "mg/L", digits: 2, max: 1 },
  { key: "nh3_mg_l", label: "NH₃ bebas", unit: "mg/L", digits: 3, max: 0.1 },
  { key: "no2_mg_l", label: "NO₂", unit: "mg/L", digits: 2, max: 1 },
  { key: "h2s_mg_l", label: "H₂S", unit: "mg/L", digits: 3, max: 0.01 },
  { key: "tom_mg_l", label: "TOM", unit: "mg/L", digits: 1, max: 90 },
  { key: "alkalinity", label: "Alkalinitas", unit: "mg/L", digits: 0, min: 100, max: 150 },
  { key: "salinity_ppt", label: "Salinitas", unit: "ppt", digits: 1, min: 10, max: 35 },
  { key: "transparency_cm", label: "Kecerahan", unit: "cm", digits: 0, min: 30, max: 50 },
];

/** Parameter utama untuk tabel padat. */
export const CORE_WATER = WATER_PARAMS.filter((p) =>
  ["temp_c", "ph", "do_mg_l", "tan_mg_l", "nh3_mg_l"].includes(p.key),
);

/** Nilai di luar rentang acuan (penanda tampilan). */
export function outOfRange(param: (typeof WATER_PARAMS)[number], value: number | null): boolean {
  if (value === null) return false;
  return (param.min !== undefined && value < param.min) || (param.max !== undefined && value > param.max);
}

/**
 * Zona NH₃ bebas dari nilai backend (penanda tampilan, acuan SNI ≤ 0,1 mg/L), bukan skor risiko.
 */
export function nh3Zone(nh3: number): { label: string; tone: "ok" | "warn" | "crit" } {
  if (nh3 <= 0.05) return { label: "Aman", tone: "ok" };
  if (nh3 <= 0.1) return { label: "Perlu dipantau", tone: "warn" };
  return { label: "Di atas acuan", tone: "crit" };
}

/** Isian form catat air (P38) sesuai urutan di layar. */
export const WATER_FIELDS = [
  "temp_c",
  "ph",
  "do_mg_l",
  "tan_mg_l",
  "no2_mg_l",
  "h2s_mg_l",
  "tom_mg_l",
  "alkalinity",
  "salinity_ppt",
  "transparency_cm",
] as const;
