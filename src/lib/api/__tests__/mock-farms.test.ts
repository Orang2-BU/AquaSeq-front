import { describe, expect, it } from "vitest";
import { mock } from "../mock";

async function newOwner() {
  const email = `pemilik-${Math.random().toString(36).slice(2)}@contoh.id`;
  const { access_token } = await mock.auth.register({ full_name: "Siti Aminah", email, password: "kolam-udang-8" });
  return access_token;
}

describe("mock lokasi dan kolam", () => {
  it("membuat lokasi baru yang langsung muncul sebagai lokasi pemilik", async () => {
    const token = await newOwner();
    const farm = await mock.farms.create(token, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
    const me = await mock.auth.me(token);
    expect(me.memberships).toEqual([{ farm_id: farm.id, farm_name: "Tambak Bayu Segara", role: "pemilik" }]);
    expect(farm).toMatchObject({ provenance: "nyata", pond_count: 0, archived_at: null });
  });

  it("menolak pemilik lain mengubah lokasi yang bukan miliknya", async () => {
    const owner = await newOwner();
    const other = await newOwner();
    const farm = await mock.farms.create(owner, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
    await expect(mock.farms.update(other, farm.id, { name: "Diambil", regency: "Jember" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("menyembunyikan lokasi yang diarsipkan dari pemilih lokasi tapi tetap ada di daftar", async () => {
    const token = await newOwner();
    const farm = await mock.farms.create(token, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
    await mock.farms.archive(token, farm.id);
    expect((await mock.auth.me(token)).memberships).toEqual([]);
    expect((await mock.farms.list(token))[0].archived_at).not.toBeNull();
  });

  it("menolak kode kolam ganda di lokasi yang sama", async () => {
    const token = await newOwner();
    const farm = await mock.farms.create(token, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
    await mock.ponds.create(token, farm.id, { pond_code: "a1", system: "intensif" });
    await expect(mock.ponds.create(token, farm.id, { pond_code: "A1", system: "bioflok" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect((await mock.farms.list(token))[0].pond_count).toBe(1);
  });

  it("menolak undangan yang membagikan kolam dari lokasi lain", async () => {
    const token = await newOwner();
    const a = await mock.farms.create(token, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
    const b = await mock.farms.create(token, { name: "Tambak Pantai Asri", regency: "Situbondo" });
    const pond = await mock.ponds.create(token, b.id, { pond_code: "K1", system: "bioflok" });
    await expect(
      mock.invitations.create(token, a.id, { email: "agus@contoh.id", pond_ids: [pond.id] }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
