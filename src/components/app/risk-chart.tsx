import type { PondSample } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import { CLASS_THRESHOLDS, formatProbability, rejectedReason, riskOf } from "@/lib/risk";

const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };

/**
 * Grafik riwayat peluang (08-DESIGN "Grafik riwayat peluang"): garis `accent-fill`, garis ambang kelas
 * putus-putus, sampel ditolak = titik berongga abu di dasar grafik.
 */
export function RiskChart({ samples }: { samples: PondSample[] }) {
  const points = samples.toSorted((a, b) => a.sampling_date.localeCompare(b.sampling_date));
  const valid = points.filter((p) => p.sdri_result.status === "VALID");
  const top = Math.min(100, Math.max(30, ...valid.map((p) => p.sdri_result.probability_pct * 1.2)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length < 2 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (p: number) => PAD.top + innerH - (p / top) * innerH;
  const line = points
    .map((p, i) => (p.sdri_result.status === "VALID" ? `${x(i)},${y(p.sdri_result.probability_pct)}` : null))
    .filter(Boolean)
    .join(" ");
  const ticks = [0, ...CLASS_THRESHOLDS.filter((t) => t < top)];
  const summary = valid.length
    ? `Peluang dari ${formatProbability(valid[0].sdri_result.probability_pct)} (${formatShortDate(valid[0].sampling_date)}) sampai ${formatProbability(valid.at(-1)?.sdri_result.probability_pct ?? 0)} (${formatShortDate(valid.at(-1)?.sampling_date ?? "")}).`
    : "Belum ada sampel valid.";

  return (
    <figure className="risk-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Riwayat peluang wabah. ${summary}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line
              className={t === 0 ? "chart-axis" : "chart-threshold"}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
            />
            {/* Label ambang yang terlalu dekat dengan 0% disembunyikan supaya tidak bertumpuk. */}
            {(t === 0 || y(0) - y(t) >= 14) && (
              <text className="chart-label" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
                {t}%
              </text>
            )}
          </g>
        ))}
        {points.map((p, i) => (
          <text key={p.sample_id} className="chart-label" x={x(i)} y={H - 10} textAnchor="middle">
            {formatShortDate(p.sampling_date)}
          </text>
        ))}
        {valid.length > 1 && <polyline className="chart-line" points={line} />}
        {points.map((p, i) => {
          const r = p.sdri_result;
          const ok = r.status === "VALID";
          return (
            <circle
              key={p.sample_id}
              className={ok ? `chart-point risk-${riskOf(r).tone}` : "chart-point rejected"}
              cx={x(i)}
              cy={ok ? y(r.probability_pct) : y(0)}
              r={ok ? 5 : 6}
            >
              <title>
                {`${p.sample_code}, ${formatShortDate(p.sampling_date)}: ${
                  ok
                    ? `${formatProbability(r.probability_pct)} ${riskOf(r).label}`
                    : `Ditolak. ${rejectedReason(r.status)}`
                }`}
              </title>
            </circle>
          );
        })}
      </svg>
      <figcaption className="chart-legend">
        <span>
          <span className="legend-line" /> Peluang wabah
        </span>
        <span>
          <span className="legend-dash" /> Batas kelas 5%, 25%, 60%
        </span>
        {points.some((p) => p.sdri_result.status !== "VALID") && (
          <span>
            <span className="legend-hollow" /> Sampel ditolak
          </span>
        )}
      </figcaption>
    </figure>
  );
}
