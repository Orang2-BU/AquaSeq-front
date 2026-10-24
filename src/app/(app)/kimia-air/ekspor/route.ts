import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { csvResponse, toCsv } from "@/lib/csv/export";
import { WATER_PARAMS } from "@/lib/water";

/** Ekspor riwayat kimia air lokasi aktif (P28, F18). */
export async function GET() {
  const { current } = await getActiveFarms();
  if (!current) return new Response("Belum ada lokasi aktif.", { status: 404 });
  const logs = await withSession((token) => api.waterLogs.list(token, current.id));
  const body = toCsv(
    ["kolam", "waktu", ...WATER_PARAMS.map((p) => p.key), "pencatat"],
    logs.map((l) => [l.pond.pond_code, l.measured_at, ...WATER_PARAMS.map((p) => l[p.key]), l.recorded_by.full_name]),
  );
  return csvResponse(`kimia-air-${current.id}.csv`, body);
}
