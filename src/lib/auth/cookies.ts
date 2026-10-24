import type { Me, Role, Tokens } from "@/lib/api";

// Cookie sesi (03-ARCHITECTURE Q7). Tanpa next/headers supaya bisa dipakai proxy dan Server Action.

export const ACCESS_COOKIE = "aq_access";
export const REFRESH_COOKIE = "aq_refresh";
/** Peran hanya untuk mengarahkan halaman; otorisasi data tetap di backend (09-API-KONTRAK §9). */
export const ROLE_COOKIE = "aq_role";

const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

type CookieOptions = { httpOnly: boolean; secure: boolean; sameSite: "lax"; path: string; maxAge: number };
interface CookieJar {
  set(name: string, value: string, options: CookieOptions): unknown;
}

const options = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge,
});

/** Access cookie kedaluwarsa bersama tokennya, jadi proxy cukup melihat ada/tidaknya untuk tahu kapan refresh. */
export function writeSession(jar: CookieJar, tokens: Tokens, role: Role) {
  jar.set(ACCESS_COOKIE, tokens.access_token, options(tokens.expires_in));
  jar.set(REFRESH_COOKIE, tokens.refresh_token, options(REFRESH_MAX_AGE));
  jar.set(ROLE_COOKIE, role, options(REFRESH_MAX_AGE));
}

export function clearSession(jar: CookieJar) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE]) jar.set(name, "", options(0));
}

/** Pemilik bila punya lokasi sendiri atau belum punya lokasi sama sekali (akun baru); selain itu teknisi. */
export function roleOf(me: Me): Role {
  const isTechnicianOnly = me.memberships.length > 0 && me.memberships.every((m) => m.role === "teknisi");
  return isTechnicianOnly ? "teknisi" : "pemilik";
}

export function homeFor(me: Me): string {
  if (roleOf(me) === "teknisi") return "/teknisi";
  return me.memberships.length === 0 ? "/mulai" : "/dasbor";
}

/** Tujuan setelah masuk hanya boleh path internal, supaya `?next=` tidak jadi open redirect. */
export function safeNext(next: unknown): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}
