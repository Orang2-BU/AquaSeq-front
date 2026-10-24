import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { mock } from "@/lib/api/mock";
import { proxy } from "../proxy";

const visit = (path: string, cookies: Record<string, string> = {}) =>
  proxy(
    new NextRequest(`http://localhost:3000${path}`, {
      headers: {
        cookie: Object.entries(cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join("; "),
      },
    }),
  );

describe("proxy", () => {
  it("mengarahkan tamu dari halaman aplikasi ke masuk dengan tujuan asal", async () => {
    const response = await visit("/kolam/b3?tab=sampel");
    expect(response.headers.get("location")).toBe("http://localhost:3000/masuk?next=%2Fkolam%2Fb3%3Ftab%3Dsampel");
  });

  it("membiarkan halaman publik terbuka untuk tamu", async () => {
    expect((await visit("/metode")).headers.get("location")).toBeNull();
  });

  it("mengarahkan pengguna yang sudah masuk dari halaman masuk ke beranda", async () => {
    const response = await visit("/masuk", { aq_access: "x", aq_role: "pemilik" });
    expect(response.headers.get("location")).toBe("http://localhost:3000/app");
  });

  it("menolak teknisi membuka halaman pemilik, dan sebaliknya", async () => {
    const technician = await visit("/dasbor", { aq_access: "x", aq_role: "teknisi" });
    const owner = await visit("/teknisi", { aq_access: "x", aq_role: "pemilik" });
    expect(technician.headers.get("location")).toBe("http://localhost:3000/akses-ditolak");
    expect(owner.headers.get("location")).toBe("http://localhost:3000/akses-ditolak");
  });

  it("menyegarkan sesi saat access token habis dan menyimpan token baru", async () => {
    const { refresh_token } = await mock.auth.demo("pemilik");
    const response = await visit("/dasbor", { aq_refresh: refresh_token, aq_role: "pemilik" });
    const access = response.cookies.get("aq_access");
    expect(response.headers.get("location")).toBeNull();
    expect(access?.httpOnly).toBe(true);
    expect((await mock.auth.me(access!.value)).full_name).toBe("Hendra Kusuma");
    expect(response.cookies.get("aq_refresh")?.value).not.toBe(refresh_token);
  });

  it("menghapus sesi dan meminta masuk lagi bila refresh token tidak berlaku", async () => {
    const response = await visit("/dasbor", { aq_refresh: "kedaluwarsa", aq_role: "pemilik" });
    expect(response.headers.get("location")).toBe("http://localhost:3000/masuk?next=%2Fdasbor");
    expect(response.cookies.get("aq_refresh")?.value).toBe("");
  });
});

describe("sesi berakhir", () => {
  it("menghapus cookie sesi lalu mengarahkan ke masuk", async () => {
    const { GET } = await import("../app/api/sesi/berakhir/route");
    const response = GET(new NextRequest("http://localhost:3000/api/sesi/berakhir"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/masuk");
    for (const name of ["aq_access", "aq_refresh", "aq_role", "aq_farm"]) {
      expect(response.cookies.get(name)?.value).toBe("");
    }
  });
});
