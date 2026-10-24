import { z } from "zod";
import { ApiError } from "./errors";
import { mock } from "./mock";

export { ApiError };

// Klien backend Go (docs/09-API-KONTRAK.md). Hanya dipanggil dari server.

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.record(z.string(), z.string()).optional(),
});

const envelopeSchema = z.object({ success: z.boolean(), data: z.unknown(), error: errorSchema.nullable() });

export const healthSchema = z.object({ status: z.string(), service: z.string(), version: z.string() });

const userSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone_wa: z.string().nullable().optional(),
});

const tokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  /** Umur access token dalam detik (09-API-KONTRAK §2). */
  expires_in: z.number().int().positive(),
});

const authResultSchema = tokensSchema.extend({ user: userSchema });

const meSchema = userSchema.extend({
  memberships: z.array(z.object({ farm_id: z.string(), farm_name: z.string(), role: z.enum(["pemilik", "teknisi"]) })),
});

const farmSchema = z.object({
  id: z.string(),
  name: z.string(),
  regency: z.string(),
  address: z.string().nullable(),
  provenance: z.enum(["simulasi", "nyata"]),
  archived_at: z.string().nullable(),
  /** Ringkasan untuk kartu lokasi (09-API-KONTRAK §3). */
  pond_count: z.number().int(),
  technician_count: z.number().int(),
  at_risk_count: z.number().int(),
});

/** Hasil skor backend (09-API-KONTRAK §4). Web hanya menampilkan, tidak menghitung. */
const sdriResultSchema = z.object({
  status: z.enum(["VALID", "REJECTED_INHIBITOR", "REJECTED_INVALID_QC"]),
  z_score: z.number(),
  probability_pct: z.number(),
  /** 1-4, 0 bila sampel ditolak. */
  risk_class: z.number().int().min(0).max(4),
  risk_level: z.string(),
  s_qpcr: z.number(),
  s_bio: z.number(),
  s_chem: z.number(),
  model_version: z.string(),
  recommendation: z.string(),
});

const trendSchema = z.enum(["RAPID_INCREASE", "MODERATE_INCREASE", "STABLE", "DECREASING", "INSUFFICIENT_DATA"]);
const ref = z.object({ id: z.string(), full_name: z.string() });
const pondRef = z.object({ id: z.string(), pond_code: z.string() });
const num = z.number().nullable();

export const pondSchema = z.object({
  id: z.string(),
  farm_id: z.string(),
  pond_code: z.string(),
  name: z.string().nullable(),
  system: z.enum(["intensif", "bioflok"]),
  area_sqm: z.number().nullable(),
  current_cycle: z.number().int(),
  /** Tanggal tebar siklus berjalan (`YYYY-MM-DD`), dasar DOC. */
  stocked_at: z.string().nullable(),
  assignee: ref.nullable(),
  /** Nomor WhatsApp tujuan pesan peringatan kolam ini (P34). */
  wa_target: z.string().nullable(),
  latest_result: sdriResultSchema.nullable(),
  latest_sampling_date: z.string().nullable(),
  trend: trendSchema,
});

const waterLogSchema = z.object({
  id: z.string(),
  pond: pondRef,
  measured_at: z.string(),
  temp_c: z.number(),
  ph: z.number(),
  do_mg_l: z.number(),
  tan_mg_l: z.number(),
  no2_mg_l: num,
  h2s_mg_l: num,
  tom_mg_l: num,
  alkalinity: num,
  salinity_ppt: num,
  transparency_cm: num,
  /** NH₃ bebas, dihitung backend (Emerson). */
  nh3_mg_l: z.number(),
  recorded_by: ref,
});

const pondDetailSchema = pondSchema.extend({ latest_water_log: waterLogSchema.nullable() });

const trajectorySchema = z.object({
  pond_id: z.string(),
  data_points: z.number().int(),
  slope: z.number(),
  trend: trendSchema,
  trajectory_alert: z.boolean(),
  alert_message: z.string(),
  history: z.array(
    z.object({
      sampling_date: z.string(),
      cycle_day: z.number().int(),
      probability_pct: z.number(),
      risk_class: z.number().int(),
    }),
  ),
});

const pondSampleSchema = z.object({
  sample_id: z.string(),
  sample_code: z.string(),
  sampling_date: z.string(),
  cycle_day: z.number().int(),
  sdri_result: sdriResultSchema,
});

const featuresSchema = z.object({
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

const wellSchema = z.object({
  position: z.string(),
  target: z.string(),
  ct: num,
  tm: num,
  excluded_reason: z.string().nullable(),
});

const standardSchema = z.object({ copies_rxn: z.number(), ct: z.number() });

const sampleSchema = z.object({
  id: z.string(),
  pond: pondRef,
  batch_id: z.string().nullable(),
  sample_code: z.string(),
  sampling_date: z.string(),
  cycle_day: z.number().int(),
  features: featuresSchema,
  /** Data well mentah; tidak dikirim ke teknisi. */
  meta: z
    .object({ wells: z.array(wellSchema), standards: z.array(standardSchema), water_log_id: z.string().nullable() })
    .nullable(),
  sdri_result: sdriResultSchema,
  copies_per_ml: z.object({ ahpnd: num, wssv: num, ehp: num }),
  nh3_mg_l: num,
});

const batchSummarySchema = z.object({
  batch_id: z.string(),
  lab_name: z.string(),
  instrument: z.string(),
  tested_at: z.string(),
  file_name: z.string(),
  sample_count: z.number().int(),
  rejected_count: z.number().int(),
  created_at: z.string(),
});

const batchSchema = batchSummarySchema.extend({
  samples: z.array(
    z.object({ sample_id: z.string(), sample_code: z.string(), pond: pondRef, sdri_result: sdriResultSchema }),
  ),
  meta: z.object({
    wells: z.array(wellSchema.extend({ sample_code: z.string() })),
    standards: z.array(standardSchema),
  }),
});

const batchResultSchema = z.object({
  batch_id: z.string(),
  results: z.array(z.object({ sample_code: z.string(), sample_id: z.string(), sdri_result: sdriResultSchema })),
});

const alertSchema = z.object({
  id: z.string(),
  pond_id: z.string(),
  pond_code: z.string(),
  kind: z.enum(["RISK_CLASS", "REJECTED", "TRAJECTORY"]),
  risk_class: z.number().int(),
  probability_pct: z.number(),
  message: z.string(),
  sample_id: z.string().nullable(),
  since: z.string(),
  acked_at: z.string().nullable(),
  open_task_id: z.string().nullable(),
});

const taskStatusSchema = z.enum(["baru", "dikerjakan", "dilaporkan", "selesai", "diminta_ulang", "batal"]);
const taskKindSchema = z.enum(["tindakan", "ambil_sampel", "catat_air"]);

const taskSchema = z.object({
  id: z.string(),
  farm_id: z.string(),
  pond: pondRef,
  assignee: ref,
  created_by: ref,
  kind: taskKindSchema,
  title: z.string(),
  instruction: z.string(),
  due_at: z.string(),
  status: taskStatusSchema,
  owner_note: z.string().nullable(),
  source_sample_id: z.string().nullable(),
  overdue: z.boolean(),
  created_at: z.string(),
});

const taskDetailSchema = taskSchema.extend({
  reports: z.array(
    z.object({
      id: z.string(),
      note: z.string(),
      measured: z.record(z.string(), z.number()).nullable(),
      photos: z.array(z.object({ id: z.string(), url: z.string() })),
      reported_by: ref,
      reported_at: z.string(),
    }),
  ),
  history: z.array(z.object({ status: taskStatusSchema, by: ref, note: z.string().nullable(), at: z.string() })),
});

const cycleSchema = z.object({
  cycle_number: z.number().int(),
  outcome: z.enum(["HARVEST_SUCCESS", "OUTBREAK", "EMERGENCY_HARVEST"]),
  actual_harvest_kg: z.number(),
  outbreak_date: z.string().nullable(),
  primary_suspect_pathogen: z.string().nullable(),
  notes: z.string().nullable(),
});

const notificationsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["tugas_baru", "laporan_masuk", "peringatan_baru", "tugas_selesai", "tugas_terlambat"]),
      title: z.string(),
      entity: z.enum(["task", "pond", "sample", "batch"]),
      entity_id: z.string(),
      read_at: z.string().nullable(),
      created_at: z.string(),
    }),
  ),
  unread: z.number().int(),
});

const activitySchema = z.object({
  actor: ref,
  action: z.string(),
  entity: z.string(),
  entity_id: z.string(),
  detail: z.string(),
  at: z.string(),
});

const memberSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  email: z.string(),
  role: z.enum(["pemilik", "teknisi"]),
  active: z.boolean(),
  pond_codes: z.array(z.string()),
  open_tasks: z.number().int(),
});

const pendingInvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  pond_codes: z.array(z.string()),
  expires_at: z.string(),
});

const membersSchema = z.object({ items: z.array(memberSchema), invitations: z.array(pendingInvitationSchema) });

const invitationSchema = z.object({ id: z.string(), email: z.string(), expires_at: z.string() });

const invitationInfoSchema = z.object({
  farm_name: z.string(),
  owner_name: z.string(),
  email: z.string(),
  pond_codes: z.array(z.string()),
  expired: z.boolean(),
});

const list = <T extends z.ZodType>(item: T) => z.object({ items: z.array(item) }).transform((d) => d.items);

export type Farm = z.infer<typeof farmSchema>;
export type SdriResult = z.infer<typeof sdriResultSchema>;
export type Pond = z.infer<typeof pondSchema>;
export type Trajectory = z.infer<typeof trajectorySchema>;
export type PondSample = z.infer<typeof pondSampleSchema>;
export type SampleFeatures = z.infer<typeof featuresSchema>;
export type Well = z.infer<typeof wellSchema>;
export type WaterLog = z.infer<typeof waterLogSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskDetail = z.infer<typeof taskDetailSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskKind = z.infer<typeof taskKindSchema>;
export type Cycle = z.infer<typeof cycleSchema>;
export type Notifications = z.infer<typeof notificationsSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Member = z.infer<typeof memberSchema>;
export type PendingInvitation = z.infer<typeof pendingInvitationSchema>;
export type InvitationInfo = z.infer<typeof invitationInfoSchema>;
type FarmInput = { name: string; regency: string; address?: string };
type PondInput = { pond_code: string; system: "intensif" | "bioflok"; area_sqm?: number };
type PondUpdate = {
  pond_code?: string;
  system?: "intensif" | "bioflok";
  area_sqm?: number | null;
  wa_target?: string | null;
};
export type BatchInput = {
  run: { lab_name: string; instrument: string; tested_at: string; file_name: string };
  samples: {
    pond_id: string;
    sample_code: string;
    sampling_date: string;
    cycle_day: number;
    source_type: "GSI_LAB";
    features: SampleFeatures;
    meta: { wells: Well[]; standards: { copies_rxn: number; ct: number }[]; water_log_id: string | null };
  }[];
};
type TaskInput = {
  pond_id: string;
  assignee_id: string;
  kind: TaskKind;
  title: string;
  instruction: string;
  due_at: string;
  source_sample_id?: string;
  source_alert_id?: string;
};
type TaskUpdate = Partial<Pick<TaskInput, "title" | "instruction" | "due_at" | "assignee_id">> & {
  status?: "selesai" | "diminta_ulang" | "batal";
  owner_note?: string;
};
type CycleInput = {
  pond_id: string;
  cycle_number: number;
  outcome: Cycle["outcome"];
  actual_harvest_kg?: number;
  outbreak_date?: string;
  primary_suspect_pathogen?: string;
  notes?: string;
};
type WhatsAppInput = {
  pond_code: string;
  probability_pct: number;
  risk_class: number;
  primary_driver: string;
  action: string;
};

export type Tokens = z.infer<typeof tokensSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;
export type Me = z.infer<typeof meSchema>;
export type Role = Me["memberships"][number]["role"];

/** Buka amplop `{ success, data, error }` (09-API-KONTRAK §1) lalu validasi `data` dengan skema. */
export function unwrap<T>(body: unknown, schema: z.ZodType<T>): T {
  const envelope = envelopeSchema.parse(body);
  if (!envelope.success || envelope.error) {
    throw new ApiError(
      envelope.error?.code ?? "INTERNAL",
      envelope.error?.message ?? "Server analisis mengembalikan galat.",
      envelope.error?.fields,
    );
  }
  return schema.parse(envelope.data);
}

const base = () => `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1`;

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  schema: z.ZodType<T>,
  { token, body }: { token?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetch(`${base()}${path}`, {
    method,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return unwrap(await response.json(), schema);
}

const ok = z.unknown();
/** Segmen path aman dari ID. */
const seg = encodeURIComponent;

const live = {
  health: () => request("GET", "/health", healthSchema),
  auth: {
    login: (body: { email: string; password: string }) => request("POST", "/auth/login", authResultSchema, { body }),
    register: (body: { full_name: string; email: string; password: string }) =>
      request("POST", "/auth/register", authResultSchema, { body }),
    demo: (role: Role) => request("POST", "/auth/demo", authResultSchema, { body: { role } }),
    refresh: (refresh_token: string) => request("POST", "/auth/refresh", tokensSchema, { body: { refresh_token } }),
    logout: (refresh_token: string) => request("POST", "/auth/logout", ok, { body: { refresh_token } }).then(() => {}),
    me: (token: string) => request("GET", "/auth/me", meSchema, { token }),
    updateMe: (token: string, body: { full_name: string; phone_wa: string | null }) =>
      request("PATCH", "/auth/me", userSchema, { token, body }),
    changePassword: (token: string, body: { current_password: string; new_password: string }) =>
      request("POST", "/auth/password", ok, { token, body }).then(() => {}),
  },
  farms: {
    list: (token: string) => request("GET", "/farms", list(farmSchema), { token }),
    create: (token: string, body: FarmInput) => request("POST", "/farms", farmSchema, { token, body }),
    update: (token: string, id: string, body: FarmInput) =>
      request("PATCH", `/farms/${seg(id)}`, farmSchema, { token, body }),
    archive: (token: string, id: string) => request("POST", `/farms/${seg(id)}/archive`, farmSchema, { token }),
  },
  ponds: {
    list: (token: string, farmId: string) =>
      request("GET", `/farms/${seg(farmId)}/ponds?status=ACTIVE`, list(pondSchema), { token }),
    get: (token: string, pondId: string) => request("GET", `/ponds/${seg(pondId)}`, pondDetailSchema, { token }),
    create: (token: string, farmId: string, body: PondInput) =>
      request("POST", `/farms/${seg(farmId)}/ponds`, pondSchema, { token, body }),
    update: (token: string, pondId: string, body: PondUpdate) =>
      request("PATCH", `/ponds/${seg(pondId)}`, pondSchema, { token, body }),
    archive: (token: string, pondId: string) => request("POST", `/ponds/${seg(pondId)}/archive`, pondSchema, { token }),
    trajectory: (token: string, pondId: string) =>
      request("GET", `/ponds/${seg(pondId)}/trajectory`, trajectorySchema, { token }),
    samples: (token: string, pondId: string) =>
      request("GET", `/ponds/${seg(pondId)}/samples`, list(pondSampleSchema), { token }),
    waterLogs: (token: string, pondId: string) =>
      request("GET", `/ponds/${seg(pondId)}/water-logs`, list(waterLogSchema), { token }),
    cycles: (token: string, pondId: string) =>
      request("GET", `/ponds/${seg(pondId)}/cycles`, list(cycleSchema), { token }),
  },
  members: {
    list: (token: string, farmId: string) => request("GET", `/farms/${seg(farmId)}/members`, membersSchema, { token }),
    /** Menonaktifkan teknisi juga melepas kolam yang dipegangnya. */
    update: (token: string, farmId: string, userId: string, body: { active: boolean }) =>
      request("PATCH", `/farms/${seg(farmId)}/members/${seg(userId)}`, memberSchema, { token, body }),
    /** Atomik: kolam terpilih pindah ke teknisi ini, kolam lamanya yang tidak dipilih dilepas. */
    assignPonds: (token: string, farmId: string, userId: string, pond_ids: string[]) =>
      request("PUT", `/farms/${seg(farmId)}/members/${seg(userId)}/ponds`, memberSchema, {
        token,
        body: { pond_ids },
      }),
  },
  invitations: {
    create: (token: string, farmId: string, body: { email: string; pond_ids: string[] }) =>
      request("POST", `/farms/${seg(farmId)}/invitations`, invitationSchema, { token, body }),
    revoke: (token: string, invitationId: string) =>
      request("DELETE", `/invitations/${seg(invitationId)}`, ok, { token }).then(() => {}),
    byToken: (invitationToken: string) =>
      request("GET", `/invitations/by-token/${seg(invitationToken)}`, invitationInfoSchema),
    accept: (invitationToken: string, body: { full_name: string; password: string }) =>
      request("POST", `/invitations/by-token/${seg(invitationToken)}/accept`, authResultSchema, { body }),
  },
  samples: {
    get: (token: string, sampleId: string) => request("GET", `/samples/${seg(sampleId)}`, sampleSchema, { token }),
    /** Satu CSV = satu batch, atomik (09-API-KONTRAK §4). */
    createBatch: (token: string, body: BatchInput) =>
      request("POST", "/samples/batch", batchResultSchema, { token, body }),
  },
  batches: {
    list: (token: string, farmId: string) =>
      request("GET", `/batches?farm_id=${seg(farmId)}`, list(batchSummarySchema), { token }),
    get: (token: string, batchId: string) => request("GET", `/batches/${seg(batchId)}`, batchSchema, { token }),
  },
  waterLogs: {
    list: (token: string, farmId: string) =>
      request("GET", `/farms/${seg(farmId)}/water-logs`, list(waterLogSchema), { token }),
  },
  alerts: {
    list: (token: string, farmId: string) =>
      request("GET", `/farms/${seg(farmId)}/alerts`, list(alertSchema), { token }),
    ack: (token: string, alertId: string) => request("POST", `/alerts/${seg(alertId)}/ack`, alertSchema, { token }),
  },
  tasks: {
    list: (token: string, farmId: string) => request("GET", `/farms/${seg(farmId)}/tasks`, list(taskSchema), { token }),
    get: (token: string, taskId: string) => request("GET", `/tasks/${seg(taskId)}`, taskDetailSchema, { token }),
    create: (token: string, body: TaskInput) => request("POST", "/tasks", taskSchema, { token, body }),
    update: (token: string, taskId: string, body: TaskUpdate) =>
      request("PATCH", `/tasks/${seg(taskId)}`, taskSchema, { token, body }),
  },
  cycles: {
    record: (token: string, body: CycleInput) =>
      request("POST", "/cycles/outcome", z.object({ status: z.string(), message: z.string() }), { token, body }),
  },
  notifications: {
    list: (token: string) => request("GET", "/me/notifications", notificationsSchema, { token }),
    read: (token: string, body: { ids: string[] } | { all: true }) =>
      request("POST", "/me/notifications/read", ok, { token, body }).then(() => {}),
  },
  activity: {
    list: (token: string, farmId: string) =>
      request("GET", `/farms/${seg(farmId)}/activity`, list(activitySchema), { token }),
  },
  reports: {
    whatsapp: (token: string, body: WhatsAppInput) =>
      request("POST", "/reports/whatsapp", z.object({ whatsapp_message: z.string() }), { token, body }),
  },
  files: {
    /** Foto laporan, diteruskan ke browser lewat `/api/files/[id]`. */
    get: async (token: string, fileId: string) => {
      const response = await fetch(`${base()}/files/${seg(fileId)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) throw new ApiError("UNAUTHORIZED", "Sesi sudah berakhir.");
      if (!response.ok) throw new ApiError("NOT_FOUND", "Foto tidak ditemukan.");
      return { body: await response.arrayBuffer(), contentType: response.headers.get("Content-Type") ?? "image/jpeg" };
    },
  },
};

export type Api = typeof live;

export const api: Api = process.env.API_MODE === "live" ? live : mock;
