import { describe, expect, it } from "vitest";
import { formatProbability, riskOf, riskRank } from "../risk";

const valid = { status: "VALID" as const };

describe("riskOf", () => {
  it("memetakan kelas backend 1-4 ke label 08-DESIGN", () => {
    expect([1, 2, 3, 4].map((risk_class) => riskOf({ ...valid, risk_class }).label)).toEqual([
      "Aman",
      "Waspada ringan",
      "Waspada tinggi",
      "Bahaya",
    ]);
  });

  it("menandai sampel ditolak tanpa kelas, apa pun angka kelasnya", () => {
    expect(riskOf({ status: "REJECTED_INHIBITOR", risk_class: 0 })).toEqual({ label: "Ditolak", tone: "ditolak" });
    expect(riskOf({ status: "REJECTED_INVALID_QC", risk_class: 3 }).tone).toBe("ditolak");
  });
});

describe("formatProbability", () => {
  it("memakai koma desimal dan satu angka di belakang koma", () => {
    expect(formatProbability(71.6)).toBe("71,6%");
    expect(formatProbability(2)).toBe("2,0%");
  });
});

describe("riskRank", () => {
  it("mengurutkan peluang tertinggi, lalu ditolak, lalu tanpa sampel", () => {
    const ranks = [
      riskRank(null),
      riskRank({ status: "REJECTED_INHIBITOR", probability_pct: 0 }),
      riskRank({ status: "VALID", probability_pct: 0.4 }),
    ];
    expect(ranks[2]).toBeGreaterThan(ranks[1]);
    expect(ranks[1]).toBeGreaterThan(ranks[0]);
  });
});
