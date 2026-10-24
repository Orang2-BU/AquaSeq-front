import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth/cookies";

/**
 * Sesi ditolak backend (401) walau cookie masih ada, mis. token dicabut. Server Component tidak boleh
 * mengubah cookie, jadi hapus di sini; tanpa ini proxy terus mengarahkan /masuk → /app → /masuk.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/masuk", request.url));
  clearSession(response.cookies);
  return response;
}
