import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { Pond } from "@/lib/api";
import { TREND_LABEL } from "@/lib/risk";
import { Icon } from "@/components/ui";

const TREND_ICON: Record<Pond["trend"], { icon: LucideIcon; className?: string }> = {
  RAPID_INCREASE: { icon: TrendingUp, className: "trend-up" },
  MODERATE_INCREASE: { icon: TrendingUp, className: "trend-up" },
  STABLE: { icon: Minus },
  DECREASING: { icon: TrendingDown, className: "trend-down" },
  INSUFFICIENT_DATA: { icon: Minus, className: "muted" },
};

/** Arah tren risiko dari backend: ikon + label (naik = `risk-tinggi`, turun = `risk-aman`). */
export function Trend({ trend }: { trend: Pond["trend"] }) {
  const { icon, className = "" } = TREND_ICON[trend];
  return (
    <span className={`trend ${className}`}>
      <Icon icon={icon} size={16} />
      {TREND_LABEL[trend]}
    </span>
  );
}
