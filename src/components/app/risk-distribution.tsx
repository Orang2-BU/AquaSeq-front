import type { Pond } from "@/lib/api";
import { RISK_FILTERS, riskOf } from "@/lib/risk";

/** Sebaran kelas sampel terakhir tiap kolam: batang bertumpuk + legenda berangka (P13, P29). */
export function RiskDistribution({ ponds }: { ponds: Pick<Pond, "latest_result">[] }) {
  const tone = (p: Pick<Pond, "latest_result">) => (p.latest_result ? riskOf(p.latest_result).tone : null);
  const rows = [
    ...RISK_FILTERS.map((f) => ({
      key: f.tone,
      label: f.label,
      count: ponds.filter((p) => tone(p) === f.tone).length,
    })),
    { key: "none", label: "Belum ada sampel", count: ponds.filter((p) => !p.latest_result).length },
  ];
  return (
    <div className="risk-distribution">
      <div className="stacked-bar" role="img" aria-label={rows.map((r) => `${r.label} ${r.count}`).join(", ")}>
        {rows
          .filter((r) => r.count > 0)
          .map((r) => (
            <span key={r.key} className={`stacked-seg risk-${r.key}`} style={{ flexGrow: r.count }} />
          ))}
      </div>
      <ul className="dist-list">
        {rows.map((r) => (
          <li key={r.key} className={r.count ? undefined : "zero"}>
            <span className={`dist-dot risk-${r.key}`} aria-hidden="true" />
            {r.label}
            <strong>{r.count}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
