import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { csvResponse, toCsv } from "@/lib/csv/export";
import { TREND_LABEL, riskOf } from "@/lib/risk";

/** Ekspor daftar kolam lokasi aktif beserta hasil terakhir dari backend (P14). */
export async function GET() {
  const { current } = await getActiveFarms();
  if (!current) return new Response("Belum ada lokasi aktif.", { status: 404 });
  const ponds = await withSession((token) => api.ponds.list(token, current.id));
  const body = toCsv(
    ["kolam", "sistem", "peluang_pct", "kelas", "tren", "teknisi", "sampling_terakhir", "versi_model"],
    ponds.map((p) => {
      const r = p.latest_result;
      return [
        p.pond_code,
        p.system,
        r?.status === "VALID" ? r.probability_pct : null,
        r ? riskOf(r).label : null,
        TREND_LABEL[p.trend],
        p.assignee?.full_name ?? null,
        p.latest_sampling_date,
        r?.model_version ?? null,
      ];
    }),
  );
  return csvResponse(`kolam-${current.id}.csv`, body);
}
