import { NextResponse, type NextRequest } from "next/server";
import { api } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, clearSession, writeSession } from "@/lib/auth/cookies";

// Penyegar sesi + pelindung rute + pengarah peran (03-ARCHITECTURE §4). Otorisasi data tetap di backend.

const PUBLIC_PATHS = [
  "/metode",
  "/kontak",
  "/privasi",
  "/masuk",
  "/daftar",
  "/verifikasi",
  "/lupa-sandi",
  "/atur-sandi",
  "/undangan",
  "/akses-ditolak",
];
const GUEST_ONLY = ["/masuk", "/daftar"];
/** Halaman bersama pemilik dan teknisi (01-PRD §5a). */
const SHARED_PATHS = ["/notifikasi", "/pengaturan"];

const under = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value === "teknisi" ? "teknisi" : "pemilik";
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === "/" || PUBLIC_PATHS.some((p) => under(pathname, p))) {
    return (access || refresh) && GUEST_ONLY.includes(pathname) ? go("/app") : NextResponse.next();
  }
  if (!access && !refresh) return go(`/masuk?next=${encodeURIComponent(pathname + search)}`);

  if (pathname === "/app") return go(role === "teknisi" ? "/teknisi" : "/dasbor");
  const technicianArea = under(pathname, "/teknisi");
  const shared = SHARED_PATHS.includes(pathname);
  if (!shared && (role === "teknisi") !== technicianArea) return go("/akses-ditolak");

  if (access || !refresh) return NextResponse.next();
  try {
    const tokens = await api.auth.refresh(refresh);
    // Token baru diteruskan ke render yang sama lewat header request, dan disimpan browser lewat respons.
    request.cookies.set(ACCESS_COOKIE, tokens.access_token);
    const response = NextResponse.next({ request: { headers: request.headers } });
    writeSession(response.cookies, tokens, role);
    return response;
  } catch {
    const response = go(`/masuk?next=${encodeURIComponent(pathname + search)}`);
    clearSession(response.cookies);
    return response;
  }
}

export const config = {
  // Lewati rute API, aset Next, dan file statis (punya ekstensi).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
