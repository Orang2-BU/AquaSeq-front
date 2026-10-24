import { describe, expect, it } from "vitest";
import { ApiError, healthSchema, unwrap } from "..";

// Contoh respons diambil dari backend commit 767f56c (internal/handler/handler.go) dan 09-API-KONTRAK §1.

describe("unwrap", () => {
  it("mengembalikan data health dari amplop sukses", () => {
    const body = {
      success: true,
      data: { status: "healthy", service: "aquaseq-engine", version: "1.0.0" },
      error: null,
    };
    expect(unwrap(body, healthSchema).service).toBe("aquaseq-engine");
  });

  it("melempar ApiError dengan kode dan pesan dari amplop galat", () => {
    const body = { success: false, data: null, error: { code: "BAD_REQUEST", message: "Ct_PPC is required" } };
    expect(() => unwrap(body, healthSchema)).toThrow(new ApiError("BAD_REQUEST", "Ct_PPC is required"));
  });

  it("menolak data yang tidak sesuai skema", () => {
    const body = { success: true, data: { status: "healthy" }, error: null };
    expect(() => unwrap(body, healthSchema)).toThrow();
  });
});
