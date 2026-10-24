// Ekspor CSV untuk Excel/Sheets. Sel teks yang diawali = + - @ diberi apostrof supaya tidak dieksekusi sebagai rumus.

type Cell = string | number | null;

const escape = (cell: Cell) => {
  if (cell === null) return "";
  const text = typeof cell === "number" ? String(cell) : /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(header: string[], rows: Cell[][]): string {
  return `\uFEFF${[header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n")}\r\n`;
}

/** Respons unduhan CSV dengan nama berkas. */
export function csvResponse(fileName: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
