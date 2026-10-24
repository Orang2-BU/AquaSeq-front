import { Dna } from "lucide-react";
import type { MicrobiomeMetrics } from "@/lib/api";
import { evidenceTone, microbiomeSignalLabel } from "@/lib/edna";
import { formatNumber } from "@/lib/format";
import { Badge, Icon } from "@/components/ui";

/** Teks ambang backend lebih mudah dibaca: `>=`/`<=` jadi `≥`/`≤`, pemisah `;` jadi titik tengah. */
const thresholdText = (t: string) => t.replaceAll(">=", "≥").replaceAll("<=", "≤").replaceAll(";", " ·");

function signalValue(code: string, value: number | null) {
  if (value === null) return "Belum bisa dihitung";
  const { unit } = microbiomeSignalLabel(code);
  return unit === "%" ? `${formatNumber(value, 1)}%` : `${formatNumber(value, unit ? 0 : 2)}${unit ? ` ${unit}` : ""}`;
}

/**
 * Komunitas mikroba sampel dari tabel kelimpahan 16S (P16): keragaman, porsi Vibrio, pergeseran terhadap baseline,
 * dan takson dominan. Semua angka dari backend `internal/microbiome`; ambang masih heuristik (versi tampil).
 */
export function MicrobiomeCard({
  metrics,
  children,
}: {
  metrics: MicrobiomeMetrics | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="panel microbiome-card" aria-labelledby="microbiome-title">
      <div className="section-heading table-heading">
        <div className="edna-head">
          <span className="edna-icon">
            <Icon icon={Dna} size={20} />
          </span>
          <div>
            <h2 id="microbiome-title">Komunitas mikroba (16S)</h2>
            <p>Dari tabel kelimpahan taksa hasil sekuensing lab mitra</p>
          </div>
        </div>
        {metrics && <span className="small muted">Aturan {metrics.version}</span>}
      </div>

      {!metrics ? (
        <p className="table-empty">
          Tabel kelimpahan 16S untuk sampel ini belum diunggah. Keragaman dan porsi Vibrio muncul setelah diunggah.
        </p>
      ) : (
        <>
          {metrics.status === "BELUM_CUKUP" && (
            <p className="reject-note" role="status">
              Kedalaman baca {formatNumber(metrics.total_reads, 0)} bacaan, di bawah minimum. Keragaman belum layak
              dibandingkan antar sampel.
            </p>
          )}
          <div className="microbiome-tiles">
            <div className="forecast-tile">
              <span className="small muted">Keragaman (Shannon)</span>
              <strong>{formatNumber(metrics.shannon, 2)}</strong>
              <span className="small muted">kemerataan {formatNumber(metrics.evenness, 2)}</span>
            </div>
            <div className="forecast-tile">
              <span className="small muted">Perkiraan jumlah jenis (Chao1)</span>
              <strong>{formatNumber(metrics.chao1, 0)}</strong>
              <span className="small muted">{formatNumber(metrics.observed_taxa, 0)} jenis teramati</span>
            </div>
            <div className="forecast-tile">
              <span className="small muted">Porsi Vibrio</span>
              <strong>{formatNumber(metrics.vibrio_pct, 1)}%</strong>
              <span className="small muted">relatif, bukan jumlah mutlak</span>
            </div>
            <div className="forecast-tile">
              <span className="small muted">Pergeseran dari baseline</span>
              <strong>{metrics.bray_curtis === null ? "-" : formatNumber(metrics.bray_curtis, 2)}</strong>
              <span className="small muted">
                {metrics.bray_curtis === null ? "Ini sampel acuan siklus" : "Bray-Curtis, 0 = sama persis"}
              </span>
            </div>
          </div>

          <div className="microbiome-grid">
            <div className="insight-card">
              <h3>Tanda dari komunitas</h3>
              <ul className="edna-signal-list">
                {metrics.signals.map((s) => {
                  const tone = evidenceTone(s.status);
                  return (
                    <li key={s.code}>
                      <span className="edna-feature">
                        <strong>{microbiomeSignalLabel(s.code).label}</strong>
                        <span className="small muted">Ambang: {thresholdText(s.threshold)}</span>
                      </span>
                      <span className="edna-value">{signalValue(s.code, s.value)}</span>
                      <Badge tone={tone.tone}>{tone.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="insight-card">
              <h3>Takson dominan</h3>
              <ul className="taxa-bars">
                {metrics.top_taxa.map((t) => (
                  <li key={t.taxon}>
                    <span className="taxa-name">
                      <em>{t.taxon}</em>
                    </span>
                    <span className="taxa-track" aria-hidden>
                      <span
                        className={t.genus === "Vibrio" ? "vibrio" : ""}
                        style={{ width: `${Math.min(100, t.pct)}%` }}
                      />
                    </span>
                    <span className="taxa-pct">{formatNumber(t.pct, 1)}%</span>
                  </li>
                ))}
              </ul>
              <p className="small muted">
                {formatNumber(metrics.total_reads, 0)} bacaan. Ambang tanda masih heuristik dan belum divalidasi
                terhadap data wabah.
              </p>
            </div>
          </div>
        </>
      )}
      {children}
    </section>
  );
}
