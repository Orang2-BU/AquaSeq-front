const ZONE = "Asia/Jakarta";
const DATE = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: ZONE });
const SHORT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: ZONE });
const TIME = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: ZONE });

/** Tanggal pendek Indonesia ("23 Okt 2026") dari tanggal `YYYY-MM-DD` atau waktu ISO. */
export function formatDate(value: string): string {
  return DATE.format(new Date(value));
}

/** "23 Okt" tanpa tahun, untuk sumbu grafik dan daftar padat. */
export function formatShortDate(value: string): string {
  return SHORT.format(new Date(value));
}

/** "23 Okt 2026, 14.20" (WIB). */
export function formatDateTime(value: string): string {
  return `${DATE.format(new Date(value))}, ${TIME.format(new Date(value))}`;
}

/** Angka dengan koma desimal ("0,041"). `null` jadi tanda hubung. */
export function formatNumber(value: number | null, digits = 2): string {
  if (value === null) return "-";
  return value.toLocaleString("id-ID", { maximumFractionDigits: digits });
}

/** Waktu ISO sudah lewat (mis. undangan kedaluwarsa, tugas terlambat). */
export function isPast(value: string): boolean {
  return Date.parse(value) < Date.now();
}

/** Nilai `datetime-local` (WIB) dari waktu ISO, untuk mengisi form. */
export function toLocalInput(value: string): string {
  return new Date(Date.parse(value) + 7 * 3_600_000).toISOString().slice(0, 16);
}

/** Waktu ISO (WIB) dari nilai `datetime-local`. */
export function fromLocalInput(value: string): string {
  return new Date(`${value}:00+07:00`).toISOString();
}

/** Tanggal hari ini (WIB) sebagai `YYYY-MM-DD`. */
export function todayWib(): string {
  return new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
}

const WEEKDAY = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: ZONE });
const DAY_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE });

/** "14.20" (WIB). */
export function formatTime(value: string): string {
  return TIME.format(new Date(value));
}

/** "Sabtu, 24 Oktober" (WIB). */
export function formatWeekday(value: string): string {
  return WEEKDAY.format(new Date(value));
}

/** Selisih hari kalender WIB dari hari ini: 0 = hari ini, 1 = besok, -1 = kemarin. */
export function dayOffset(value: string): number {
  const day = (d: Date) => Date.parse(DAY_KEY.format(d));
  return Math.round((day(new Date(value)) - day(new Date())) / 86_400_000);
}

/** Salam sesuai jam WIB. */
export function greeting(): string {
  const hour = (new Date().getUTCHours() + 7) % 24;
  return hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
}

/** Waktu sekarang (WIB) sebagai nilai `datetime-local`. */
export function nowLocalInput(): string {
  return new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 16);
}
