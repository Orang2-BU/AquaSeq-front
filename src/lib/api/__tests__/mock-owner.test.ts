import { describe, expect, it } from "vitest";
import { mock } from "../mock";

const SUMBER = "f-sumber-rejeki";
const pond = (code: string) => `p-sumber-rejeki-${code.toLowerCase()}`;

async function owner() {
  return (await mock.auth.demo("pemilik")).access_token;
}

describe("mock peringatan", () => {
  it("memunculkan peringatan kelas 3-4, sampel ditolak, dan tren naik cepat", async () => {
    const alerts = await mock.alerts.list(await owner(), SUMBER);
    const kinds = Object.fromEntries(alerts.map((a) => [a.pond_code, a.kind]));
    expect(kinds).toMatchObject({ C4: "RISK_CLASS", B3: "RISK_CLASS", A4: "REJECTED", A2: "TRAJECTORY" });
    expect(kinds.A1).toBeUndefined();
  });

  it("menghilangkan peringatan yang sudah ditandai ditangani", async () => {
    const token = await owner();
    const [first] = await mock.alerts.list(token, SUMBER);
    await mock.alerts.ack(token, first.id);
    expect((await mock.alerts.list(token, SUMBER)).some((a) => a.id === first.id)).toBe(false);
  });
});

describe("mock tugas", () => {
  it("membuat tugas untuk teknisi aktif dan mengirim notifikasi ke teknisi", async () => {
    const token = await owner();
    const task = await mock.tasks.create(token, {
      pond_id: pond("B1"),
      assignee_id: "u-rizky",
      kind: "catat_air",
      title: "Catat kimia air sore kolam B1",
      instruction: "Ukur suhu, pH, DO, dan TAN.",
      due_at: new Date(Date.now() + 3_600_000).toISOString(),
    });
    expect(task).toMatchObject({ status: "baru", overdue: false, assignee: { full_name: "Rizky Pratama" } });
    const rizky = (await mock.auth.demo("teknisi")).access_token;
    const { items } = await mock.notifications.list(rizky);
    expect(items[0]).toMatchObject({ entity: "task", entity_id: task.id, read_at: null });
  });

  it("hanya bisa menutup tugas yang sudah dilaporkan, dan minta ulang wajib catatan", async () => {
    const token = await owner();
    await expect(mock.tasks.update(token, "t-a4-sampel", { status: "selesai" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await expect(mock.tasks.update(token, "t-b3-pakan", { status: "diminta_ulang" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    const redo = await mock.tasks.update(token, "t-b3-pakan", {
      status: "diminta_ulang",
      owner_note: "Foto siphon buram.",
    });
    expect(redo).toMatchObject({ status: "diminta_ulang", owner_note: "Foto siphon buram." });
  });

  it("menandai tugas lewat jatuh tempo sebagai terlambat", async () => {
    const tasks = await mock.tasks.list(await owner(), SUMBER);
    expect(tasks.find((t) => t.id === "t-b2-air")?.overdue).toBe(true);
    expect(tasks.find((t) => t.id === "t-a2-aerasi")?.overdue).toBe(false);
  });
});

describe("mock unggah hasil lab", () => {
  const features = (ct_ppc: number, ct_ahpnd: number | null) => ({
    ct_ahpnd,
    ct_wssv: null,
    ct_ehp: null,
    ct_amoa: 25.6,
    ct_16s: 18,
    ct_ppc,
    do_mg_l: 5.2,
    tom_mg_l: 60,
    ph: 7.8,
    salinity_ppt: 18,
    temp_c: 29.4,
    tan_mg_l: 0.6,
    no2_mg_l: 0.2,
    h2s_mg_l: 0.003,
    alkalinity: 125,
  });
  const sample = (code: string, ppc: number, pirA: number | null) => ({
    pond_id: pond(code),
    sample_code: `${code}-1106`,
    sampling_date: "2026-11-06",
    cycle_day: 66,
    source_type: "GSI_LAB" as const,
    features: features(ppc, pirA),
    meta: { wells: [], standards: [], water_log_id: null },
  });

  it("mengirim satu batch, menolak PPC di luar rentang, dan memperbarui sampel terakhir kolam", async () => {
    const token = await owner();
    const run = {
      lab_name: "Lab Mikrobiologi Polije",
      instrument: "Bio-Rad CFX96",
      tested_at: "2026-11-06",
      file_name: "run-1106.csv",
    };
    const { batch_id, results } = await mock.samples.createBatch(token, {
      run,
      samples: [sample("B4", 19.9, null), sample("C2", 24.1, 33.2)],
    });
    expect(results.map((r) => r.sdri_result.status)).toEqual(["VALID", "REJECTED_INHIBITOR"]);
    const batch = await mock.batches.get(token, batch_id);
    expect(batch).toMatchObject({ sample_count: 2, rejected_count: 1 });
    const c2 = await mock.ponds.get(token, pond("C2"));
    expect(c2.latest_result?.status).toBe("REJECTED_INHIBITOR");
  });

  it("menolak kode sampel yang sudah pernah dikirim untuk kolam yang sama", async () => {
    const token = await owner();
    const run = {
      lab_name: "Lab Mikrobiologi Polije",
      instrument: "Bio-Rad CFX96",
      tested_at: "2026-10-23",
      file_name: "ulang.csv",
    };
    await expect(
      mock.samples.createBatch(token, { run, samples: [{ ...sample("B3", 20, 31), sample_code: "B3-1023" }] }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("mock notifikasi", () => {
  it("menandai semua notifikasi dibaca", async () => {
    const token = await owner();
    expect((await mock.notifications.list(token)).unread).toBeGreaterThan(0);
    await mock.notifications.read(token, { all: true });
    expect((await mock.notifications.list(token)).unread).toBe(0);
  });
});
