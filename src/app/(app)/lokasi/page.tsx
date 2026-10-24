import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Rocket } from "lucide-react";
import { getActiveFarms } from "@/lib/auth/session";
import { Badge, Icon } from "@/components/ui";
import { AddLocationButton, LocationCardActions } from "./location-actions";

export const metadata: Metadata = { title: "Lokasi" };

export default function Page() {
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <h1>Lokasi</h1>
          <p>Lokasi tambak milikmu. Data di halaman lain mengikuti lokasi aktif.</p>
        </div>
        <div className="page-actions">
          <AddLocationButton />
        </div>
      </div>
      <Suspense
        fallback={<section className="panel location-grid-skeleton" aria-busy="true" aria-label="Memuat lokasi" />}
      >
        <LocationList />
      </Suspense>
    </div>
  );
}

async function LocationList() {
  const { farms, archived, current } = await getActiveFarms();
  if (farms.length === 0) {
    return (
      <section className="placeholder-panel">
        <div className="placeholder-card">
          <span className="placeholder-symbol">
            <Icon icon={MapPin} size={32} />
          </span>
          <h2>Belum ada lokasi aktif</h2>
          <p>Buat lokasi pertama, tambahkan kolam, lalu undang teknisi.</p>
          <Link className="button primary" href="/mulai">
            <Icon icon={Rocket} />
            Siapkan tambak
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="panel">
      <div className="location-grid">
        {farms.map((farm) => {
          const selected = farm.id === current?.id;
          return (
            <article key={farm.id} className="location-card">
              <div className="location-top">
                <span className="metric-icon">
                  <Icon icon={MapPin} />
                </span>
                <div className="location-title">
                  <h2>{farm.name}</h2>
                  <p>{[farm.regency, farm.address].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              {(selected || farm.provenance === "simulasi") && (
                <div className="location-badges">
                  {selected && <Badge tone="ok">Lokasi aktif</Badge>}
                  {farm.provenance === "simulasi" && <Badge tone="warn">Data simulasi</Badge>}
                </div>
              )}
              <dl className="location-stats">
                <div>
                  <dt>Kolam</dt>
                  <dd>{farm.pond_count}</dd>
                </div>
                <div>
                  <dt>Teknisi</dt>
                  <dd>{farm.technician_count}</dd>
                </div>
                <div>
                  <dt>Kolam berisiko</dt>
                  <dd className={farm.at_risk_count > 0 ? "risk-high" : undefined}>{farm.at_risk_count}</dd>
                </div>
              </dl>
              <LocationCardActions farm={farm} selected={selected} />
            </article>
          );
        })}
      </div>
      {archived.length > 0 && (
        <p className="small muted location-archived">
          {archived.length} lokasi diarsipkan. Kolam, hasil lab, dan riwayatnya tetap tersimpan.
        </p>
      )}
    </section>
  );
}
