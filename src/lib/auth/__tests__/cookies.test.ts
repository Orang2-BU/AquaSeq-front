import { describe, expect, it } from "vitest";
import type { Me } from "@/lib/api";
import { homeFor, roleOf, safeNext } from "../cookies";

const me = (memberships: Me["memberships"]): Me => ({
  id: "u1",
  full_name: "Dwi Lestari",
  email: "dwi@contoh.id",
  memberships,
});
const farm = { farm_id: "f1", farm_name: "Tambak Mina Lestari" };

describe("safeNext", () => {
  it("menerima path internal beserta query", () => {
    expect(safeNext("/kolam/b3?tab=sampel")).toBe("/kolam/b3?tab=sampel");
  });

  it.each(["https://jahat.example", "//jahat.example", "/\\jahat.example", "kolam", "", undefined])(
    "menolak tujuan luar atau tidak valid: %s",
    (next) => {
      expect(safeNext(next)).toBeNull();
    },
  );
});

describe("roleOf dan homeFor", () => {
  it("mengarahkan teknisi ke tugas saya", () => {
    const user = me([{ ...farm, role: "teknisi" }]);
    expect([roleOf(user), homeFor(user)]).toEqual(["teknisi", "/teknisi"]);
  });

  it("mengarahkan pemilik ke dasbor", () => {
    const user = me([{ ...farm, role: "pemilik" }]);
    expect([roleOf(user), homeFor(user)]).toEqual(["pemilik", "/dasbor"]);
  });

  it("mengarahkan pemilik baru tanpa lokasi ke onboarding", () => {
    expect([roleOf(me([])), homeFor(me([]))]).toEqual(["pemilik", "/mulai"]);
  });
});
