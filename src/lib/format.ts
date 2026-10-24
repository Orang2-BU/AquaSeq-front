const DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

/** Tanggal pendek Indonesia ("23 Okt 2026") dari tanggal `YYYY-MM-DD` atau waktu ISO. */
export function formatDate(value: string): string {
  return DATE.format(new Date(value));
}

/** Waktu ISO sudah lewat (mis. undangan kedaluwarsa). */
export function isPast(value: string): boolean {
  return Date.parse(value) < Date.now();
}
