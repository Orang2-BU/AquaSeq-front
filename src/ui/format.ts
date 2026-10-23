// Format tampilan Indonesia (TS murni, tanpa React).

/** Angka format Indonesia (koma desimal); pembulatan hanya saat tampil (02-AGENT §3). */
export const fmt = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined
    ? '-'
    : n.toLocaleString('id-ID', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtCopies = (n: number | null) => {
  if (n === null) return 'tidak terdeteksi';
  if (n < 1000) return `${fmt(n, 1)} copies/mL`;
  const e = Math.floor(Math.log10(n));
  const sup = String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return `${fmt(n / 10 ** e, 2)} × 10${sup} copies/mL`;
};

export const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
