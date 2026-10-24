import { describe, expect, it } from "vitest";
import { mock } from "../mock";

describe("mock auth", () => {
  it("menolak sandi salah dengan pesan generik", async () => {
    await expect(mock.auth.login({ email: "hendra@demo.aquaseq.id", password: "tebakan" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Email atau sandi salah.",
    });
  });

  it("mendaftarkan pemilik baru tanpa lokasi lalu bisa masuk dengan sandinya", async () => {
    const email = `pemilik-${Date.now()}@contoh.id`;
    await mock.auth.register({ full_name: "Siti Aminah", email, password: "kolam-udang-8" });
    const { access_token } = await mock.auth.login({ email, password: "kolam-udang-8" });
    expect((await mock.auth.me(access_token)).memberships).toEqual([]);
  });

  it("menolak email yang sudah terdaftar dengan galat per field", async () => {
    await expect(
      mock.auth.register({ full_name: "Hendra", email: "hendra@demo.aquaseq.id", password: "kolam-udang-8" }),
    ).rejects.toMatchObject({ code: "CONFLICT", fields: { email: expect.any(String) } });
  });

  it("merotasi refresh token: token lama tidak bisa dipakai lagi", async () => {
    const { refresh_token } = await mock.auth.demo("teknisi");
    await mock.auth.refresh(refresh_token);
    await expect(mock.auth.refresh(refresh_token)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("mencabut refresh token saat keluar", async () => {
    const { refresh_token } = await mock.auth.demo("pemilik");
    await mock.auth.logout(refresh_token);
    await expect(mock.auth.refresh(refresh_token)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
