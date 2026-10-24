import { describe, expect, it } from "vitest";
import { pondSchema } from "..";
import { mock } from "../mock";

const SUMBER = "f-sumber-rejeki";

async function owner() {
  const email = `pemilik-${Math.random().toString(36).slice(2)}@contoh.id`;
  const { access_token } = await mock.auth.register({ full_name: "Siti Aminah", email, password: "kolam-udang-8" });
  const farm = await mock.farms.create(access_token, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
  return { token: access_token, farmId: farm.id };
}

/** Undang lalu terima, dengan token yang dicegat dari log pengganti email. */
async function invitedTechnician(token: string, farmId: string, pond_ids: string[]) {
  const email = `teknisi-${Math.random().toString(36).slice(2)}@contoh.id`;
  const logs: string[] = [];
  const original = console.info;
  console.info = (line: string) => logs.push(line);
  try {
    await mock.invitations.create(token, farmId, { email, pond_ids });
  } finally {
    console.info = original;
  }
  const invitationToken = logs[0].split("/undangan/")[1];
  const result = await mock.invitations.accept(invitationToken, { full_name: "Fajar Nugroho", password: "pematang-8" });
  return { invitationToken, ...result };
}

describe("mock kolam", () => {
  it("mengembalikan skor seed sesuai kontrak, termasuk sampel ditolak dan kolam tanpa sampel", async () => {
    const { access_token } = await mock.auth.demo("pemilik");
    const ponds = await mock.ponds.list(access_token, SUMBER);
    for (const pond of ponds) pondSchema.parse(pond);
    const byCode = Object.fromEntries(ponds.map((p) => [p.pond_code, p]));
    expect(byCode.C4.latest_result).toMatchObject({ risk_class: 4, probability_pct: 71.6, risk_level: "BAHAYA" });
    expect(byCode.A4.latest_result).toMatchObject({ status: "REJECTED_INHIBITOR", risk_class: 0 });
    expect(byCode.C3.latest_result).toBeNull();
  });

  it("menyembunyikan kolam yang diarsipkan dari daftar dan ringkasan lokasi", async () => {
    const { token, farmId } = await owner();
    const pond = await mock.ponds.create(token, farmId, { pond_code: "D1", system: "intensif" });
    await mock.ponds.archive(token, pond.id);
    expect(await mock.ponds.list(token, farmId)).toEqual([]);
    expect((await mock.farms.list(token))[0].pond_count).toBe(0);
  });

  it("menolak mengganti kode kolam ke kode yang sudah dipakai", async () => {
    const { token, farmId } = await owner();
    await mock.ponds.create(token, farmId, { pond_code: "D1", system: "intensif" });
    const d2 = await mock.ponds.create(token, farmId, { pond_code: "D2", system: "intensif" });
    await expect(mock.ponds.update(token, d2.id, { pond_code: "d1" })).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("mock tim dan undangan", () => {
  it("teknisi yang menerima undangan memegang kolam yang dibagikan dan hanya melihat kolam itu", async () => {
    const { token, farmId } = await owner();
    const d1 = await mock.ponds.create(token, farmId, { pond_code: "D1", system: "intensif" });
    await mock.ponds.create(token, farmId, { pond_code: "D2", system: "intensif" });
    const technician = await invitedTechnician(token, farmId, [d1.id]);
    const visible = await mock.ponds.list(technician.access_token, farmId);
    expect(visible.map((p) => p.pond_code)).toEqual(["D1"]);
    const { items } = await mock.members.list(token, farmId);
    expect(items.find((m) => m.role === "teknisi")).toMatchObject({ full_name: "Fajar Nugroho", pond_codes: ["D1"] });
  });

  it("token undangan hanya sekali pakai", async () => {
    const { token, farmId } = await owner();
    const { invitationToken } = await invitedTechnician(token, farmId, []);
    await expect(mock.invitations.byToken(invitationToken)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("membagi kolam memindahkan kolam terpilih dan melepas kolam lama yang tidak dipilih", async () => {
    const { token, farmId } = await owner();
    const d1 = await mock.ponds.create(token, farmId, { pond_code: "D1", system: "intensif" });
    const d2 = await mock.ponds.create(token, farmId, { pond_code: "D2", system: "intensif" });
    const first = await invitedTechnician(token, farmId, [d1.id]);
    const second = await invitedTechnician(token, farmId, []);
    await mock.members.assignPonds(token, farmId, second.user.id, [d1.id, d2.id]);
    const after = await mock.members.assignPonds(token, farmId, first.user.id, [d2.id]);
    expect(after.pond_codes).toEqual(["D2"]);
    const { items } = await mock.members.list(token, farmId);
    expect(items.find((m) => m.user_id === second.user.id)?.pond_codes).toEqual(["D1"]);
  });

  it("menonaktifkan teknisi melepas kolamnya dan mencabut aksesnya", async () => {
    const { token, farmId } = await owner();
    const d1 = await mock.ponds.create(token, farmId, { pond_code: "D1", system: "intensif" });
    const technician = await invitedTechnician(token, farmId, [d1.id]);
    const member = await mock.members.update(token, farmId, technician.user.id, { active: false });
    expect(member).toMatchObject({ active: false, pond_codes: [] });
    expect((await mock.auth.me(technician.access_token)).memberships).toEqual([]);
    await expect(mock.ponds.list(technician.access_token, farmId)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("undangan yang dibatalkan tidak bisa dibuka lagi", async () => {
    const { token, farmId } = await owner();
    const invitation = await mock.invitations.create(token, farmId, { email: "wulan@contoh.id", pond_ids: [] });
    await mock.invitations.revoke(token, invitation.id);
    expect((await mock.members.list(token, farmId)).invitations).toEqual([]);
  });

  it("undangan demo bisa dibuka lewat token tetap", async () => {
    expect(await mock.invitations.byToken("undangan-demo-sumber-rejeki")).toMatchObject({
      farm_name: "Tambak Sumber Rejeki",
      owner_name: "Hendra Kusuma",
      pond_codes: ["C3"],
      expired: false,
    });
  });
});
