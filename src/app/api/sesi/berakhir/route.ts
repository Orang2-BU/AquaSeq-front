import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/cookies";

/**
 * Sesi ditolak backend (401) walau cookie masih ada, mis. token dicabut. Server Component tidak boleh
 * mengubah cookie, jadi hapus di sini; tanpa ini proxy terus mengarahkan /masuk → /app → /masuk.
 */
export function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const base = host ? `${proto}://${host}` : request.url;
  const response = NextResponse.redirect(new URL("/masuk", base));
  clearSession(response.cookies);
  return response;
}
