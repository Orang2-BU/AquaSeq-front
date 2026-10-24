import { describe, expect, it } from "vitest";
import { parsePondCodes } from "../ponds";

describe("parsePondCodes", () => {
  it("memisahkan kode dengan koma, spasi, dan baris baru lalu menjadikan huruf besar", () => {
    expect(parsePondCodes("a1, a2\nb1  b-2").codes).toEqual(["A1", "A2", "B1", "B-2"]);
  });

  it("membuang duplikat", () => {
    expect(parsePondCodes("A1, a1, A1").codes).toEqual(["A1"]);
  });

  it("memisahkan kode yang tidak valid", () => {
    expect(parsePondCodes("A1, kolam#2, KOLAMPANJANGSEKALI")).toEqual({
      codes: ["A1"],
      invalid: ["KOLAM#2", "KOLAMPANJANGSEKALI"],
    });
  });

  it("mengembalikan daftar kosong untuk teks kosong", () => {
    expect(parsePondCodes("  , \n")).toEqual({ codes: [], invalid: [] });
  });
});
