import { connection } from "next/server";
import { api } from "@/lib/api";

/** Cek koneksi ke backend sesuai `API_MODE` (mock/live). */
export async function GET() {
  // Tanpa ini, mode mock (tanpa jaringan) ikut di-prerender saat build dan hasilnya beku.
  await connection();
  const mode = process.env.API_MODE === "live" ? "live" : "mock";
  try {
    return Response.json({ mode, backend: await api.health() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server analisis tidak terjangkau.";
    return Response.json({ mode, error: message }, { status: 502 });
  }
}
