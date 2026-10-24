import { describe, expect, it } from "vitest";
import { activeRoute, isActive, matchPage } from "../nav";

describe("isActive", () => {
  it("menandai link aktif pada halamannya sendiri", () => {
    expect(isActive("/kolam", "/kolam")).toBe(true);
  });

  it("menandai link aktif pada sub-halaman", () => {
    expect(isActive("/kolam/b3/siklus", "/kolam")).toBe(true);
  });

  it("tidak menandai rute lain yang hanya berawalan sama", () => {
    expect(isActive("/kolamku", "/kolam")).toBe(false);
  });
});

describe("activeRoute", () => {
  it("hanya mengaktifkan menu dengan kecocokan terpanjang", () => {
    expect(activeRoute("/lab/unggah", ["/lab/unggah", "/lab"])).toBe("/lab/unggah");
    expect(activeRoute("/lab/unggahan/b-1", ["/lab/unggah", "/lab"])).toBe("/lab");
  });

  it("beranda teknisi aktif di detail tugas, tapi tidak di menu teknisi lain", () => {
    const menu = ["/teknisi", "/teknisi/catat-air", "/teknisi/kolam"];
    expect(activeRoute("/teknisi/tugas/t-1", menu)).toBe("/teknisi");
    expect(activeRoute("/teknisi/catat-air", menu)).toBe("/teknisi/catat-air");
  });

  it("tidak mengaktifkan apa pun di halaman di luar menu", () => {
    expect(activeRoute("/pengaturan", ["/dasbor", "/kolam"])).toBeUndefined();
  });
});

describe("matchPage", () => {
  it("mencocokkan rute statis", () => {
    expect(matchPage("/peringatan")?.id).toBe("P22");
  });

  it("mencocokkan rute dengan param dinamis", () => {
    expect(matchPage("/kolam/9b1deb4d/siklus")?.id).toBe("P21");
  });

  it("mendahulukan segmen statis bila panjangnya sama", () => {
    expect(matchPage("/lab/format")?.id).toBe("P20");
  });

  it("mengembalikan undefined untuk rute yang tidak ada", () => {
    expect(matchPage("/tidak-ada")).toBeUndefined();
  });
});
