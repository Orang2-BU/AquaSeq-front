import type { SampleInput } from '@/engine/types';

// 5 arketipe dari dokumen kerangka GSI (docs/sdri-v1.md §9). Status data belum dikonfirmasi GSI,
// jadi diperlakukan sebagai SIMULASI. Angka sama dengan scripts/sdri_v1_check.py (dasar tes emas).
const RUN = {
  curve: { slope: -3.35, intercept: 36.6 },
  volumes: { waterMl: 250, elutionUl: 100, templateUl: 5 },
  ref16sDetected: true,
  ntcContaminated: [],
  replicateSdMax: 0.05,
  microbe: null,
} as const;

const chem = (
  tan: number,
  ph: number,
  nitrite: number,
  h2s: number,
  dissolvedO2: number,
  tom: number,
  alkalinity: number,
) => ({ temperature: 30, ph, tan, nitrite, h2s, dissolvedO2, tom, alkalinity });

export const GSI_ARCHETYPES: { code: string; provenance: 'simulasi'; input: SampleInput }[] = [
  {
    code: 'CTRL',
    provenance: 'simulasi',
    input: {
      ...RUN,
      ppcCt: 19.95,
      chemistry: chem(0.25, 7.8, 0.08, 0.001, 6.4, 34.5, 140),
      foldRegulation: 1.0,
      cts: { pirA: null, vp28: null, swp1: null },
    },
  },
  {
    code: 'POND-BIO',
    provenance: 'simulasi',
    input: {
      ...RUN,
      ppcCt: 19.95,
      chemistry: chem(0.6, 7.9, 0.35, 0.002, 5.8, 78, 165),
      foldRegulation: 99.04,
      cts: { pirA: 34.25, vp28: null, swp1: null },
    },
  },
  {
    code: 'POND-TOX',
    provenance: 'simulasi',
    input: {
      ...RUN,
      ppcCt: 19.95,
      chemistry: chem(3.2, 8.4, 4.85, 0.092, 2.65, 128.4, 82),
      foldRegulation: -3.95,
      cts: { pirA: 18.84, vp28: null, swp1: 25.16 },
    },
  },
  {
    code: 'POND-REM',
    provenance: 'simulasi',
    input: {
      ...RUN,
      ppcCt: 19.95,
      chemistry: chem(0.45, 7.85, 0.42, 0.004, 5.5, 52, 148),
      foldRegulation: 10.41,
      cts: { pirA: 27.89, vp28: null, swp1: 28.56 },
    },
  },
  {
    code: 'UNK-HUMIC',
    provenance: 'simulasi',
    input: {
      ...RUN,
      ppcCt: 24.46,
      chemistry: null,
      foldRegulation: null,
      cts: { pirA: null, vp28: null, swp1: null },
    },
  },
];
