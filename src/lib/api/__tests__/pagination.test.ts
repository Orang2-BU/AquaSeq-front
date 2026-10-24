import { afterEach, describe, expect, it, vi } from "vitest";

process.env.API_MODE = "live";
const { api, ApiError } = await import("..");

describe("paginasi live api", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([0, 1])("menolak item yang melebihi total %i", async (total) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        envelope({
          items: [
            {
              actor: { id: "u1", full_name: "Pemilik" },
              action: "ubah",
              entity: "pond",
              entity_id: "p1",
              detail: "Mengubah kolam",
              at: "2026-10-24T00:00:00Z",
            },
            {
              actor: { id: "u2", full_name: "Teknisi" },
              action: "ubah",
              entity: "pond",
              entity_id: "p2",
              detail: "Mengubah kolam",
              at: "2026-10-24T00:00:00Z",
            },
          ],
          total,
        }),
      ),
    );
    await expect(api.activity.list("token", "f1")).rejects.toMatchObject({ code: "PAGINATION_ERROR" });
  });

  it("menolak total berubah antarhalaman", async () => {
    const activity = (i: number) => ({
      actor: { id: "u1", full_name: "Pemilik" },
      action: "ubah",
      entity: "pond",
      entity_id: `p${i}`,
      detail: "Mengubah kolam",
      at: "2026-10-24T00:00:00Z",
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(envelope({ items: Array.from({ length: 100 }, (_, i) => activity(i)), total: 101 }))
        .mockResolvedValueOnce(envelope({ items: [activity(100)], total: 102 })),
    );
    await expect(api.activity.list("token", "f1")).rejects.toMatchObject({ code: "PAGINATION_ERROR" });
  });

  it("aktivitas berbeda pada entitas dan waktu sama tetap berurutan", async () => {
    const first = {
      actor: { id: "u1", full_name: "Pemilik" },
      action: "buat",
      entity: "pond",
      entity_id: "p1",
      detail: "Membuat kolam",
      at: "2026-10-24T00:00:00Z",
    };
    const items = [first, { ...first, action: "ubah", detail: "Mengubah kolam" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelope({ items, total: 2 })));
    expect(await api.activity.list("token", "f1")).toEqual(items);
  });

  it.each([undefined, -1, 1.5, "25", null])("menolak total tidak valid %s", async (total) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelope({ items: [], total })));
    await expect(api.ponds.samples("token", "p1")).rejects.toThrow();
  });

  it("meneruskan galat backend tanpa fallback mock", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            data: null,
            error: { code: "FORBIDDEN", message: "Akses ditolak." },
          }),
          { status: 403 },
        ),
      ),
    );
    await expect(api.ponds.samples("token", "p1")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("menerima daftar kosong dengan total nol", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelope({ items: [], total: 0 })));
    expect(await api.ponds.samples("token", "p1")).toEqual([]);
  });

  it("menolak halaman pendek sebelum total tercapai", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        envelope({
          items: [
            {
              actor: { id: "u1", full_name: "Pemilik" },
              action: "ubah",
              entity: "pond",
              entity_id: "p1",
              detail: "Mengubah kolam",
              at: "2026-10-24T00:00:00Z",
            },
          ],
          total: 101,
        }),
      ),
    );
    await expect(api.activity.list("token", "f1")).rejects.toMatchObject({ code: "PAGINATION_ERROR" });
  });

  it("identitas sampel sama dengan isi berubah tetap ditolak", async () => {
    const item = {
      actor: { id: "u1", full_name: "Pemilik" },
      action: "ubah",
      entity: "pond",
      entity_id: "p1",
      detail: "Mengubah kolam",
      at: "2026-10-24T00:00:00Z",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envelope({ items: [item, item], total: 2 })));
    await expect(api.activity.list("token", "f1")).rejects.toMatchObject({ code: "PAGINATION_ERROR" });
  });

  const envelope = (data: unknown) =>
    new Response(JSON.stringify({ success: true, data, error: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  it("mengambil 25 rekaman dalam 1 panggilan halaman", async () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      sample_id: `s-${i}`,
      sample_code: `CODE-${i}`,
      sampling_date: "2026-10-24",
      cycle_day: 10,
      sdri_result: {
        status: "VALID" as const,
        z_score: -0.5,
        probability_pct: 12.3,
        risk_class: 1,
        risk_level: "AMAN",
        s_qpcr: 1.2,
        s_bio: 1.0,
        s_chem: 0.8,
        model_version: "V1",
        recommendation: "Aman",
      },
    }));

    const fetchMock = vi.fn().mockResolvedValue(envelope({ items, total: 25 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await api.ponds.samples("test-token", "pond-1");
    expect(result).toHaveLength(25);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("per_page")).toBe("100");
  });

  it("mengikuti halaman hingga 101 rekaman secara aman", async () => {
    const makeItem = (i: number) => ({
      sample_id: `s-${i}`,
      sample_code: `CODE-${i}`,
      sampling_date: "2026-10-24",
      cycle_day: 10,
      sdri_result: {
        status: "VALID" as const,
        z_score: -0.5,
        probability_pct: 12.3,
        risk_class: 1,
        risk_level: "AMAN",
        s_qpcr: 1.2,
        s_bio: 1.0,
        s_chem: 0.8,
        model_version: "V1",
        recommendation: "Aman",
      },
    });

    const page1 = Array.from({ length: 100 }, (_, i) => makeItem(i));
    const page2 = [makeItem(100)];

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(envelope({ items: page1, total: 101 }))
      .mockResolvedValueOnce(envelope({ items: page2, total: 101 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await api.ponds.samples("test-token", "pond-1");
    expect(result).toHaveLength(101);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const url1 = new URL(fetchMock.mock.calls[0][0]);
    expect(url1.searchParams.get("page")).toBe("1");
    expect(url1.searchParams.get("per_page")).toBe("100");

    const url2 = new URL(fetchMock.mock.calls[1][0]);
    expect(url2.searchParams.get("page")).toBe("2");
    expect(url2.searchParams.get("per_page")).toBe("100");
  });

  it("gagal bila menerima 0 item padahal total lebih besar (zero error)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envelope({ items: [], total: 25 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.ponds.samples("test-token", "pond-1")).rejects.toThrow(ApiError);
  });

  it("gagal bila paginasi tidak mengalami kemajuan / duplikat (no-progress error)", async () => {
    const item = {
      sample_id: "s-1",
      sample_code: "CODE-1",
      sampling_date: "2026-10-24",
      cycle_day: 10,
      sdri_result: {
        status: "VALID" as const,
        z_score: -0.5,
        probability_pct: 12.3,
        risk_class: 1,
        risk_level: "AMAN",
        s_qpcr: 1.2,
        s_bio: 1.0,
        s_chem: 0.8,
        model_version: "V1",
        recommendation: "Aman",
      },
    };

    const firstPage = Array.from({ length: 100 }, (_, i) => ({ ...item, sample_id: `s-${i}` }));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(envelope({ items: firstPage, total: 150 }))
      .mockResolvedValueOnce(envelope({ items: firstPage.slice(0, 50), total: 150 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.ponds.samples("test-token", "pond-1")).rejects.toMatchObject({ code: "PAGINATION_ERROR" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("melempar galat informatif jika total melebihi batas (too-large)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envelope({ items: [], total: 20_000 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.ponds.samples("test-token", "pond-1")).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringMatching(/terlalu besar|batas/i),
      }),
    );
  });

  it("menerapkan paginasi pada semua endpoint backend yang dipaginasi", async () => {
    const fetchMock = vi.fn().mockImplementation(() => envelope({ items: [], total: 0 }));
    vi.stubGlobal("fetch", fetchMock);

    await api.ponds.samples("token", "p1");
    await api.ponds.waterLogs("token", "p1");
    await api.waterLogs.list("token", "f1");
    await api.tasks.mine("token");
    await api.tasks.list("token", "f1");
    await api.activity.list("token", "f1");

    expect(fetchMock).toHaveBeenCalledTimes(6);
    for (const call of fetchMock.mock.calls) {
      const url = new URL(call[0]);
      expect(url.searchParams.get("page")).toBe("1");
      expect(url.searchParams.get("per_page")).toBe("100");
    }
  });
});
