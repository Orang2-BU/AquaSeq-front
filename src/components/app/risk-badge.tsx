import type { SdriResult } from "@/lib/api";
import { riskOf } from "@/lib/risk";

/** Badge kelas risiko: selalu kata kelas + warna (08-DESIGN "Badge kelas risiko"). Aman untuk Server Component. */
export function RiskBadge({ result }: { result: Pick<SdriResult, "status" | "risk_class"> }) {
  const { label, tone } = riskOf(result);
  return (
    <span className={`badge risk-${tone}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}
