// Aturan kode kolam, dipakai pratinjau di browser dan validasi di server.

export const MAX_PONDS_PER_BATCH = 50;
const CODE = /^[A-Z0-9-]{1,12}$/;

/** Pisahkan kode kolam dari teks bebas (koma, spasi, atau baris baru), huruf besar, tanpa duplikat. */
export function parsePondCodes(text: string): { codes: string[]; invalid: string[] } {
  const tokens = text
    .split(/[\s,;]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  const unique = [...new Set(tokens)];
  return { codes: unique.filter((t) => CODE.test(t)), invalid: unique.filter((t) => !CODE.test(t)) };
}
