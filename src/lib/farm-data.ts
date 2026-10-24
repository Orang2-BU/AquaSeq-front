import { api, type Pond } from "@/lib/api";
import { getActiveFarms, getCurrentUser, withSession } from "@/lib/auth/session";
import { dayOffset } from "@/lib/format";

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

/** Data area teknisi: kolam yang dipegang, tugasnya, dan catatan kimia air terakhir tiap kolam. */
export async function technicianData() {
  const [me, { current }, tasks] = await Promise.all([
    getCurrentUser(),
    getActiveFarms(),
    withSession((token) => api.tasks.mine(token)),
  ]);
  const ponds = current ? await withSession((token) => api.ponds.list(token, current.id)) : [];
  const logs = await Promise.all(ponds.map((p) => withSession((token) => api.ponds.waterLogs(token, p.id))));
  const pondsWithLog = ponds
    .map((pond, i) => {
      const latest = logs[i][0] ?? null;
      return {
        ...pond,
        latestLog: latest,
        history: logs[i],
        loggedToday: latest ? dayOffset(latest.measured_at) === 0 : false,
      };
    })
    .toSorted((a, b) => a.pond_code.localeCompare(b.pond_code));
  return { me, farm: current, tasks, ponds: pondsWithLog };
}
