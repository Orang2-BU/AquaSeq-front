import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getActiveFarms, getCurrentUser } from "@/lib/auth/session";
import { roleOf } from "@/lib/auth/cookies";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Sesi dibaca di dalam Suspense (cacheComponents); kanvas kosong tampil sesaat selama sesi dimuat.
  return (
    <Suspense fallback={<div className="app-frame" />}>
      <SessionShell>{children}</SessionShell>
    </Suspense>
  );
}

async function SessionShell({ children }: { children: React.ReactNode }) {
  const [me, { farms, current }] = await Promise.all([getCurrentUser(), getActiveFarms()]);
  const initials = me.full_name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const account = {
    name: me.full_name,
    initials,
    role: roleOf(me),
    farms: farms.map(({ id, name, regency, pond_count }) => ({ id, name, regency, pond_count })),
    currentFarmId: current?.id,
    simulated: current?.provenance === "simulasi",
  };
  return <AppShell account={account}>{children}</AppShell>;
}
