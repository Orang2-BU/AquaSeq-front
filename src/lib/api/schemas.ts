import { z } from "zod";

const num = z.number().nullable();

export const featuresSchema = z.object({
  ct_ahpnd: num,
  ct_wssv: num,
  ct_ehp: num,
  ct_amoa: num,
  ct_16s: num,
  ct_ppc: z.number(),
  do_mg_l: num,
  tom_mg_l: num,
  ph: num,
  salinity_ppt: num,
  temp_c: num,
  tan_mg_l: num,
  no2_mg_l: num,
  h2s_mg_l: num,
  alkalinity: num,
});

export const wellSchema = z.object({
  position: z.string(),
  target: z.string(),
  ct: num,
  tm: num,
  excluded_reason: z.string().nullable(),
});

export const standardSchema = z.object({ copies_rxn: z.number(), ct: z.number() });

const contributorSchema = z.object({
  feature: z.string(),
  value: z.number(),
  baseline: z.number(),
  deviation: z.number(),
});

const forecastSchema = z.object({
  horizon_days: z.number().int(),
  predicted_probability_pct: z.number().nullable(),
  predicted_logit_z: z.number().nullable().optional(),
  lower: z.number().nullable().optional(),
  upper: z.number().nullable().optional(),
  method: z.string(),
  data_points: z.number().int(),
  status: z.string(),
  synthetic: z.boolean().optional().default(false),
  disclaimer: z.string().optional(),
});

const similarCaseSchema = z.object({
  case: z.object({
    id: z.string(),
    farm_id: z.string().optional(),
    pond_id: z.string().optional(),
    cycle_id: z.string().optional(),
    features: z.record(z.string(), z.number()).optional(),
    sdri_class: z.number().int().optional(),
    action: z.string().optional(),
    outcome: z.string().optional(),
    synthetic: z.boolean().optional(),
  }),
  distance: z.number(),
  similarity: z.number().optional(),
  synthetic: z.boolean().optional(),
});

const explanationReportSchema = z
  .object({
    disease_potential: z.string().optional().default(""),
    evidence_reason: z.string().optional().default(""),
    actions: z
      .array(
        z.object({
          action: z.string(),
          source: z.string(),
        }),
      )
      .optional()
      .default([]),
    seven_day_outlook: z.string().optional().default(""),
    full_narrative: z.string().optional().default(""),
  })
  .nullable();

export const insightsSchema = z.object({
  pond_id: z.string().optional(),
  status: z.enum(["OK", "INSUFFICIENT_DATA", "QC_REJECTED"]),
  anomaly: z.object({
    pond_id: z.string().optional(),
    dataset_name: z.string().optional(),
    score: z.number(),
    flagged: z.boolean(),
    contributors: z.array(contributorSchema).default([]),
    earlier_than_class_steps: z.number().int().nullable().optional(),
    first_anomaly_step: z.number().int().nullable().optional(),
    class_four_step: z.number().int().nullable().optional(),
    synthetic: z.boolean().optional().default(false),
  }),
  forecast_7d: forecastSchema,
  forecast_14d: forecastSchema.optional(),
  similar_cases: z.array(similarCaseSchema).default([]),
  explanation: explanationReportSchema,
});

const documentWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  location: z.string().optional().default("Dokumen"),
});

const fieldSourceSchema = z.object({
  cell: z.string().optional(),
  column: z.string(),
  row: z.number().int(),
  raw_value: z.string(),
  unit: z.string().optional(),
});

const rawSampleRecordSchema = z.object({
  sample_code: z.string(),
  features: featuresSchema.partial().extend({ ct_ppc: num.optional() }),
  wells: z
    .array(
      z.object({
        well: z.string().optional().default(""),
        target: z.string(),
        ct: num,
        tm: z.number().optional(),
        status: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  confidence: z.number().optional(),
  qc_status: z.string().optional(),
  block_prediction: z.boolean().optional().default(false),
  review_reasons: z.array(z.string()).optional(),
  missing_features: z.array(z.string()).optional(),
  undetected_targets: z.array(z.string()).optional(),
  provenance: z.record(z.string(), fieldSourceSchema).optional(),
});

export const documentIngestSchema = z.object({
  file_name: z.string(),
  file_type: z.string(),
  run: z.object({
    lab_name: z.string(),
    instrument: z.string(),
    tested_at: z.string(),
  }),
  samples: z.array(rawSampleRecordSchema).default([]),
  wells: z
    .array(
      z.object({
        well: z.string().optional().default(""),
        target: z.string(),
        ct: num,
        tm: z.number().optional(),
        status: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  confidence: z.number().optional(),
  qc_status: z.string().optional(),
  block_prediction: z.boolean().optional().default(false),
  warnings: z.array(documentWarningSchema).default([]),
});

export const modelVersionSchema = z.object({
  version: z.string(),
  status: z.enum(["kandidat", "aktif", "arsip"]),
  metrics: z.record(z.string(), z.union([z.number(), z.string()])),
  n_labels: z.number().int().nonnegative(),
  synthetic: z.boolean(),
  trained_at: z.string().optional(),
  promoted_at: z.string().nullable().optional(),
  promoted_by: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export const modelVersionsSchema = z.object({ items: z.array(modelVersionSchema) });
export type DocumentIngest = z.infer<typeof documentIngestSchema>;
