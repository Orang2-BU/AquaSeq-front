import type { Chemistry } from '@/engine/types';

import type { DataState, Pond, Run, Sample, Well, WellTarget } from '../types';
import { GSI_ARCHETYPES } from './gsi-archetypes';

// Data demo SIMULASI: 1 tambak, 5 kolam, 8 run mingguan (minggu 0-7).
// Minggu 7 = 5 arketipe GSI apa adanya (dasar tes emas); minggu 0-6 = riwayat sintetis untuk tren.
// Semua entitas berlabel provenance 'simulasi' dan wajib tampil dengan badge SIMULASI.

export const SEED_VERSION = 1;
const WEEKS = 8;
const LATEST = '2026-10-23';
const CURVE = { slope: -3.35, intercept: 36.6 };
const VOLUMES = { waterMl: 250, elutionUl: 100, templateUl: 5 };
const REF_16S = 14.2;
const CTRL_AMOA = 22.0;
const TM: Record<WellTarget, number> = {
  pirA: 79.8,
  vp28: 81.2,
  swp1: 83.5,
  amoA: 84.1,
  '16S': 85.6,
  PPC: 78.4,
};

type Ct = number | null;
const arch = (code: string) => GSI_ARCHETYPES.find((a) => a.code === code)!.input;

/** Lintasan per kolam; indeks = minggu 0..7. Ct null = tidak teramplifikasi. */
const PONDS: {
  pond: Omit<Pond, 'stockedAt' | 'provenance'>;
  archetype: string;
  docLatest: number;
  pirA: Ct[];
  swp1: Ct[];
  /** ΔΔCt amoA terhadap CTRL per minggu (FR = 2^-ΔΔCt) */
  ddCt: number[];
  /** campuran kimia: 0 = kimia CTRL, 1 = kimia arketipe; 'peak' = kimia buruk sementara */
  chemMix: (number | 'peak')[];
}[] = [
  {
    pond: { id: 'A-01', farmId: 'F-1', name: 'Kolam A-01', system: 'intensif' },
    archetype: 'CTRL',
    docLatest: 64,
    pirA: Array(WEEKS).fill(null),
    swp1: Array(WEEKS).fill(null),
    ddCt: Array(WEEKS).fill(0),
    chemMix: Array(WEEKS).fill(0),
  },
  {
    pond: { id: 'A-02', farmId: 'F-1', name: 'Kolam A-02', system: 'bioflok' },
    archetype: 'POND-BIO',
    docLatest: 60,
    pirA: [null, null, null, null, null, null, 34.6, 34.25],
    swp1: Array(WEEKS).fill(null),
    ddCt: [0, -0.9, -1.9, -2.8, -3.8, -4.7, -5.7, -6.63],
    chemMix: [0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
  },
  {
    pond: { id: 'B-03', farmId: 'F-1', name: 'Kolam B-03', system: 'intensif' },
    archetype: 'POND-TOX',
    docLatest: 85,
    pirA: [null, null, null, 33.6, 30.4, 26.3, 22.2, 18.84],
    swp1: [null, null, null, null, 31.0, 28.8, 27.0, 25.16],
    ddCt: [0, 0.1, 0.3, 0.5, 0.8, 1.2, 1.6, 1.98],
    chemMix: [0, 0.02, 0.06, 0.12, 0.22, 0.38, 0.62, 1],
  },
  {
    pond: { id: 'B-05', farmId: 'F-1', name: 'Kolam B-05', system: 'intensif' },
    archetype: 'POND-REM',
    docLatest: 90,
    pirA: [null, null, 31.2, 27.4, 24.1, 25.3, 26.6, 27.89],
    swp1: [null, null, null, 30.5, 27.9, 28.1, 28.3, 28.56],
    ddCt: [0, -0.4, -0.9, -1.4, -1.9, -2.4, -2.9, -3.38],
    chemMix: [0, 0, 0.3, 'peak', 'peak', 0.6, 0.3, 1],
  },
  {
    pond: { id: 'C-07', farmId: 'F-1', name: 'Kolam C-07', system: 'intensif' },
    archetype: 'UNK-HUMIC',
    docLatest: 40,
    pirA: Array(WEEKS).fill(null),
    swp1: Array(WEEKS).fill(null),
    ddCt: Array(WEEKS).fill(0),
    chemMix: Array(WEEKS).fill(0),
  },
];

/** Kimia buruk sementara B-05 sebelum remediasi (SIMULASI). */
const PEAK_CHEM: Chemistry = {
  temperature: 30,
  ph: 8.2,
  tan: 1.6,
  nitrite: 1.4,
  dissolvedO2: 3.8,
  h2s: 0.012,
  tom: 96,
  alkalinity: 104,
};

/** Variasi kecil deterministik ±amp (bukan Math.random supaya seed sama setiap kali). */
function jitter(seed: number, amp: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * amp;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function blendChem(a: Chemistry, b: Chemistry, t: number): Chemistry {
  const mix = (x: number, y: number) => round2(x + (y - x) * t);
  return {
    temperature: mix(a.temperature, b.temperature),
    ph: mix(a.ph, b.ph),
    tan: mix(a.tan, b.tan),
    nitrite: mix(a.nitrite, b.nitrite),
    dissolvedO2: mix(a.dissolvedO2, b.dissolvedO2),
    h2s: Math.round((a.h2s! + (b.h2s! - a.h2s!) * t) * 1000) / 1000,
    tom: mix(a.tom!, b.tom!),
    alkalinity: mix(a.alkalinity!, b.alkalinity!),
  };
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WELL_IDS = 'ABCDEFGH'
  .split('')
  .flatMap((r) => Array.from({ length: 12 }, (_, i) => `${r}${i + 1}`));

export function buildSeed(): DataState {
  const runs: Run[] = [];
  const samples: Sample[] = [];
  const ctrlChem = arch('CTRL').chemistry!;

  for (let w = 0; w < WEEKS; w++) {
    const date = addDays(LATEST, -7 * (WEEKS - 1 - w));
    const runId = `RUN-${date}`;
    const wells: Well[] = [];
    let n = 0;
    const put = (sampleCode: string, target: WellTarget, ct: Ct, reps: 1 | 3) => {
      // Replikat simetris (−j, 0, +j): rata-rata Ct tepat sama dengan nilai arketipe.
      const j = round2(Math.abs(jitter(w * 1000 + n, 0.03)));
      const offsets = reps === 1 ? [0] : [-j, 0, j];
      for (const off of offsets) {
        const k = w * 1000 + n;
        wells.push({
          id: WELL_IDS[n++],
          sampleCode,
          target,
          ct: ct === null ? null : round2(ct + off),
          tm: ct === null ? null : round2(TM[target] + jitter(k + 7, 0.15)),
        });
      }
    };

    for (const p of PONDS) {
      const doc = p.docLatest - 7 * (WEEKS - 1 - w);
      if (doc < 1) continue; // kolam belum ditebar
      const latest = w === WEEKS - 1;
      const code = latest
        ? p.archetype
        : `${p.pond.id.replace('-', '')}-${date.slice(5).replace('-', '')}`;
      const a = arch(p.archetype);
      const mix = p.chemMix[w];
      const chemistry = latest
        ? a.chemistry
        : mix === 'peak'
          ? PEAK_CHEM
          : blendChem(ctrlChem, a.chemistry ?? ctrlChem, mix);

      put(code, 'PPC', latest ? a.ppcCt : 19.95, 1);
      put(code, 'pirA', p.pirA[w], 3);
      put(code, 'vp28', null, 3);
      put(code, 'swp1', p.swp1[w], 3);
      put(code, 'amoA', CTRL_AMOA + p.ddCt[w], 3);
      put(code, '16S', REF_16S, 3);
      samples.push({
        id: `${p.pond.id}-${date}`,
        runId,
        pondId: p.pond.id,
        code,
        role: p.archetype === 'CTRL' ? 'acuan' : 'uji',
        takenAt: date,
        doc,
        volumes: VOLUMES,
        chemistry,
        nanopore: null,
        provenance: 'simulasi',
      });
    }
    for (const t of ['pirA', 'vp28', 'swp1', 'amoA', '16S'] as const) put('NTC', t, null, 1);
    put('GDC', '16S', null, 1);

    runs.push({
      id: runId,
      lab: 'Lab mitra GSI (SIMULASI)',
      instrument: 'QuantStudio 5',
      date,
      // Triplikat simetris per level: regresi tepat m = -3,35, b = 36,6 seperti dokumen GSI.
      standards: [1e1, 1e2, 1e3, 1e4, 1e5].flatMap((copies, i) => {
        const j = round2(Math.abs(jitter(w * 100 + i, 0.02)));
        const ct = CURVE.intercept + CURVE.slope * Math.log10(copies);
        return [-j, 0, j].map((off) => ({ copiesRxn: copies, ct: round2(ct + off) }));
      }),
      wells,
      provenance: 'simulasi',
    });
  }

  const ponds: Pond[] = PONDS.map((p) => ({
    ...p.pond,
    stockedAt: addDays(LATEST, -p.docLatest),
    provenance: 'simulasi',
  }));

  const latestRun = runs.at(-1)!;
  const reports = samples
    .filter((s) => s.runId === latestRun.id && s.code !== 'UNK-HUMIC')
    .map((s) => ({
      id: `RPT-${s.id}`,
      sampleId: s.id,
      publishedAt: `${LATEST}T15:20:00+07:00`,
      publishedBy: 'Analis lab (SIMULASI)',
      provenance: 'simulasi' as const,
    }));

  return {
    version: SEED_VERSION,
    farms: [
      {
        id: 'F-1',
        name: 'Tambak Sumberejo',
        location: 'Wongsorejo, Banyuwangi',
        provenance: 'simulasi',
      },
    ],
    ponds,
    runs,
    samples,
    reports,
    resolvedAlerts: [],
  };
}
