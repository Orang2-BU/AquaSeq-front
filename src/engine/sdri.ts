import { copiesPerMl, copiesPerRxn, freeAmmonia, lerp } from './convert';
import {
  BELOW_LLOQ_SCORE,
  CHEM_BANDS,
  CHEM_CRIT_SCORE,
  CHEM_WARN_SCORE,
  CLASS_MIN,
  ENV_CEILING,
  ENV_WEIGHTS,
  LLOQ_RXN,
  MICRO,
  ND_CT,
  NITRI,
  PATHO_FLOOR,
  PATHO_LOG_RANGE,
  VERSION,
} from './params/sdri-v1';
import { sampleGate } from './qc';
import type {
  Chemistry,
  Curve,
  Gate,
  MicrobeProfile,
  Pathogen,
  RiskClass,
  SampleInput,
  Traced,
  TraceStep,
  Volumes,
} from './types';

interface TargetScore {
  target: Pathogen;
  ct: number | null;
  nRxn: number | null;
  copiesMl: number | null;
  status: 'tidak terdeteksi' | 'di bawah LLOQ' | 'terkuantifikasi';
  score: number;
}

/** sdri-v1 §5.1: S_Patho = maksimum skor ketiga patogen (patogen tidak diencerkan). */
function scorePathogens(
  cts: Record<Pathogen, number | null>,
  curve: Curve,
  volumes: Volumes,
): Traced & { perTarget: TargetScore[] } {
  const perTarget = (Object.keys(PATHO_FLOOR) as Pathogen[]).map((target): TargetScore => {
    const ct = cts[target];
    if (ct === null || ct >= ND_CT)
      return { target, ct, nRxn: null, copiesMl: null, status: 'tidak terdeteksi', score: 0 };
    const nRxn = copiesPerRxn(ct, curve);
    const copiesMl = copiesPerMl(nRxn, volumes);
    if (nRxn < LLOQ_RXN)
      return { target, ct, nRxn, copiesMl, status: 'di bawah LLOQ', score: BELOW_LLOQ_SCORE };
    const score = lerp(Math.log10(copiesMl), ...PATHO_LOG_RANGE, PATHO_FLOOR[target], 100);
    return { target, ct, nRxn, copiesMl, status: 'terkuantifikasi', score };
  });
  const value = Math.max(...perTarget.map((t) => t.score));
  const trace: TraceStep[] = perTarget.map((t) => ({
    rule: 'sdri-v1 §5.1',
    label: `${t.target}: Ct ${t.ct ?? 'ND'} → ${t.copiesMl === null ? t.status : `${t.copiesMl.toPrecision(3)} copies/mL (${t.status})`}`,
    value: t.score,
  }));
  trace.push({ rule: 'sdri-v1 §5.1', label: 'S_Patho = maks(skor patogen)', value });
  return { value, trace, perTarget };
}

/** Zona GSI X7-X12: aman → 0, peringatan → 40-69, kritis → 70-100. */
function band(x: number, b: (typeof CHEM_BANDS)[keyof typeof CHEM_BANDS]): number {
  const s = b.higherIsBad ? 1 : -1;
  const [v, safe, warn, end] = [x * s, b.safe * s, b.warn * s, b.critEnd * s];
  if (v <= safe) return 0;
  if (v <= warn) return lerp(v, safe, warn, ...CHEM_WARN_SCORE);
  return lerp(v, warn, end, ...CHEM_CRIT_SCORE);
}

/** sdri-v1 §5.2: S_Chem = maksimum nilai parameter kimia. Parameter kosong dilewati. */
function scoreChemistry(c: Chemistry): Traced & { nh3: number } {
  const nh3 = freeAmmonia(c.tan, c.ph, c.temperature);
  const params: [string, keyof typeof CHEM_BANDS, number | null | undefined][] = [
    ['NH3-N bebas', 'nh3', nh3],
    ['Nitrit', 'nitrite', c.nitrite],
    ['H2S', 'h2s', c.h2s],
    ['DO', 'do', c.dissolvedO2],
    ['TOM', 'tom', c.tom],
    ['Alkalinitas', 'alkalinity', c.alkalinity],
  ];
  const trace: TraceStep[] = params
    .filter(([, , x]) => x !== null && x !== undefined)
    .map(([label, key, x]) => ({
      rule: 'sdri-v1 §5.2',
      label: `${label} ${Number(x).toLocaleString('id-ID', { maximumFractionDigits: 4 })}`,
      value: band(x as number, CHEM_BANDS[key]),
    }));
  const value = Math.max(0, ...trace.map((t) => t.value as number));
  trace.push({ rule: 'sdri-v1 §5.2', label: 'S_Chem = maks(nilai parameter)', value });
  return { value, trace, nh3 };
}

/** sdri-v1 §5.3: kapasitas nitrifikasi dari fold regulation amoA terhadap CTRL. */
function scoreNitrification(fr: number): Traced {
  const value =
    fr >= NITRI.okMin
      ? 0
      : fr >= NITRI.midMin
        ? NITRI.midScore
        : lerp(fr, NITRI.midMin, NITRI.critEndFr, NITRI.critStart, NITRI.critEnd);
  return {
    value,
    trace: [{ rule: 'sdri-v1 §5.3', label: `Fold regulation amoA ${fr.toFixed(2)}`, value }],
  };
}

/** sdri-v1 §5.4: S_Micro = 0,6 × oportunis + 0,4 × penurunan Shannon. */
function scoreMicrobe(m: MicrobeProfile): Traced {
  const a = lerp(m.opportunistPct, ...MICRO.opportunistPctRange, 0, 100);
  const drop = (m.ctrlShannon - m.shannon) / m.ctrlShannon / MICRO.shannonDropFull;
  const b = Math.min(Math.max(100 * drop, 0), 100);
  const value = MICRO.weightOpportunist * a + MICRO.weightShannon * b;
  return {
    value,
    trace: [
      { rule: 'sdri-v1 §5.4', label: `Oportunis ${m.opportunistPct}% read`, value: a },
      { rule: 'sdri-v1 §5.4', label: `Shannon ${m.shannon} vs CTRL ${m.ctrlShannon}`, value: b },
    ],
  };
}

/** sdri-v1 §6: batas kelas. */
function riskClass(sdri: number): RiskClass {
  if (sdri >= CLASS_MIN.Kritis) return 'Kritis';
  if (sdri >= CLASS_MIN.Waspada) return 'Waspada';
  if (sdri >= CLASS_MIN.Pantau) return 'Pantau';
  return 'Aman';
}

export interface Evaluation {
  gate: Gate;
  components: {
    patho: ReturnType<typeof scorePathogens> | null;
    chem: ReturnType<typeof scoreChemistry> | null;
    nitri: Traced | null;
    micro: Traced | null;
  };
  sdri: (Traced & { cls: RiskClass; version: string }) | null;
}

/** sdri-v1 §3-§6: gerbang, empat komponen, gabungan SDRI = S_Patho + (100 − S_Patho) × 0,69 × E. */
export function evaluateSample(s: SampleInput): Evaluation {
  const gate = sampleGate(s);
  if (gate.status === 'DITOLAK')
    return { gate, components: { patho: null, chem: null, nitri: null, micro: null }, sdri: null };

  const patho = scorePathogens(s.cts, s.curve, s.volumes);
  const chem = s.chemistry ? scoreChemistry(s.chemistry) : null;
  const nitri = s.foldRegulation === null ? null : scoreNitrification(s.foldRegulation);
  const microOk = s.microbe && !gate.reasons.some((r) => r.startsWith('Read Nanopore'));
  const micro = microOk ? scoreMicrobe(s.microbe!) : null;

  // Komponen kosong dikeluarkan dan sisa bobot dinormalkan ulang (sdri-v1 §6).
  const candidates: [number, Traced | null][] = [
    [ENV_WEIGHTS.chem, chem],
    [ENV_WEIGHTS.nitri, nitri],
    [ENV_WEIGHTS.micro, micro],
  ];
  const parts = candidates.filter((p): p is [number, Traced] => p[1] !== null);
  const weight = parts.reduce((sum, [w]) => sum + w, 0);
  const e = weight ? parts.reduce((sum, [w, c]) => sum + w * c.value, 0) / weight / 100 : 0;
  const value = patho.value + (100 - patho.value) * ENV_CEILING * e;

  return {
    gate,
    components: { patho, chem, nitri, micro },
    sdri: {
      value,
      cls: riskClass(value),
      version: VERSION,
      trace: [
        { rule: 'sdri-v1 §6', label: 'Stres lingkungan E (0-1)', value: e },
        { rule: 'sdri-v1 §6', label: 'SDRI = S_Patho + (100 − S_Patho) × 0,69 × E', value },
      ],
    },
  };
}
