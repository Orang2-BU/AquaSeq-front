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
  method: "GET" | "POST",
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
};

export type Api = typeof live;

export const api: Api = process.env.API_MODE === "live" ? live : mock;
