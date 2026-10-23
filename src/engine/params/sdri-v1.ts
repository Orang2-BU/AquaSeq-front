// Semua ambang, bobot, dan lantai SDRI v1 (docs/sdri-v1.md). Satu-satunya tempat angka kalibrasi.
// Nilai bertanda [kalibrasi] di dokumen akan disesuaikan dengan data pilot; ubah = naikkan VERSION.

export const VERSION = 'sdri-v1';

/** sdri-v1 §3: gerbang validitas */
export const GATE = {
  ppcMaxCt: 22,
  efficiencyMinPct: 90,
  efficiencyMaxPct: 110,
  r2Min: 0.98,
  replicateSdMax: 0.2,
  nanoporeMinReads: 5000,
} as const;

/** sdri-v1 §4: Ct ≥ 35 atau tidak teramplifikasi = tidak terdeteksi (ND) */
export const ND_CT = 35;

/** sdri-v1 §5.1: LLOQ (salinan per reaksi) dan skor positif di bawah LLOQ */
export const LLOQ_RXN = 10;
export const BELOW_LLOQ_SCORE = 25;
/** Rentang log10(copies/mL) yang dipetakan ke [lantai, 100] */
export const PATHO_LOG_RANGE = [0, 3] as const;
export const PATHO_FLOOR = { pirA: 60, vp28: 75, swp1: 40 } as const;

/** sdri-v1 §5.2: [aman, batas peringatan, nilai 100]; higherIsBad=false untuk DO dan alkalinitas */
export const CHEM_BANDS = {
  nh3: { safe: 0.05, warn: 0.1, critEnd: 0.3, higherIsBad: true },
  nitrite: { safe: 0.5, warn: 1.0, critEnd: 3.0, higherIsBad: true },
  h2s: { safe: 0.005, warn: 0.01, critEnd: 0.05, higherIsBad: true },
  do: { safe: 5.0, warn: 4.0, critEnd: 2.0, higherIsBad: false },
  tom: { safe: 70, warn: 90, critEnd: 150, higherIsBad: true },
  alkalinity: { safe: 120, warn: 100, critEnd: 60, higherIsBad: false },
} as const;
/** Zona peringatan 40-69, zona kritis 70-100 */
export const CHEM_WARN_SCORE = [40, 69] as const;
export const CHEM_CRIT_SCORE = [70, 100] as const;

/** sdri-v1 §5.3: fold regulation amoA terhadap CTRL kolam */
export const NITRI = {
  okMin: 1,
  midMin: -2,
  midScore: 40,
  critStart: 70,
  critEnd: 100,
  critEndFr: -8,
} as const;

/** sdri-v1 §5.4: genus oportunis dan skala */
export const MICRO = {
  opportunists: ['Vibrio', 'Photobacterium', 'Alteromonas', 'Pseudoalteromonas'],
  opportunistPctRange: [10, 60] as const,
  shannonDropFull: 0.5,
  weightOpportunist: 0.6,
  weightShannon: 0.4,
} as const;

/** sdri-v1 §6: bobot stres lingkungan dan plafon */
export const ENV_WEIGHTS = { chem: 0.5, nitri: 0.25, micro: 0.25 } as const;
export const ENV_CEILING = 0.69;

/** sdri-v1 §6: batas bawah tiap kelas */
export const CLASS_MIN = { Pantau: 20, Waspada: 40, Kritis: 70 } as const;

/** sdri-v1 §7: meter keyakinan hasil negatif */
export const CONFIDENCE = { theta: 0.45, p: 0.85, target: 0.95, maxSamples: 20 } as const;

/** sdri-v1 §8: EWMA */
export const EWMA = { lambda: 0.3, L: 3, baselineSamples: 3 } as const;
