import { describe, expect, it } from "vitest";
import { detectColumns, parseQpcr, pondCodeOf, splitCsv, standardCurve, summarize, transportTargets } from "../qpcr";

const CSV = `well,sample_code,target,ct,tm
A1,B3-1030,pirA,31.10,81.2
B1,B3-1030,pirA,31.30,81.3
C1,B3-1030,vp28,Undetermined,
D1,B3-1030,swp1,35.10,83.4
E1,B3-1030,amoA,25.90,84.1
F1,B3-1030,16S,18.10,86.3
G1,B3-1030,PPC,19.80,82.7
H12,NTC,pirA,Undetermined,

std_level,copies_rxn,ct
STD-1,1000000,19.8
STD-2,100000,23.15
STD-3,10000,26.5
STD-4,1000,29.85
`;

describe("parseQpcr", () => {
  it("membaca well dan kurva standar dari template", () => {
    const result = parseQpcr(CSV);
    expect(result.errors).toEqual([]);
    expect(result.wells).toHaveLength(8);
    expect(result.wells[2]).toMatchObject({ position: "C1", target: "vp28", ct: null });
    expect(result.standards).toHaveLength(4);
  });

  it("melaporkan galat per baris tanpa membuang baris lain", () => {
    const result = parseQpcr(
      "well,sample_code,target,ct,tm\nA1,B3-1030,pirA,abc,\nZ9,B3-1030,PPC,19.8,\nA2,B3-1030,16S,18,",
    );
    expect(result.errors.map((e) => e.row)).toEqual([2, 3]);
    expect(result.wells.map((w) => w.position)).toEqual(["A2"]);
  });

  it("mengenali nama kolom ekspor alat dan pemisah titik koma", () => {
    const header = splitCsv("Well Position;Sample Name;Target Name;Cq;Tm1")[0];
    expect(detectColumns(header)).toEqual({ well: 0, sample_code: 1, target: 2, ct: 3, tm: 4 });
  });

  it("meminta pemetaan manual bila kolom wajib tidak dikenali", () => {
    const result = parseQpcr("Posisi Sumur,Kode,Gen,Nilai\nA1,B3,pirA,30");
    expect(result.errors[0].message).toContain("Kolom belum dipetakan");
    const mapped = parseQpcr("Posisi Sumur,Kode,Gen,Nilai\nA1,B3,pirA,30", {
      well: 0,
      sample_code: 1,
      target: 2,
      ct: 3,
      tm: null,
    });
    expect(mapped.wells).toHaveLength(1);
  });
});

describe("summarize", () => {
  it("merata-ratakan replikat dan mengabaikan well yang dikeluarkan", () => {
    const { wells } = parseQpcr(CSV);
    const [b3] = summarize(wells);
    expect(b3.ct.ct_ahpnd).toBe(31.2);
    expect(b3.ct.ct_wssv).toBeNull();
    expect(summarize(wells, { A1: "gelembung" })[0].ct.ct_ahpnd).toBe(31.3);
  });

  it("menandai PPC hilang dan kontaminasi NTC", () => {
    const { wells } = parseQpcr(
      CSV.replace("H12,NTC,pirA,Undetermined,", "H12,NTC,pirA,36.2,").replace(
        "G1,B3-1030,PPC,19.80,82.7",
        "G1,B3-1030,PPC,,",
      ),
    );
    const [b3] = summarize(wells);
    expect(b3.issues).toEqual(
      expect.arrayContaining(["PPC tidak ada atau tidak teramplifikasi", "NTC pirA terdeteksi (kontaminasi run)"]),
    );
  });
});

describe("transportTargets", () => {
  it("mengirim negatif terukur sebagai 40 tanpa mengubah ringkasan tampilan", () => {
    const { wells } = parseQpcr(CSV);
    const before = summarize(wells);
    expect(transportTargets(wells, "B3-1030")).toEqual({ ct_ahpnd: 31.2, ct_wssv: 40, ct_ehp: 35.1 });
    expect(summarize(wells)).toEqual(before);
    expect(before[0].ct.ct_wssv).toBeNull();
    expect(wells[2].ct).toBeNull();
  });

  it("menghasilkan null jika target tidak diuji sama sekali", () => {
    const noSwp1 = CSV.replace("D1,B3-1030,swp1,35.10,83.4\n", "");
    const { wells } = parseQpcr(noSwp1);
    const targets = transportTargets(wells, "B3-1030");
    expect(targets.ct_ehp).toBeNull();
    expect(targets.ct_ahpnd).toBe(31.2);
    expect(targets.ct_wssv).toBe(40);
  });

  it("menghasilkan null jika semua well target dikecualikan", () => {
    const { wells } = parseQpcr(CSV);
    const targets = transportTargets(wells, "B3-1030", { C1: "gelembung udara" });
    expect(targets.ct_wssv).toBeNull();
  });

  it("mempertahankan nilai positif jika ada replikat positif meski ada replikat undetermined", () => {
    const mixedCsv = CSV.replace("D1,B3-1030,swp1,35.10,83.4", "C2,B3-1030,vp28,32.4,80.1\nD1,B3-1030,swp1,35.10,83.4");
    const { wells } = parseQpcr(mixedCsv);
    const targets = transportTargets(wells, "B3-1030");
    expect(targets.ct_wssv).toBe(32.4);
  });
});

describe("standardCurve", () => {
  it("menghitung slope dan efisiensi mendekati 100% untuk kurva ideal", () => {
    const curve = standardCurve(parseQpcr(CSV).standards);
    expect(curve?.slope).toBeCloseTo(-3.35, 2);
    expect(curve?.efficiency).toBeGreaterThan(95);
    expect(curve?.r2).toBeGreaterThan(0.99);
  });
});

it("mengambil kode kolam dari kode sampel", () => {
  expect(pondCodeOf("b3-1030")).toBe("B3");
});
