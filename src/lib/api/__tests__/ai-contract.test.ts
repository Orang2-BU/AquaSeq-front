import { describe, expect, it } from "vitest";
import { api, documentIngestSchema, insightsSchema, modelVersionsSchema } from "..";

describe("kontrak AI backend", () => {
  it("memvalidasi seed insight, dokumen dan versi model melalui Zod", async () => {
    const { access_token: token } = await api.auth.demo("pemilik");
    const [farm] = await api.farms.list(token);
    const [pond] = await api.ponds.list(token, farm.id);
    const insight = insightsSchema.parse(await api.ponds.insights(token, pond.id));
    expect(insight.anomaly.synthetic).toBe(true);
    expect(insight.forecast_7d.method).toBe("THEIL_SEN_LOGIT");
    expect(insight.anomaly.contributors[0]?.feature).toBe("do_mg_l");
    const models = modelVersionsSchema.parse({ items: await api.models.list(token) });
    expect(models.items.some((m) => m.status === "kandidat" && m.synthetic)).toBe(true);
    const doc = documentIngestSchema.parse(await api.documents.ingest(token, new File(["demo"], "simulasi.pdf")));
    expect(doc.warnings.some((w) => w.code === "DEMO_DATA")).toBe(true);
    expect(doc.samples.length).toBeGreaterThan(0);
  });

  it("mempertahankan prakiraan kosong tanpa menciptakan angka", () => {
    const forecast = {
      horizon_days: 7,
      predicted_probability_pct: null,
      method: "THEIL_SEN_LOGIT",
      data_points: 1,
      status: "INSUFFICIENT_DATA",
      synthetic: true,
    };
    const data = insightsSchema.parse({
      pond_id: "p-1",
      status: "INSUFFICIENT_DATA",
      anomaly: { score: 0, flagged: false, contributors: [], synthetic: true },
      forecast_7d: forecast,
      forecast_14d: { ...forecast, horizon_days: 14 },
      similar_cases: [],
      explanation: null,
    });
    expect(data.forecast_7d.predicted_probability_pct).toBeNull();
    expect(data.forecast_7d.lower).toBeUndefined();
    expect(data.forecast_7d).not.toHaveProperty("confidence");
    expect(data.anomaly.earlier_than_class_steps).toBeUndefined();
    expect(data.explanation).toBeNull();
  });

  it("menerima ekstraksi mentah tanpa pemetaan kolam atau angka buatan", () => {
    const data = documentIngestSchema.parse({
      file_name: "air.pdf",
      file_type: "PDF",
      run: { lab_name: "Lab", instrument: "Alat", tested_at: "2026-10-24T00:00:00Z" },
      samples: [
        {
          sample_code: "A1",
          features: { ct_ppc: null, ct_ahpnd: null },
          qc_status: "REVIEW_REQUIRED",
          block_prediction: true,
          provenance: { ct_ahpnd: { row: 2, column: "pirA", raw_value: "" } },
        },
      ],
      warnings: [],
    });
    expect(data.samples[0].features.ct_ppc).toBeNull();
    expect(data.samples[0].features.do_mg_l).toBeUndefined();
    expect(data.samples[0]).not.toHaveProperty("pond_id");
    expect(data.samples[0]).not.toHaveProperty("sampling_date");
    expect(data.samples[0].block_prediction).toBe(true);
  });

  it("menolak insight yang mengandung angka tidak valid", () => {
    expect(insightsSchema.safeParse({ anomaly: { score: "tinggi" } }).success).toBe(false);
  });

  it("menjaga diagnosis dan sumber tindakan dari mesin", async () => {
    const { access_token: token } = await api.auth.demo("pemilik");
    const [farm] = await api.farms.list(token);
    const [pond] = await api.ponds.list(token, farm.id);
    const [sample] = await api.ponds.samples(token, pond.id);
    const detail = await api.samples.get(token, sample.sample_id);
    expect(detail.sdri_result.disease_name).toBeTruthy();
    const mitigation = detail.sdri_result.mitigation_actions?.[0];
    expect(typeof mitigation === "string" ? mitigation : mitigation?.source).toBeTruthy();
  });

  it("mewajibkan pemilik dan catatan sebelum promosi kandidat", async () => {
    const owner = await api.auth.demo("pemilik");
    const tech = await api.auth.demo("teknisi");
    await expect(api.models.promote(tech.access_token, "V2-Kandidat", "Uji pipeline sintetik")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(api.models.promote(owner.access_token, "V2-Kandidat", "")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
    const promoted = await api.models.promote(
      owner.access_token,
      "V2-Kandidat",
      "Uji pipeline sintetik, bukan akurasi lapangan",
    );
    expect(promoted.status).toBe("aktif");
    expect(promoted.promoted_by).toBe(owner.user.full_name);
    expect(promoted.promoted_at).toBeTruthy();
  });
});
