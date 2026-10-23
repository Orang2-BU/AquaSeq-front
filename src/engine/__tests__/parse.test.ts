import { buildSeed } from '@/data/seed';
import { parseNanoporeCsv } from '@/engine/parse/nanopore-csv';
import { parseQpcrCsv, toQpcrCsv } from '@/engine/parse/qpcr-csv';

const run = buildSeed().runs.at(-1)!;

describe('parser CSV qPCR', () => {
  test('CSV contoh (ekspor seed) terbaca utuh', () => {
    const result = parseQpcrCsv(toQpcrCsv(run.wells, run.standards));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.wells).toHaveLength(run.wells.length);
    expect(result.data.standards).toHaveLength(15);
    const c6 = result.data.wells.find((w) => w.id === run.wells[5].id)!;
    expect(c6.ct).toBe(run.wells[5].ct);
  });

  test('baris rusak memberi pesan berisi nomor baris', () => {
    const csv = [
      'well,sample_code,target,ct_rep,tm',
      'A1,POND-TOX,pirA,18.81,79.8',
      'Z9,POND-TOX,pirA,18.84,79.8',
      'A3,POND-TOX,kodok,abc,79.8',
      '',
      'std_level,copies_rxn,ct',
      'STD-1,100000,19.85',
      'STD-2,10000,23.2',
      'STD-3,1000,26.55',
    ].join('\n');
    const result = parseQpcrCsv(csv);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual(
      expect.arrayContaining([
        { row: 3, message: 'Well "Z9" bukan A1-H12' },
        expect.objectContaining({ row: 4, message: expect.stringMatching(/Target "kodok"/) }),
        expect.objectContaining({ row: 4, message: expect.stringMatching(/Ct "abc"/) }),
      ]),
    );
  });

  test('Ct "Undetermined" dan koma desimal diterima', () => {
    const csv =
      'well,sample_code,target,ct_rep,tm\nA1,S1,pirA,Undetermined,\nA2,S1,PPC,"19,95",78.4\n\n' +
      'std_level,copies_rxn,ct\nSTD-1,1000,26.55\nSTD-2,100,29.9\nSTD-3,10,33.25\n';
    const result = parseQpcrCsv(csv);
    expect(result.ok && result.data.wells.map((w) => w.ct)).toEqual([null, 19.95]);
  });

  test('menolak CSV tanpa kurva standar', () => {
    const result = parseQpcrCsv('well,sample_code,target,ct_rep,tm\nA1,S1,PPC,19.9,78\n');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0].message).toMatch(/minimal 3 titik/);
  });
});

describe('parser CSV Nanopore', () => {
  const csv = [
    'sample_code,taxon,rank,read_count,abundance',
    'B03,Vibrio,genus,5200,0.40',
    'B03,Pseudoalteromonas,genus,1300,0.10',
    'B03,Rhodobacter,genus,6500,0.50',
    'A01,Vibrio,genus,90,0.01',
  ].join('\n');

  test('membaca baris milik sampel dan menjumlah read genus', () => {
    const result = parseNanoporeCsv(csv, 'B03');
    expect(result.ok && result.data.totalReads).toBe(13000);
    expect(result.ok && result.data.taxa).toHaveLength(3);
  });

  test('header salah ditolak di baris 1', () => {
    const result = parseNanoporeCsv('kode,takson\nB03,Vibrio', 'B03');
    expect(!result.ok && result.errors[0].row).toBe(1);
  });

  test('read_count bukan bilangan bulat memberi galat per baris', () => {
    const result = parseNanoporeCsv(csv.replace('5200', '52.5'), 'B03');
    expect(!result.ok && result.errors[0]).toEqual({
      row: 2,
      message: 'read_count "52.5" harus bilangan bulat ≥ 0',
    });
  });
});
