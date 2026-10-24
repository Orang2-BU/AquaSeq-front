import { Activity, History, LineChart, Sparkles } from "lucide-react";
import type { z } from "zod";
import type { insightsSchema } from "@/lib/api";
import { featureLabel } from "@/lib/edna";
import { formatNumber } from "@/lib/format";
import { formatProbability } from "@/lib/risk";
import { Badge, Icon } from "@/components/ui";

type Insights = z.infer<typeof insightsSchema>;
type Forecast = Insights["forecast_7d"];

function ForecastTile({ forecast }: { forecast: Forecast }) {
  const ok = forecast.predicted_probability_pct !== null;
  return (
    <div className="forecast-tile">
      <span className="small muted">{forecast.horizon_days} hari ke depan</span>
      <strong>{ok ? formatProbability(forecast.predicted_probability_pct ?? 0) : "-"}</strong>
      {ok && forecast.lower != null && forecast.upper != null && (
        <span className="small muted">
          rentang {formatProbability(forecast.lower)} - {formatProbability(forecast.upper)}
        </span>
      )}
      {!ok && <span className="small muted">Data belum cukup</span>}
    </div>
  );
}

/**
 * Insight pola & prakiraan kolam (backend `GET /ponds/{id}/insights`, AI lapis B): anomali multivariat,
 * prakiraan peluang 7 dan 14 hari, penjelasan, dan kasus serupa. Semua angka dari backend.
 */
export function InsightsPanel({ insights }: { insights: Insights }) {
  const synthetic = insights.anomaly.synthetic || insights.forecast_7d.synthetic;
  const explanation = insights.explanation;
  return (
    <section className="panel insights" aria-labelledby="insights-title">
      <div className="section-heading table-heading">
        <div>
          <h2 id="insights-title">Pola & prakiraan</h2>
          <p>Dari riwayat eDNA dan kimia air kolam ini</p>
        </div>
        {synthetic && <Badge tone="warn">Data simulasi</Badge>}
      </div>

      {insights.status !== "OK" ? (
        <p className="table-empty">
          {insights.status === "QC_REJECTED"
            ? "Sampel terakhir tidak lolos kontrol kualitas, jadi pola dan prakiraan belum bisa dihitung."
            : "Butuh minimal 3 sampel eDNA dalam siklus ini untuk membaca pola dan prakiraan."}
        </p>
      ) : (
        <div className="insights-grid">
          <div className="insight-card">
            <h3>
              <Icon icon={LineChart} size={16} /> Prakiraan peluang wabah
            </h3>
            <div className="forecast-row">
              <ForecastTile forecast={insights.forecast_7d} />
              {insights.forecast_14d && <ForecastTile forecast={insights.forecast_14d} />}
            </div>
            {insights.forecast_7d.disclaimer && <p className="small muted">{insights.forecast_7d.disclaimer}</p>}
          </div>

          <div className="insight-card">
            <h3>
              <Icon icon={Activity} size={16} /> Pola tidak biasa
            </h3>
            {insights.anomaly.flagged ? (
              <>
                <p>
                  Terdeteksi (skor {formatNumber(insights.anomaly.score, 2)})
                  {insights.anomaly.earlier_than_class_steps
                    ? `, ${insights.anomaly.earlier_than_class_steps} sampling lebih awal dari naiknya kelas.`
                    : "."}
                </p>
                <ul className="contributor-list">
                  {insights.anomaly.contributors.map((c) => (
                    <li key={c.feature}>
                      <span>{featureLabel(c.feature).label}</span>
                      <span className="small muted">
                        {formatNumber(c.value, 2)} dari biasanya {formatNumber(c.baseline, 2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted">Tidak ada penyimpangan dari pola kolam ini.</p>
            )}
          </div>

          {explanation && (
            <div className="insight-card wide">
              <h3>
                <Icon icon={Sparkles} size={16} /> Penjelasan
              </h3>
              {explanation.full_narrative && <p>{explanation.full_narrative}</p>}
              {explanation.seven_day_outlook && <p className="muted">{explanation.seven_day_outlook}</p>}
              {explanation.actions.length > 0 && (
                <ol className="insight-actions">
                  {explanation.actions.map((a) => (
                    <li key={a.action}>
                      {a.action} <span className="small muted">({a.source})</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {insights.similar_cases.length > 0 && (
            <div className="insight-card wide">
              <h3>
                <Icon icon={History} size={16} /> Kasus serupa
              </h3>
              <ul className="case-list">
                {insights.similar_cases.map((s) => (
                  <li key={s.case.id}>
                    <span>
                      {s.case.action ?? "Tindakan tidak tercatat"}
                      {s.case.outcome && <span className="muted"> → {s.case.outcome}</span>}
                    </span>
                    {s.similarity != null && (
                      <span className="small muted">{formatNumber(s.similarity * 100, 0)}% mirip</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <p className="small muted">Prakiraan statistik, bukan jaminan biologis maupun diagnosis resmi.</p>
    </section>
  );
}
