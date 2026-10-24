import type { SampleFeatures, Well } from "@/lib/api";

// Parser CSV qPCR AquaSeq (format di P20). Dipakai pratinjau di browser dan divalidasi ulang di server
// sebelum dikirim ke backend. Hanya meringkas Ct dan memeriksa kontrol; skor tetap dihitung backend.
//
// Bagian 1 (wajib): well, sample_code, target, ct, tm  · satu baris per well/replikat
// Bagian 2 (opsional): std_level, copies_rxn, ct       · titik kurva standar
// Kontrol run memakai sample_code NTC.

export const MAX_CSV_BYTES = 2_000_000;
const TARGETS = ["pirA", "vp28", "swp1", "amoA", "16S", "PPC"] as const;
type Target = (typeof TARGETS)[number];
export const FIELDS = ["well", "sample_code", "target", "ct", "tm"] as const;
type Field = (typeof FIELDS)[number];
export type ColumnMap = Record<Field, number | null>;

const WELL_ID = /^[A-H](?:[1-9]|1[0-2])$/;
const STD_HEADER = ["std_level", "copies_rxn", "ct"];

/** Nama kolom umum dari ekspor alat qPCR (Bio-Rad CFX, QuantStudio) untuk pemetaan otomatis. */
const ALIASES: Record<Field, string[]> = {
  well: ["well", "well position", "posisi", "pos"],
  sample_code: ["sample_code", "sample", "sample name", "kode sampel", "nama sampel"],
  target: ["target", "target name", "gene", "assay", "detector"],
  ct: ["ct", "cq", "ct_rep", "c(t)", "ct mean"],
  tm: ["tm", "melt temperature", "tm1", "melt temp"],
};

export interface ParsedWell {
  position: string;
  sample_code: string;
  target: Target;
  ct: number | null;
  tm: number | null;
}

interface RowError {
  row: number;
  message: string;
}

const clean = (s: string) => s.trim().replace(/^"|"$/g, "").trim();

/** Pisahkan teks CSV jadi baris sel. Mendukung koma atau titik koma; tanda kutip sederhana. */
export function splitCsv(text: string): string[][] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  const sample = lines.find((l) => l.trim()) ?? "";
  const delimiter = (sample.match(/;/g)?.length ?? 0) > (sample.match(/,/g)?.length ?? 0) ? ";" : ",";
  return lines.map((line) => line.split(delimiter).map(clean));
}

/** Tebak kolom dari baris header; kolom yang tidak dikenali dibiarkan `null` untuk dipetakan manual. */
export function detectColumns(header: string[]): ColumnMap {
  const lower = header.map((h) => h.toLowerCase());
  return Object.fromEntries(
    FIELDS.map((field) => {
      const index = lower.findIndex((h) => ALIASES[field].includes(h));
      return [field, index >= 0 ? index : null];
    }),
  ) as ColumnMap;
}

const toNumber = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));

/** Ct kosong, "Undetermined", atau "N/A" = tidak teramplifikasi. */
function parseCt(raw: string): number | null | "invalid" {
  const s = raw.trim();
  if (s === "" || /^(undetermined|n\/?a|-)$/i.test(s)) return null;
  const n = toNumber(s);
  return Number.isFinite(n) && n > 0 && n < 50 ? n : "invalid";
}

/** Nama target dari alat disamakan (mis. "PirA", "16s", "ppc"). */
function normalizeTarget(raw: string): Target | null {
  const lower = raw.trim().toLowerCase();
  return TARGETS.find((t) => t.toLowerCase() === lower) ?? null;
}

export interface ParseResult {
  header: string[];
  /** Beberapa baris data pertama untuk ditampilkan saat mencocokkan kolom. */
  preview: string[][];
  wells: ParsedWell[];
  standards: { copies_rxn: number; ct: number }[];
  errors: RowError[];
}

/** Baca CSV dengan pemetaan kolom. Galat dikumpulkan per baris, baris yang valid tetap terbaca. */
export function parseQpcr(text: string, columns?: ColumnMap): ParseResult {
  const rows = splitCsv(text);
  const headerIndex = rows.findIndex((r) => r.some((c) => c !== ""));
  const header = rows[headerIndex] ?? [];
  const map = columns ?? detectColumns(header);
  const errors: RowError[] = [];
  const wells: ParsedWell[] = [];
  const standards: { copies_rxn: number; ct: number }[] = [];
  const seen = new Set<string>();
  const missing = FIELDS.filter((f) => f !== "tm" && map[f] === null);
  if (headerIndex < 0)
    return { header, preview: [], wells, standards, errors: [{ row: 1, message: "Berkas kosong." }] };
  if (missing.length) {
    return {
      header,
      preview: rows.slice(headerIndex + 1, headerIndex + 6),
      wells,
      standards,
      errors: [{ row: headerIndex + 1, message: `Kolom belum dipetakan: ${missing.join(", ")}.` }],
    };
  }

  let section: "wells" | "std" = "wells";
  rows.slice(headerIndex + 1).forEach((cells, i) => {
    const row = headerIndex + i + 2;
    if (cells.every((c) => c === "")) return;
    const lower = cells.map((c) => c.toLowerCase());
    if (STD_HEADER.every((h, k) => lower[k] === h)) {
      section = "std";
      return;
    }
    if (section === "std") {
      const copies = toNumber(cells[1] ?? "");
      const ct = parseCt(cells[2] ?? "");
      if (!(copies > 0)) errors.push({ row, message: "copies_rxn harus angka lebih dari 0." });
      else if (ct === null || ct === "invalid") errors.push({ row, message: "Ct standar harus angka 1-50." });
      else standards.push({ copies_rxn: copies, ct });
      return;
    }
    const get = (f: Field) => {
      const index = map[f];
      return index === null ? "" : (cells[index] ?? "");
    };
    const position = get("well").toUpperCase();
    const sample_code = get("sample_code");
    const target = normalizeTarget(get("target"));
    const ct = parseCt(get("ct"));
    const tmRaw = get("tm");
    const tm = tmRaw.trim() === "" ? null : toNumber(tmRaw);
    const before = errors.length;
    if (!WELL_ID.test(position)) errors.push({ row, message: `Well "${get("well")}" bukan A1-H12.` });
    else if (seen.has(position)) errors.push({ row, message: `Well ${position} muncul dua kali.` });
    if (!sample_code) errors.push({ row, message: "Kode sampel kosong." });
    if (!target) errors.push({ row, message: `Target "${get("target")}" tidak dikenal (${TARGETS.join(", ")}).` });
    if (ct === "invalid") errors.push({ row, message: `Ct "${get("ct")}" bukan angka atau Undetermined.` });
    if (tm !== null && !Number.isFinite(tm)) errors.push({ row, message: `Tm "${tmRaw}" bukan angka.` });
    seen.add(position);
    if (errors.length === before && target && ct !== "invalid") {
      wells.push({ position, sample_code, target, ct, tm: tm !== null && Number.isFinite(tm) ? tm : null });
    }
  });
  if (!wells.length && !errors.length) errors.push({ row: headerIndex + 2, message: "Tidak ada baris well." });
  return { header, preview: rows.slice(headerIndex + 1, headerIndex + 6), wells, standards, errors };
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs: number[]) =>
  xs.length < 2 ? 0 : Math.sqrt(xs.reduce((a, x) => a + (x - mean(xs)) ** 2, 0) / (xs.length - 1));
const round = (n: number, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

export type Exclusions = Record<string, string>;

/** Ct terdeteksi per target satu sampel (well yang dikeluarkan diabaikan). */
function cts(wells: ParsedWell[], code: string, target: Target, excluded: Exclusions) {
  return wells
    .filter((w) => w.sample_code === code && w.target === target && !excluded[w.position])
    .map((w) => w.ct)
    .filter((c): c is number => c !== null);
}

export interface SampleQc {
  sample_code: string;
  ct: Pick<SampleFeatures, "ct_ahpnd" | "ct_wssv" | "ct_ehp" | "ct_amoa" | "ct_16s"> & { ct_ppc: number | null };
  /** SD replikat terbesar (Ct) antar target. */
  replicate_sd: number;
  /** Masalah kontrol yang terlihat sebelum dikirim; keputusan akhir tetap di backend. */
  issues: string[];
}

/** Ringkasan Ct (rata-rata replikat) + pemeriksaan kontrol per sampel untuk pratinjau QC. */
export function summarize(wells: ParsedWell[], excluded: Exclusions = {}): SampleQc[] {
  const codes = [...new Set(wells.map((w) => w.sample_code))].filter((c) => c.toUpperCase() !== "NTC");
  const ntcHits = (["pirA", "vp28", "swp1"] as const).filter((t) => cts(wells, "NTC", t, excluded).length > 0);
  return codes.map((code) => {
    const avg = (t: Target) => {
      const values = cts(wells, code, t, excluded);
      return values.length ? round(mean(values)) : null;
    };
    const ct = {
      ct_ahpnd: avg("pirA"),
      ct_wssv: avg("vp28"),
      ct_ehp: avg("swp1"),
      ct_amoa: avg("amoA"),
      ct_16s: avg("16S"),
      ct_ppc: avg("PPC"),
    };
    const replicate_sd = round(Math.max(0, ...TARGETS.map((t) => sd(cts(wells, code, t, excluded)))));
    const issues: string[] = [];
    if (ct.ct_ppc === null) issues.push("PPC tidak ada atau tidak teramplifikasi");
    if (ct.ct_16s === null) issues.push("16S tidak teramplifikasi");
    if (replicate_sd > 0.5) issues.push(`SD replikat ${replicate_sd.toLocaleString("id-ID")} lebih dari 0,5`);
    if (ntcHits.length) issues.push(`NTC ${ntcHits.join(", ")} terdeteksi (kontaminasi run)`);
    return { sample_code: code, ct, replicate_sd, issues };
  });
}

/** Kurva standar: slope, efisiensi, R² dari regresi Ct terhadap log10 kopi. Butuh ≥ 3 titik. */
export function standardCurve(standards: { copies_rxn: number; ct: number }[]) {
  if (standards.length < 3) return null;
  const xs = standards.map((s) => Math.log10(s.copies_rxn));
  const ys = standards.map((s) => s.ct);
  const mx = mean(xs);
  const my = mean(ys);
  const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const syy = ys.reduce((a, y) => a + (y - my) ** 2, 0);
  const slope = sxy / sxx;
  return {
    slope: round(slope, 3),
    efficiency: round((10 ** (-1 / slope) - 1) * 100, 1),
    r2: round((sxy * sxy) / (sxx * syy), 4),
  };
}

/** Well untuk `meta.wells` backend, termasuk alasan well yang dikeluarkan. */
export function toMetaWells(wells: ParsedWell[], code: string, excluded: Exclusions): Well[] {
  return wells
    .filter((w) => w.sample_code === code)
    .map((w) => ({
      position: w.position,
      target: w.target,
      ct: w.ct,
      tm: w.tm,
      excluded_reason: excluded[w.position] ?? null,
    }));
}

/** Kode kolam dari kode sampel ("B3-1023" → "B3"). */
export const pondCodeOf = (sampleCode: string) => sampleCode.split(/[-_\s]/)[0].toUpperCase();
