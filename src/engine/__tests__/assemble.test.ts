import { buildSeed } from '@/data/seed';
import { assembleSample } from '@/engine/assemble';

const run = buildSeed().runs.at(-1)!;
const base = {
  wells: run.wells,
  code: 'POND-TOX',
  refCode: 'CTRL',
  curve: { slope: -3.35, intercept: 36.6 },
  volumes: { waterMl: 250, elutionUl: 100, templateUl: 5 },
  chemistry: null,
  nanopore: null,
  refNanopore: null,
};

describe('perakit well → masukan engine', () => {
  test('rata-rata replikat sama dengan Ct arketipe, fold regulation dari ΔΔCt 1,98', () => {
    const input = assembleSample(base);
    expect(input.cts.pirA).toBeCloseTo(18.84, 6);
    expect(input.cts.vp28).toBeNull();
    expect(input.ppcCt).toBeCloseTo(19.95, 6);
    // Seed memakai ΔΔCt 1,98 (Ct 2 desimal seperti alat), arketipe GSI menulis FR -3,95.
    expect(input.foldRegulation!).toBeCloseTo(-(2 ** 1.98), 6);
    expect(input.ntcContaminated).toEqual([]);
  });

  test('NTC pirA teramplifikasi tercatat sebagai kontaminasi', () => {
    const wells = run.wells.map((w) =>
      w.sampleCode === 'NTC' && w.target === 'pirA' ? { ...w, ct: 31.2 } : w,
    );
    expect(assembleSample({ ...base, wells }).ntcContaminated).toEqual(['pirA']);
  });

  test('well yang dikeluarkan tidak ikut rata-rata', () => {
    const pirA = run.wells.filter((w) => w.sampleCode === 'POND-TOX' && w.target === 'pirA');
    const wells = run.wells.map((w) =>
      w.id === pirA[0].id ? { ...w, excluded: { reason: 'pencilan', at: '' } } : w,
    );
    const expected = (pirA[1].ct! + pirA[2].ct!) / 2;
    expect(assembleSample({ ...base, wells }).cts.pirA).toBeCloseTo(expected, 6);
  });

  test('profil Nanopore dihitung terhadap Shannon sampel acuan', () => {
    const taxa = (vibrio: number, other: number) => [
      { taxon: 'Vibrio', rank: 'genus', reads: vibrio },
      { taxon: 'Rhodobacter', rank: 'genus', reads: other },
      { taxon: 'Ruegeria', rank: 'genus', reads: other },
    ];
    const input = assembleSample({
      ...base,
      nanopore: { totalReads: 12000, taxa: taxa(6000, 3000) },
      refNanopore: { taxa: taxa(4000, 4000) },
    });
    expect(input.microbe!.opportunistPct).toBeCloseTo(50, 6);
    expect(input.microbe!.ctrlShannon).toBeCloseTo(Math.log(3), 6);
    expect(input.microbe!.shannon).toBeLessThan(input.microbe!.ctrlShannon);
  });
});
