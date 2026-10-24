import { z } from "zod";
import { ApiError } from "./errors";
import { mock } from "./mock";

export { ApiError };

// Klien backend Go (docs/09-API-KONTRAK.md). Hanya dipanggil dari server; endpoint lain menyusul per task.

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

export const pondSchema = z.object({
  id: z.string(),
  farm_id: z.string(),
  pond_code: z.string(),
  name: z.string().nullable(),
  system: z.enum(["intensif", "bioflok"]),
  area_sqm: z.number().nullable(),
  current_cycle: z.number().int(),
  assignee: z.object({ id: z.string(), full_name: z.string() }).nullable(),
  latest_result: sdriResultSchema.nullable(),
  latest_sampling_date: z.string().nullable(),
  trend: z.enum(["RAPID_INCREASE", "STABLE", "DECREASING", "INSUFFICIENT_DATA"]),
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
export type Member = z.infer<typeof memberSchema>;
export type PendingInvitation = z.infer<typeof pendingInvitationSchema>;
export type InvitationInfo = z.infer<typeof invitationInfoSchema>;
type FarmInput = { name: string; regency: string; address?: string };
type PondInput = { pond_code: string; system: "intensif" | "bioflok"; area_sqm?: number };
type PondUpdate = { pond_code?: string; system?: "intensif" | "bioflok"; area_sqm?: number | null };

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

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  schema: z.ZodType<T>,
  { token, body }: { token?: string; body?: unknown } = {},
): Promise<T> {
  const base = process.env.API_BASE_URL ?? "http://localhost:8080";
  const response = await fetch(`${base}/api/v1${path}`, {
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
    create: (token: string, farmId: string, body: PondInput) =>
      request("POST", `/farms/${seg(farmId)}/ponds`, pondSchema, { token, body }),
    update: (token: string, pondId: string, body: PondUpdate) =>
      request("PATCH", `/ponds/${seg(pondId)}`, pondSchema, { token, body }),
    archive: (token: string, pondId: string) => request("POST", `/ponds/${seg(pondId)}/archive`, pondSchema, { token }),
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
};

export type Api = typeof live;

export const api: Api = process.env.API_MODE === "live" ? live : mock;
