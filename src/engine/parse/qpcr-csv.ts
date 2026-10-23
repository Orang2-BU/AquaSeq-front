import Papa from 'papaparse';

// Format CSV qPCR AquaSeq v1 (03-ARCHITECTURE §5, panduan di P14).
// Bagian 1: well,sample_code,target,ct_rep,tm  (satu baris per replikat)
// Bagian 2: std_level,copies_rxn,ct            (titik kurva standar)
// Kontrol run: sample_code = NTC atau GDC, target = assay yang dikontrol.

const WELL_HEADER = ['well', 'sample_code', 'target', 'ct_rep', 'tm'];
const STD_HEADER = ['std_level', 'copies_rxn', 'ct'];
const TARGETS = ['pirA', 'vp28', 'swp1', 'amoA', '16S', 'PPC'] as const;
const MAX_BYTES = 1_000_000;
const MAX_ROWS = 2000;
const WELL_ID = /^[A-H](?:[1-9]|1[0-2])$/;

export type ParseResult<T> =
  { ok: true; data: T } | { ok: false; errors: { row: number; message: string }[] };

export interface ParsedWell {
  id: string;
  sampleCode: string;
  target: (typeof TARGETS)[number];
  ct: number | null;
  tm: number | null;
}

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')));

/** Ct kosong atau "Undetermined" = tidak teramplifikasi. */
function parseCt(raw: string): number | null | 'invalid' {
  const s = raw.trim();
  if (s === '' || /^undetermined$/i.test(s)) return null;
  const n = num(s);
  return Number.isFinite(n) && n > 0 && n < 50 ? n : 'invalid';
}

export function parseQpcrCsv(
  text: string,
): ParseResult<{ wells: ParsedWell[]; standards: { copiesRxn: number; ct: number }[] }> {
  if (text.length > MAX_BYTES) return { ok: false, errors: [{ row: 0, message: 'Berkas > 1 MB' }] };
  const rows = Papa.parse<string[]>(text.trim(), { skipEmptyLines: false }).data;
  if (rows.length > MAX_ROWS)
    return { ok: false, errors: [{ row: 0, message: `Lebih dari ${MAX_ROWS} baris` }] };

  const errors: { row: number; message: string }[] = [];
  const wells: ParsedWell[] = [];
  const standards: { copiesRxn: number; ct: number }[] = [];
  const seen = new Set<string>();
  let section: 'none' | 'wells' | 'std' = 'none';

  rows.forEach((cells, i) => {
    const row = i + 1;
    const c = cells.map((x) => x.trim());
    if (c.every((x) => x === '')) return;
    const lower = c.map((x) => x.toLowerCase());
    if (WELL_HEADER.every((h, k) => lower[k] === h)) return void (section = 'wells');
    if (STD_HEADER.every((h, k) => lower[k] === h)) return void (section = 'std');
    if (section === 'none')
      return void errors.push({
        row,
        message: `Header tidak dikenal, harusnya ${WELL_HEADER.join(',')}`,
      });

    if (section === 'std') {
      const copies = num(c[1] ?? '');
      const ct = parseCt(c[2] ?? '');
      if (!(copies > 0)) errors.push({ row, message: 'copies_rxn harus angka > 0' });
      else if (ct === null || ct === 'invalid')
        errors.push({ row, message: 'Ct standar harus angka 1-50' });
      else standards.push({ copiesRxn: copies, ct });
      return;
    }

    const [id, sampleCode, target, ctRaw = '', tmRaw = ''] = c;
    if (c.length < 4) return void errors.push({ row, message: 'Kolom kurang dari 4' });
    if (!WELL_ID.test(id)) errors.push({ row, message: `Well "${id}" bukan A1-H12` });
    if (!sampleCode) errors.push({ row, message: 'sample_code kosong' });
    if (!(TARGETS as readonly string[]).includes(target))
      errors.push({ row, message: `Target "${target}" tidak dikenal (${TARGETS.join(', ')})` });
    const ct = parseCt(ctRaw);
    if (ct === 'invalid')
      errors.push({ row, message: `Ct "${ctRaw}" bukan angka atau Undetermined` });
    const tm = tmRaw === '' ? null : num(tmRaw);
    if (tm !== null && !Number.isFinite(tm))
      errors.push({ row, message: `Tm "${tmRaw}" bukan angka` });
    if (seen.has(id)) errors.push({ row, message: `Well ${id} muncul dua kali` });
    seen.add(id);
    if (errors.length === 0 || errors.at(-1)!.row !== row)
      wells.push({
        id,
        sampleCode,
        target: target as ParsedWell['target'],
        ct: ct as number | null,
        tm,
      });
  });

  if (!wells.length && !errors.length) errors.push({ row: 1, message: 'Tidak ada baris well' });
  if (standards.length < 3)
    errors.push({
      row: rows.length,
      message: 'Kurva standar butuh minimal 3 titik (std_level,copies_rxn,ct)',
    });
  return errors.length ? { ok: false, errors } : { ok: true, data: { wells, standards } };
}

/** Kebalikan parser: dipakai untuk unduhan contoh CSV (P14) dan tes pulang-pergi. */
export function toQpcrCsv(
  wells: { id: string; sampleCode: string; target: string; ct: number | null; tm: number | null }[],
  standards: { copiesRxn: number; ct: number }[],
): string {
  const w = wells.map((x) =>
    [x.id, x.sampleCode, x.target, x.ct === null ? 'Undetermined' : x.ct, x.tm ?? ''].join(','),
  );
  const levels = [...new Set(standards.map((x) => x.copiesRxn))].sort((a, b) => b - a);
  const s = standards.map((x) =>
    [`STD-${levels.indexOf(x.copiesRxn) + 1}`, x.copiesRxn, x.ct].join(','),
  );
  return [WELL_HEADER.join(','), ...w, '', STD_HEADER.join(','), ...s].join('\n') + '\n';
}
