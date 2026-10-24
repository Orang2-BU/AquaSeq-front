import { api, type Pond } from "@/lib/api";
import { withSession } from "@/lib/auth/session";

// Pembacaan data yang dipakai banyak halaman pemilik. Panggil di dalam `<Suspense>` (cacheComponents).

/** Pilihan kolam dan teknisi aktif untuk modal buat tugas. */
export async function taskOptions(farmId: string, ponds?: Pond[]) {
  const [pondList, members] = await Promise.all([
    ponds ?? withSession((token) => api.ponds.list(token, farmId)),
    withSession((token) => api.members.list(token, farmId)),
  ]);
  return {
    ponds: pondList
      .map(({ id, pond_code, assignee }) => ({ id, pond_code, assignee }))
      .toSorted((a, b) => a.pond_code.localeCompare(b.pond_code)),
    technicians: members.items
      .filter((m) => m.role === "teknisi" && m.active)
      .map((m) => ({ id: m.user_id, full_name: m.full_name }))
      .toSorted((a, b) => a.full_name.localeCompare(b.full_name)),
  };
}
