import Link from "next/link";
import { Dna, FlaskConical } from "lucide-react";
import type { PondMicrobiome as Data } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { Badge, Icon } from "@/components/ui";

/**
 * Mikrobioma kolam (P15): porsi Vibrio dan keragaman per sampling di siklus berjalan, serta 3-5 penanda qPCR
 * mingguan yang dipilih backend dari kelimpahan + qPCR terakhir (Layar B dan C proposal). Angka dari backend.
 */
export function PondMicrobiome({ data, simulated }: { data: Data; simulated: boolean }) {
  const maxVibrio = Math.max(40, ...data.series.map((s) => s.vibrio_pct));
  return (
    <section className="panel insights" aria-labelledby="pond-mb-title">
      <div className="section-heading table-heading">
        <div>
          <h2 id="pond-mb-title">Mikrobioma & penanda mingguan</h2>
          <p>Sekuensing untuk menemukan, qPCR mingguan untuk memantau</p>
        </div>
        {simulated && <Badge tone="warn">Data simulasi</Badge>}
      </div>
      <div className="insights-grid">
        <div className="insight-card">
          <h3>
            <Icon icon={Dna} size={16} /> Porsi Vibrio per sampling
          </h3>
          {data.series.length === 0 ? (
            <p className="muted">
              Belum ada tabel kelimpahan 16S di siklus ini. Unggah dari halaman rincian skor sampel.
            </p>
          ) : (
            <ol className="vibrio-series">
              {data.series.map((s) => (
                <li key={s.sample_id}>
                  <Link href={`/sampel/${s.sample_id}`} className="vibrio-row">
                    <span className="vibrio-day">
                      <strong>DOC {s.cycle_day}</strong>
                      <span className="small muted">{formatDate(s.sampling_date)}</span>
                    </span>
                    <span className="taxa-track" aria-hidden>
                      <span
                        className={s.vibrio_pct > 10 ? "vibrio" : ""}
                        style={{ width: `${(s.vibrio_pct / maxVibrio) * 100}%` }}
                      />
                    </span>
                    <span className="taxa-pct">
                      {formatNumber(s.vibrio_pct, 1)}%
                      <span className="small muted"> · H {formatNumber(s.shannon, 2)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <p className="small muted">
            Porsi relatif dari sekuensing, bukan hasil qPCR. H = keragaman Shannon. Aturan {data.version}.
          </p>
        </div>
        <div className="insight-card">
          <h3>
            <Icon icon={FlaskConical} size={16} /> Penanda qPCR mingguan ({data.markers.length})
          </h3>
          <ul className="marker-list">
            {data.markers.map((m) => (
              <li key={m.target}>
                <span className="marker-target">{m.target}</span>
                <span>{m.reason}</span>
              </li>
            ))}
          </ul>
          <p className="small muted">Dipilih backend dari kelimpahan dan qPCR terakhir. Usulan, bukan diagnosis.</p>
        </div>
      </div>
    </section>
  );
}
