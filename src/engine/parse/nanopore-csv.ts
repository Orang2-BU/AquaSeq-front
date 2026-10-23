import Papa from 'papaparse';

import type { ParseResult } from './qpcr-csv';

// Format CSV Nanopore AquaSeq v1 (ala EPI2ME wf-16s / Emu): satu baris per takson.
const NANOPORE_HEADER = ['sample_code', 'taxon', 'rank', 'read_count', 'abundance'];
const MAX_BYTES = 2_000_000;

export interface ParsedTaxon {
  taxon: string;
  rank: string;
  reads: number;
  abundance: number;
}

/** Membaca tabel kelimpahan untuk satu sampel; baris sampel lain di berkas yang sama diabaikan. */
export function parseNanoporeCsv(
  text: string,
  sampleCode: string,
): ParseResult<{ totalReads: number; taxa: ParsedTaxon[] }> {
  if (text.length > MAX_BYTES) return { ok: false, errors: [{ row: 0, message: 'Berkas > 2 MB' }] };
  const rows = Papa.parse<string[]>(text.trim(), { skipEmptyLines: false }).data;
  const header = (rows[0] ?? []).map((x) => x.trim().toLowerCase());
  if (!NANOPORE_HEADER.every((h, k) => header[k] === h))
    return {
      ok: false,
      errors: [{ row: 1, message: `Header harus ${NANOPORE_HEADER.join(',')}` }],
    };

  const errors: { row: number; message: string }[] = [];
  const taxa: ParsedTaxon[] = [];
  rows.slice(1).forEach((cells, i) => {
    const row = i + 2;
    const [code = '', taxon = '', rank = '', readsRaw = '', abundanceRaw = ''] = cells.map((x) =>
      x.trim(),
    );
    if (!code && !taxon) return;
    if (code !== sampleCode) return;
    const reads = Number(readsRaw);
    const abundance = Number(abundanceRaw.replace(',', '.'));
    if (!taxon) errors.push({ row, message: 'taxon kosong' });
    if (!rank) errors.push({ row, message: 'rank kosong' });
    if (!Number.isInteger(reads) || reads < 0)
      errors.push({ row, message: `read_count "${readsRaw}" harus bilangan bulat ≥ 0` });
    if (!Number.isFinite(abundance) || abundance < 0)
      errors.push({ row, message: `abundance "${abundanceRaw}" harus angka ≥ 0` });
    else taxa.push({ taxon, rank, reads, abundance });
  });

  if (!errors.length && !taxa.length)
    errors.push({ row: 1, message: `Tidak ada baris untuk sampel ${sampleCode}` });
  if (errors.length) return { ok: false, errors };
  // Baris bisa memuat beberapa tingkat takson; jumlah read dihitung sekali, di tingkat genus bila ada.
  const genus = taxa.filter((t) => t.rank === 'genus');
  const totalReads = (genus.length ? genus : taxa).reduce((a, t) => a + t.reads, 0);
  return { ok: true, data: { totalReads, taxa } };
}
