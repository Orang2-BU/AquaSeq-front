// Entitas data (03-ARCHITECTURE §4). Skor SDRI, gerbang, dan peringatan tidak disimpan:
// selalu dihitung ulang dari data mentah lewat src/engine supaya tidak pernah basi.
import type { Evaluation } from '@/engine/sdri';
import type { Chemistry, Gate, Pathogen, RiskClass } from '@/engine/types';

type Provenance = 'simulasi' | 'nyata';
export type WellTarget = Pathogen | 'amoA' | '16S' | 'PPC';

interface Farm {
  id: string;
  name: string;
  location: string;
  provenance: Provenance;
}

export interface Pond {
  id: string;
  farmId: string;
  name: string;
  system: 'intensif' | 'bioflok';
  stockedAt: string;
  provenance: Provenance;
}

export interface Well {
  id: string; // A1..H12
  /** kode sampel, atau 'NTC' / 'GDC' untuk kontrol run (target = assay yang dikontrol) */
  sampleCode: string;
  target: WellTarget;
  ct: number | null; // null = Undetermined
  tm: number | null;
  excluded?: { reason: string; at: string };
}

interface StandardPoint {
  copiesRxn: number;
  ct: number;
}

export interface Run {
  id: string;
  lab: string;
  instrument: string;
  date: string;
  standards: StandardPoint[];
  wells: Well[];
  rejected?: { reason: string; at: string };
  provenance: Provenance;
}

interface NanoporeTaxon {
  taxon: string;
  rank: string;
  reads: number;
  abundance: number;
}

interface NanoporeProfile {
  totalReads: number;
  taxa: NanoporeTaxon[];
}

export interface Sample {
  id: string;
  runId: string;
  pondId: string;
  code: string;
  /** acuan = sampel CTRL run, dasar fold regulation amoA dan Shannon pembanding */
  role: 'acuan' | 'uji';
  takenAt: string;
  doc: number | null;
  volumes: { waterMl: number; elutionUl: number; templateUl: number };
  chemistry: Chemistry | null;
  nanopore: NanoporeProfile | null;
  provenance: Provenance;
}

export interface Report {
  id: string;
  sampleId: string;
  publishedAt: string;
  publishedBy: string;
  provenance: Provenance;
}

/** Seluruh isi penyimpanan mock (satu dokumen JSON di AsyncStorage). */
export interface DataState {
  version: number;
  farms: Farm[];
  ponds: Pond[];
  runs: Run[];
  samples: Sample[];
  reports: Report[];
  resolvedAlerts: string[];
}

// ---- bentuk hasil baca (sudah dihitung engine) ----

export interface SampleDetail {
  sample: Sample;
  run: Run;
  pond: Pond;
  evaluation: Evaluation;
  nh3: number | null;
  report: Report | null;
}

export interface RunDetail {
  run: Run;
  curve: { slope: number; intercept: number; r2: number; efficiencyPct: number };
  gate: Gate;
  samples: {
    sample: Sample;
    gate: Gate;
    sdri: number | null;
    cls: RiskClass | null;
    published: boolean;
  }[];
}

export interface PondSummary {
  pond: Pond;
  latest: SampleDetail | null;
}

export interface PondHistoryPoint {
  sampleId: string;
  takenAt: string;
  sdri: number | null;
  copiesMl: Record<Pathogen, number | null>;
}

export interface PondDetail extends PondSummary {
  history: PondHistoryPoint[];
  /** jumlah sampel berturut-turut terakhir yang ND per patogen (untuk meter keyakinan) */
  ndStreak: Record<Pathogen, number>;
}

export interface Alert {
  id: string; // = sampleId
  pond: Pond;
  sampleId: string;
  cls: 'Waspada' | 'Kritis';
  sdri: number;
  takenAt: string;
  resolved: boolean;
}

export type ImportResult =
  { ok: true; id: string } | { ok: false; errors: { row: number; message: string }[] };
