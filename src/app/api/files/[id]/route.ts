import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

// Proxy foto laporan (03-ARCHITECTURE §4): browser tidak memanggil backend; token tetap di cookie httpOnly.
export async function GET(_: Request, { params }: RouteContext<"/api/files/[id]">) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return new Response("Sesi berakhir.", { status: 401 });
  const { id } = await params;
  if (id.length > 100) return new Response("Foto tidak ditemukan.", { status: 404 });
  try {
    const file = await api.files.get(token, id);
    return new Response(file.body, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (error) {
    const status = error instanceof ApiError && error.code === "UNAUTHORIZED" ? 401 : 404;
    return new Response(status === 401 ? "Sesi berakhir." : "Foto tidak ditemukan.", { status });
  }
}
