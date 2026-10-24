import { describe, expect, it } from "vitest";
import { mock } from "../mock";

async function setup() {
  const email = `pemilik-${Math.random().toString(36).slice(2)}@contoh.id`;
  const { access_token: owner } = await mock.auth.register({
    full_name: "Siti Aminah",
    email,
    password: "kolam-udang-8",
  });
  const farm = await mock.farms.create(owner, { name: "Tambak Bayu Segara", regency: "Banyuwangi" });
  const mine = await mock.ponds.create(owner, farm.id, { pond_code: "A1", system: "intensif" });
  const other = await mock.ponds.create(owner, farm.id, { pond_code: "A2", system: "intensif" });
  const technician = await invite(owner, farm.id, [mine.id]);
  return { owner, farmId: farm.id, mine, other, technician };
}

/** Undang lalu terima, dengan token yang dicegat dari log pengganti email. */
async function invite(owner: string, farmId: string, pond_ids: string[]) {
  const logs: string[] = [];
  const original = console.info;
  console.info = (line: string) => logs.push(line);
  try {
    await mock.invitations.create(owner, farmId, {
      email: `teknisi-${Math.random().toString(36).slice(2)}@contoh.id`,
      pond_ids,
    });
  } finally {
    console.info = original;
  }
  const token = logs[0].split("/undangan/")[1];
  const result = await mock.invitations.accept(token, { full_name: "Fajar Nugroho", password: "pematang-8" });
  return { token: result.access_token, id: result.user.id };
}

const reading = { measured_at: new Date().toISOString(), temp_c: 29.4, ph: 7.9, do_mg_l: 4.6, tan_mg_l: 0.62 };
const photo = (bytes = 2048) => new File([new Uint8Array(bytes)], "kolam.jpg", { type: "image/jpeg" });

describe("mock teknisi: catat kimia air", () => {
  it("menyimpan catatan kolam yang dipegang beserta NH₃ bebas dari backend", async () => {
    const { mine, technician } = await setup();
    const log = await mock.ponds.logWater(technician.token, mine.id, reading);
    expect(log.nh3_mg_l).toBeGreaterThan(0);
  });

  it("menolak kolam yang bukan miliknya", async () => {
    const { other, technician } = await setup();
    await expect(mock.ponds.logWater(technician.token, other.id, reading)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("menolak nilai di luar rentang dengan galat per field", async () => {
    const { mine, technician } = await setup();
    await expect(mock.ponds.logWater(technician.token, mine.id, { ...reading, ph: 12 })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { ph: expect.any(String) },
    });
  });
});

describe("mock teknisi: tugas", () => {
  async function withTask() {
    const ctx = await setup();
    const task = await mock.tasks.create(ctx.owner, {
      pond_id: ctx.mine.id,
      assignee_id: ctx.technician.id,
      kind: "tindakan",
      title: "Ganti air 20%",
      instruction: "Buang air dasar 20%, isi dari tandon 2.",
      due_at: new Date(Date.now() + 3_600_000).toISOString(),
    });
    return { ...ctx, task };
  }

  it("menampilkan tugas di Tugas saya lalu bisa dimulai sekali", async () => {
    const { technician, task } = await withTask();
    expect((await mock.tasks.mine(technician.token)).map((t) => t.id)).toContain(task.id);
    expect((await mock.tasks.start(technician.token, task.id)).status).toBe("dikerjakan");
    await expect(mock.tasks.start(technician.token, task.id)).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("melaporkan tugas dengan foto lalu status jadi dilaporkan", async () => {
    const { owner, technician, task } = await withTask();
    await mock.tasks.report(technician.token, task.id, {
      note: "DO setelah ganti air 4,3",
      measured: null,
      photos: [photo()],
    });
    const detail = await mock.tasks.get(owner, task.id);
    expect(detail.status).toBe("dilaporkan");
    expect(detail.reports[0].photos).toHaveLength(1);
  });

  it("menolak lebih dari 4 foto atau foto di atas 1 MB", async () => {
    const { technician, task } = await withTask();
    const five = Array.from({ length: 5 }, () => photo());
    await expect(
      mock.tasks.report(technician.token, task.id, { note: "", measured: null, photos: five }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    await expect(
      mock.tasks.report(technician.token, task.id, { note: "", measured: null, photos: [photo(1_200_000)] }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("menolak teknisi lain melapor tugas yang bukan miliknya", async () => {
    const { owner, farmId, other, task } = await withTask();
    const stranger = await invite(owner, farmId, [other.id]);
    await expect(
      mock.tasks.report(stranger.token, task.id, { note: "", measured: null, photos: [] }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
