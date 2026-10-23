import { foldRegulation } from './convert';
import { MICRO, ND_CT } from './params/sdri-v1';
import type { Chemistry, Curve, MicrobeProfile, Pathogen, SampleInput, Volumes } from './types';

/** Bentuk well minimum yang dibutuhkan engine (sama dengan src/data Well). */
export interface WellLike {
  sampleCode: string;
  target: string;
  ct: number | null;
  excluded?: unknown;
}

export interface TaxonLike {
  taxon: string;
  rank: string;
  reads: number;
}

const PATHOGENS: Pathogen[] = ['pirA', 'vp28', 'swp1'];
const detected = (ct: number | null): ct is number => ct !== null && ct < ND_CT;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs: number[]) =>
  xs.length < 2 ? 0 : Math.sqrt(xs.reduce((a, x) => a + (x - mean(xs)) ** 2, 0) / (xs.length - 1));

/** Ct replikat terdeteksi (well yang dikeluarkan analis diabaikan). */
function replicateCts(wells: WellLike[], code: string, target: string): number[] {
  return wells
    .filter((w) => w.sampleCode === code && w.target === target && !w.excluded)
    .map((w) => w.ct)
    .filter(detected);
}

const meanCt = (cts: number[]) => (cts.length ? mean(cts) : null);

/** sdri-v1 §5.4: % read genus oportunis dan indeks Shannon tingkat genus. */
function nanoporeMetrics(taxa: TaxonLike[]) {
  const genera = taxa.filter((t) => t.rank === 'genus' && t.reads > 0);
  const total = genera.reduce((a, t) => a + t.reads, 0);
  if (!total) return { opportunistPct: 0, shannon: 0 };
  const opp = genera
    .filter((t) => (MICRO.opportunists as readonly string[]).includes(t.taxon))
    .reduce((a, t) => a + t.reads, 0);
  const shannon = -genera.reduce((a, t) => a + (t.reads / total) * Math.log(t.reads / total), 0);
  return { opportunistPct: (opp / total) * 100, shannon };
}

/** Merakit masukan engine dari well run, metadata sampel, dan sampel acuan (CTRL) run yang sama. */
export function assembleSample(args: {
  wells: WellLike[];
  code: string;
  refCode: string | null;
  curve: Curve;
  volumes: Volumes;
  chemistry: Chemistry | null;
  nanopore: { totalReads: number; taxa: TaxonLike[] } | null;
  refNanopore: { taxa: TaxonLike[] } | null;
}): SampleInput {
  const { wells, code, refCode } = args;
  const cts = Object.fromEntries(
    PATHOGENS.map((p) => [p, meanCt(replicateCts(wells, code, p))]),
  ) as Record<Pathogen, number | null>;

  const replicateSdMax = Math.max(
    0,
    ...[...PATHOGENS, 'amoA', '16S'].map((t) => sd(replicateCts(wells, code, t))),
  );

  const ntcContaminated = PATHOGENS.filter((p) =>
    wells.some((w) => w.sampleCode === 'NTC' && w.target === p && !w.excluded && detected(w.ct)),
  );

  const amoA = meanCt(replicateCts(wells, code, 'amoA'));
  const ref16s = meanCt(replicateCts(wells, code, '16S'));
  const ctrlAmoA = refCode ? meanCt(replicateCts(wells, refCode, 'amoA')) : null;
  const ctrl16s = refCode ? meanCt(replicateCts(wells, refCode, '16S')) : null;
  const fr =
    amoA !== null && ref16s !== null && ctrlAmoA !== null && ctrl16s !== null
      ? foldRegulation({ amoA, ref16s }, { amoA: ctrlAmoA, ref16s: ctrl16s })
      : null;

  let microbe: MicrobeProfile | null = null;
  if (args.nanopore && args.refNanopore) {
    const m = nanoporeMetrics(args.nanopore.taxa);
    microbe = {
      reads: args.nanopore.totalReads,
      opportunistPct: m.opportunistPct,
      shannon: m.shannon,
      ctrlShannon: nanoporeMetrics(args.refNanopore.taxa).shannon,
    };
  }

  return {
    ppcCt: meanCt(replicateCts(wells, code, 'PPC')),
    curve: args.curve,
    volumes: args.volumes,
    cts,
    ref16sDetected: ref16s !== null,
    ntcContaminated,
    replicateSdMax,
    chemistry: args.chemistry,
    foldRegulation: fr,
    microbe,
  };
}
