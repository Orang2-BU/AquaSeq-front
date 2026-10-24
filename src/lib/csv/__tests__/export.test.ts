import { describe, expect, it } from "vitest";
import { toCsv } from "../export";

describe("toCsv", () => {
  it("menetralkan sel yang bisa dibaca sebagai rumus spreadsheet", () => {
    const csv = toCsv(["nama"], [['=HYPERLINK("x")'], ["-2+3"], ["Rizky, Pratama"]]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain("'-2+3");
    expect(csv).toContain('"Rizky, Pratama"');
  });

  it("menulis angka apa adanya dan null sebagai sel kosong", () => {
    expect(toCsv(["a", "b"], [[-1.5, null]])).toBe("\uFEFFa,b\r\n-1.5,\r\n");
  });
});
