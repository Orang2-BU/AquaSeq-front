import { describe, expect, it } from "vitest";
import { evidenceTone, featureLabel, mitigationList } from "../edna";

describe("label temuan eDNA", () => {
  it("menerjemahkan kode fitur backend dan memberi cadangan untuk kode baru", () => {
    expect(featureLabel("fold_regulation_amoa").group).toBe("mikroba");
    expect(featureLabel("jejak_ahpnd").unit).toBe("kopi/mL");
    expect(featureLabel("fitur_baru_x").label).toBe("fitur baru x");
  });

  it("memetakan status backend ke nada badge", () => {
    expect(evidenceTone("kritis").tone).toBe("crit");
    expect(evidenceTone("peringatan").tone).toBe("warn");
    expect(evidenceTone("belum_cukup").label).toBe("Data belum cukup");
  });

  it("menyamakan mitigasi teks dan objek", () => {
    const list = mitigationList({
      mitigation_actions: ["Ganti air 20%", { action: "Sifon dasar", source: "SOP", priority: "tinggi" }],
    });
    expect(list).toEqual([
      { action: "Ganti air 20%", source: null, priority: null },
      { action: "Sifon dasar", source: "SOP", priority: "tinggi" },
    ]);
    expect(mitigationList({ mitigation_actions: null })).toEqual([]);
  });
});
