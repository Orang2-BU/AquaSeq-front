import { beforeAll, describe, expect, it } from "vitest";
import { api, type AuthResult, type BatchInput, type Pond, type SampleFeatures } from "../../src/lib/api";

// Opt-in: menulis hanya akun demo pada backend pengujian. Jangan arahkan ke produksi.
describe("backend nyata, tanpa mock fetch", () => {
  let owner: AuthResult;
  let tech: AuthResult;
  let farmId: string;
  let pond: Pond;
  beforeAll(async () => {
    expect(process.env.API_MODE).toBe("live");
    owner = await api.auth.demo("pemilik");
    tech = await api.auth.demo("teknisi");
    const farms = await api.farms.list(owner.access_token);
    expect(farms.length).toBeGreaterThan(0);
    farmId = farms[0].id;
    const ponds = await api.ponds.list(owner.access_token, farmId);
    expect(ponds.length).toBeGreaterThan(0);
    pond = ponds[0];
  });

  it("auth pemilik/teknisi, farms, ponds, notifikasi, tugas", async () => {
    expect((await api.auth.me(owner.access_token)).memberships.some((m) => m.role === "pemilik")).toBe(true);
    expect((await api.auth.me(tech.access_token)).memberships.some((m) => m.role === "teknisi")).toBe(true);
    expect((await api.ponds.get(owner.access_token, pond.id)).id).toBe(pond.id);
    expect(Array.isArray(await api.tasks.list(owner.access_token, farmId))).toBe(true);
    expect(Array.isArray(await api.tasks.mine(tech.access_token))).toBe(true);
    expect((await api.notifications.list(tech.access_token)).unread).toBeGreaterThanOrEqual(0);
  });

  it("batch aman, berisiko, ditolak; rincian penyakit dan mitigasi", async () => {
    const base: SampleFeatures = {
      ct_ahpnd: 40,
      ct_wssv: 40,
      ct_ehp: 40,
      ct_amoa: 26.2,
      ct_16s: 18.4,
      ct_ppc: 19.95,
      do_mg_l: 5.8,
      tom_mg_l: 40,
      ph: 7.8,
      salinity_ppt: 18,
      temp_c: 29,
      tan_mg_l: 0.2,
      no2_mg_l: 0.1,
      h2s_mg_l: 0.001,
      alkalinity: 140,
    };
    const features = [
      base,
      {
        ...base,
        ct_ahpnd: 18.84,
        ct_ehp: 25.16,
        do_mg_l: 2.65,
        tom_mg_l: 128.4,
        tan_mg_l: 3.2,
        ph: 8.4,
        no2_mg_l: 4.85,
        h2s_mg_l: 0.092,
      },
      { ...base, ct_ppc: 24.46 },
    ];
    const body: BatchInput = {
      run: {
        lab_name: "Uji integrasi SIMULASI",
        instrument: "GSI",
        tested_at: "2026-10-24",
        file_name: "live-test-simulasi.csv",
      },
      samples: features.map((f, i) => ({
        pond_id: pond.id,
        sample_code: `LIVE-${Date.now()}-${i}`,
        sampling_date: "2026-10-24",
        cycle_day: 41,
        source_type: "GSI_LAB",
        features: f,
        meta: { wells: [], standards: [], water_log_id: null },
      })),
    };
    const batch = await api.samples.createBatch(owner.access_token, body);
    expect(batch.results).toHaveLength(3);
    expect(batch.results[0].sdri_result.risk_class).toBe(1);
    expect(batch.results[1].sdri_result.risk_class).toBe(4);
    expect(batch.results[2].sdri_result.status).toBe("REJECTED_INHIBITOR");
    const detail = await api.samples.get(owner.access_token, batch.results[1].sample_id);
    expect(detail.sdri_result.disease_name).toBeTruthy();
    expect(detail.sdri_result.mitigation_actions?.length).toBeGreaterThan(0);
  });

  it("sampel dengan target patogen tidak diuji (null) ditolak backend", async () => {
    const missingTarget: SampleFeatures = {
      ct_ahpnd: null,
      ct_wssv: 40,
      ct_ehp: 40,
      ct_amoa: 26.2,
      ct_16s: 18.4,
      ct_ppc: 19.95,
      do_mg_l: 5.8,
      tom_mg_l: 40,
      ph: 7.8,
      salinity_ppt: 18,
      temp_c: 29,
      tan_mg_l: 0.2,
      no2_mg_l: 0.1,
      h2s_mg_l: 0.001,
      alkalinity: 140,
    };
    const body: BatchInput = {
      run: {
        lab_name: "Uji target tidak diuji",
        instrument: "GSI",
        tested_at: "2026-10-24",
        file_name: "live-missing-target.csv",
      },
      samples: [
        {
          pond_id: pond.id,
          sample_code: `LIVE-MISSING-${Date.now()}`,
          sampling_date: "2026-10-24",
          cycle_day: 41,
          source_type: "GSI_LAB",
          features: missingTarget,
          meta: { wells: [], standards: [], water_log_id: null },
        },
      ],
    };
    const batch = await api.samples.createBatch(owner.access_token, body);
    expect(batch.results).toHaveLength(1);
    expect(batch.results[0].sdri_result.status).toBe("REJECTED_INVALID_QC");
    expect(batch.results[0].sdri_result.risk_class).toBe(0);
  });

  it("insights kolam sesuai skema klien", async () => {
    const data = await api.ponds.insights(owner.access_token, pond.id);
    expect(typeof data.anomaly.flagged).toBe("boolean");
    expect(data.forecast_7d.horizon_days).toBeGreaterThan(0);
  });

  it("versi model sesuai skema klien", async () => {
    const models = await api.models.list(owner.access_token);
    expect(models.some((m) => m.version.includes("V1"))).toBe(true);
  });

  it("teknisi mencatat kimia air pada kolamnya", async () => {
    const [farm] = await api.farms.list(tech.access_token);
    const [assigned] = await api.ponds.list(tech.access_token, farm.id);
    expect(assigned).toBeDefined();
    const result = await api.waterLogs.create(tech.access_token, assigned.id, {
      measured_at: new Date().toISOString(),
      temp_c: 29.3,
      ph: 7.8,
      do_mg_l: 5.6,
      tan_mg_l: 0.32,
    });
    expect(result.recorded_by.id).toBe(tech.user.id);
    expect(Number.isFinite(result.nh3_mg_l)).toBe(true);
  });

  it("lintas akun pemilik dan teknisi mendapat 403", async () => {
    const outsider = await api.auth.register({
      full_name: "Pemilik uji isolasi",
      email: `live-${Date.now()}@example.test`,
      password: "UjiIsolasi-2026!",
    });
    await expect(api.ponds.get(outsider.access_token, pond.id)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(api.farms.archive(tech.access_token, farmId)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(api.samples.get(tech.access_token, "00000000-0000-0000-0000-000000000000")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
