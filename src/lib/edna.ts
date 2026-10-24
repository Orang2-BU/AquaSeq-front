import type { Tone } from "@/components/ui";
import type { SdriResult } from "@/lib/api";

// Label temuan eDNA mikroba dari backend (`internal/sdri/features.go`: X1-X12, predicted_disease).
// Hanya menerjemahkan kode ke teks; nilai, ambang, dan status tetap dari backend.

type Evidence = NonNullable<SdriResult["evidence"]>[number];

/** Nama fitur temuan eDNA (kode backend → label) dan satuannya. */
const FEATURES: Record<string, { label: string; unit: string; group: "mikroba" | "patogen" | "kimia" | "kontrol" }> = {
  kontrol_kualitas: { label: "Kontrol kualitas", unit: "", group: "kontrol" },
  fold_regulation_amoa: { label: "Bakteri nitrifikasi (amoA terhadap 16S)", unit: "kali", group: "mikroba" },
  indeks_disbiosis: { label: "Indeks disbiosis (patogen terhadap bakteri baik)", unit: "log", group: "mikroba" },
  jejak_ahpnd: { label: "Jejak AHPND (Vibrio pembawa PirAB)", unit: "kopi/mL", group: "patogen" },
  jejak_wssv: { label: "Jejak WSSV (bintik putih)", unit: "kopi/mL", group: "patogen" },
  jejak_ehp: { label: "Jejak EHP (mikrosporidia)", unit: "kopi/mL", group: "patogen" },
  nh3_mg_l: { label: "Amonia bebas (NH₃)", unit: "mg/L", group: "kimia" },
  no2_mg_l: { label: "Nitrit (NO₂)", unit: "mg/L", group: "kimia" },
  h2s_mg_l: { label: "Hidrogen sulfida (H₂S)", unit: "mg/L", group: "kimia" },
  do_mg_l: { label: "Oksigen terlarut (DO)", unit: "mg/L", group: "kimia" },
  tom_mg_l: { label: "Bahan organik (TOM)", unit: "mg/L", group: "kimia" },
  alkalinity: { label: "Alkalinitas", unit: "mg/L", group: "kimia" },
  // Kode fitur mentah yang dipakai kontributor anomali di insight kolam.
  ct_ahpnd: { label: "Kadar jejak AHPND", unit: "", group: "patogen" },
  ct_wssv: { label: "Kadar jejak WSSV", unit: "", group: "patogen" },
  ct_ehp: { label: "Kadar jejak EHP", unit: "", group: "patogen" },
  ct_amoa: { label: "Bakteri nitrifikasi (amoA)", unit: "", group: "mikroba" },
  ct_16s: { label: "Total bakteri (16S)", unit: "", group: "mikroba" },
  temp_c: { label: "Suhu", unit: "°C", group: "kimia" },
  ph: { label: "pH", unit: "", group: "kimia" },
  tan_mg_l: { label: "TAN", unit: "mg/L", group: "kimia" },
  salinity_ppt: { label: "Salinitas", unit: "ppt", group: "kimia" },
};

export function featureLabel(code: string) {
  return FEATURES[code] ?? { label: code.replaceAll("_", " "), unit: "", group: "kimia" as const };
}

/** Status temuan backend → nada badge. */
export function evidenceTone(status: Evidence["status"]): { label: string; tone: Tone } {
  switch (status) {
    case "kritis":
      return { label: "Kritis", tone: "crit" };
    case "peringatan":
      return { label: "Peringatan", tone: "warn" };
    case "aman":
      return { label: "Aman", tone: "ok" };
    case "di_luar_acuan":
      return { label: "Di luar acuan", tone: "warn" };
    case "belum_cukup":
      return { label: "Data belum cukup", tone: "neutral" };
    default:
      return { label: status.replaceAll("_", " "), tone: "neutral" };
  }
}

/** Urutan tampil: kritis dulu, lalu peringatan, lalu sisanya. */
export const evidenceRank = (status: string) => (status === "kritis" ? 0 : status === "peringatan" ? 1 : 2);

/** Dugaan dari backend yang berarti "belum ada target di atas ambang" (bukan bukti bebas penyakit). */
export const NO_TARGET = "NO_TARGET_WARNING";

/** Tindakan mitigasi backend bisa berupa teks atau objek ber-sumber; disamakan jadi satu bentuk. */
export function mitigationList(result: Pick<SdriResult, "mitigation_actions">) {
  return (result.mitigation_actions ?? []).map((m) =>
    typeof m === "string" ? { action: m, source: null, priority: null } : m,
  );
}
