import { describe, expect, it } from "vitest";
import { isActive, matchPage } from "../nav";

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
