// Tipe masukan dan keluaran mesin SDRI. TS murni, tanpa React/Expo.

export type Pathogen = 'pirA' | 'vp28' | 'swp1';
export type RiskClass = 'Aman' | 'Pantau' | 'Waspada' | 'Kritis';
type GateStatus = 'LULUS' | 'TINJAU' | 'DITOLAK';

/** Satu langkah jejak bukti: aturan sdri-v1 yang dipakai, label untuk manusia, dan nilainya. */
export interface TraceStep {
  rule: string;
  label: string;
  value: number | string | null;
}

/** Setiap angka untuk pengguna dibawa bersama jejaknya (02-AGENT §3). */
export interface Traced<T = number> {
  value: T;
  trace: TraceStep[];
}

export interface Curve {
  slope: number;
  intercept: number;
}

export interface Volumes {
  waterMl: number;
  elutionUl: number;
  templateUl: number;
}

export interface Chemistry {
  temperature: number;
  ph: number;
  tan: number;
  nitrite: number;
  dissolvedO2: number;
  h2s?: number | null;
  tom?: number | null;
  alkalinity?: number | null;
}

export interface MicrobeProfile {
  reads: number;
  /** % read genus oportunis (Vibrio, Photobacterium, Alteromonas, Pseudoalteromonas) */
  opportunistPct: number;
  shannon: number;
  ctrlShannon: number;
}

/** Masukan satu sampel yang sudah diringkas dari well (Ct = rata-rata replikat yang tidak dikeluarkan). */
export interface SampleInput {
  ppcCt: number | null;
  curve: Curve;
  volumes: Volumes;
  cts: Record<Pathogen, number | null>;
  ref16sDetected: boolean;
  ntcContaminated: readonly Pathogen[];
  replicateSdMax: number;
  chemistry: Chemistry | null;
  /** fold regulation amoA terhadap CTRL kolam; null bila belum ada */
  foldRegulation: number | null;
  microbe: MicrobeProfile | null;
}

export interface Gate {
  status: GateStatus;
  reasons: string[];
}
