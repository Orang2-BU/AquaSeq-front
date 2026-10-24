import { z } from "zod";

// Klien backend Go (docs/09-API-KONTRAK.md). Hanya dipanggil dari server; endpoint lain menyusul per task.

const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
  fields: z.record(z.string(), z.string()).optional(),
});

const envelopeSchema = z.object({ success: z.boolean(), data: z.unknown(), error: errorSchema.nullable() });

export const healthSchema = z.object({ status: z.string(), service: z.string(), version: z.string() });

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Buka amplop `{ success, data, error }` (09-API-KONTRAK §1) lalu validasi `data` dengan skema. */
export function unwrap<T>(body: unknown, schema: z.ZodType<T>): T {
  const envelope = envelopeSchema.parse(body);
  if (!envelope.success || envelope.error) {
    throw new ApiError(
      envelope.error?.code ?? "INTERNAL",
      envelope.error?.message ?? "Server analisis mengembalikan galat.",
    );
  }
  return schema.parse(envelope.data);
}

async function get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const base = process.env.API_BASE_URL ?? "http://localhost:8080";
  const response = await fetch(`${base}/api/v1${path}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  return unwrap(await response.json(), schema);
}

const live = {
  health: () => get("/health", healthSchema),
};

const mock: typeof live = {
  health: async () => ({ status: "healthy", service: "aquaseq-mock", version: "0.1.0" }),
};

export const api = process.env.API_MODE === "live" ? live : mock;
