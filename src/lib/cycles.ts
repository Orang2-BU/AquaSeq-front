import type { Cycle } from "@/lib/api";

export const CYCLE_OUTCOME: Record<Cycle["outcome"], string> = {
  HARVEST_SUCCESS: "Panen berhasil",
  OUTBREAK: "Wabah",
  EMERGENCY_HARVEST: "Panen darurat",
};

export const PATHOGENS = ["AHPND", "WSSV", "EHP", "Lainnya"] as const;
