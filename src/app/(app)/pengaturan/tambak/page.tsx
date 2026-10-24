import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { Icon } from "@/components/ui";
import { WaTargetsForm } from "../settings-forms";

export const metadata: Metadata = { title: "Pengaturan tambak" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Pengaturan tambak" />}>
        <FarmSettings />
      </Suspense>
    </div>
  );
}

async function FarmSettings() {
  const { current } = await getActiveFarms();
  if (!current) {
    return (
      <>
        <div className="page-heading">
          <h1>Pengaturan tambak</h1>
        </div>
        <NoFarmState text="Nomor WA tujuan diatur per kolam di lokasi tambak." />
      </>
    );
  }
  const ponds = (await withSession((token) => api.ponds.list(token, current.id))).toSorted((a, b) =>
    a.pond_code.localeCompare(b.pond_code),
  );
  return (
    <>
      <Link className="back-link" href="/pengaturan">
        <Icon icon={ArrowLeft} size={16} />
        Pengaturan akun
      </Link>
      <div className="page-heading">
        <div>
          <h1>Pengaturan tambak</h1>
          <p>{current.name} · nomor WhatsApp tujuan pesan peringatan tiap kolam. Ganti lokasi dari pemilih di atas.</p>
        </div>
      </div>
      <section className="panel" aria-labelledby="wa-title">
        <div className="section-heading table-heading">
          <div>
            <h2 id="wa-title">Nomor WA per kolam</h2>
            <p>Kosongkan bila pesan cukup disalin manual. Pesan dibuka lewat WhatsApp di HP atau laptop.</p>
          </div>
        </div>
        {ponds.length === 0 ? (
          <p className="table-empty">Belum ada kolam di lokasi ini.</p>
        ) : (
          <div className="form-card">
            <WaTargetsForm ponds={ponds.map(({ id, pond_code, wa_target }) => ({ id, pond_code, wa_target }))} />
          </div>
        )}
      </section>
    </>
  );
}
