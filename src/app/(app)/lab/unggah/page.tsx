import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { getActiveFarms, withSession } from "@/lib/auth/session";
import { todayWib } from "@/lib/format";
import { NoFarmState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { Icon } from "@/components/ui";
import { UploadWizard, type PondOption } from "./upload-wizard";

export const metadata: Metadata = { title: "Unggah hasil lab" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Unggah hasil lab" />}>
        <Upload />
      </Suspense>
    </div>
  );
}

async function Upload() {
  const { current } = await getActiveFarms();
  const heading = (
    <div className="page-heading">
      <div>
        <h1>Unggah hasil lab</h1>
        <p>
          {current ? `${current.name} · Data eDNA air tambak satu run plate` : "Data eDNA air tambak satu run plate"}
        </p>
      </div>
      <div className="page-actions">
        <Link className="button secondary" href="/lab/format">
          <Icon icon={BookOpen} />
          Format CSV
        </Link>
      </div>
    </div>
  );
  if (!current) {
    return (
      <>
        {heading}
        <NoFarmState text="Hasil lab dicocokkan ke kolam. Siapkan lokasi dan kolam dulu." />
      </>
    );
  }
  const [ponds, logs] = await Promise.all([
    withSession((token) => api.ponds.list(token, current.id)),
    withSession((token) => api.waterLogs.list(token, current.id)),
  ]);
  // Catatan kimia air terakhir per kolam untuk mengisi fitur kimia sampel (F8).
  const options: PondOption[] = ponds
    .toSorted((a, b) => a.pond_code.localeCompare(b.pond_code))
    .map((pond) => {
      const log = logs
        .filter((l) => l.pond.id === pond.id)
        .toSorted((a, b) => b.measured_at.localeCompare(a.measured_at))[0];
      return {
        id: pond.id,
        pond_code: pond.pond_code,
        log: log
          ? {
              id: log.id,
              measured_at: log.measured_at,
              recorded_by: log.recorded_by.full_name,
              values: {
                do_mg_l: log.do_mg_l,
                ph: log.ph,
                temp_c: log.temp_c,
                tan_mg_l: log.tan_mg_l,
                no2_mg_l: log.no2_mg_l,
                h2s_mg_l: log.h2s_mg_l,
                tom_mg_l: log.tom_mg_l,
                alkalinity: log.alkalinity,
                salinity_ppt: log.salinity_ppt,
              },
            }
          : null,
      };
    });
  return (
    <>
      {heading}
      {ponds.length === 0 ? (
        <NoFarmState text="Tambahkan kolam dulu supaya sampel bisa dicocokkan." />
      ) : (
        <UploadWizard ponds={options} today={todayWib()} />
      )}
    </>
  );
}
