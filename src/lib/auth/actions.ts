"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api, type AuthResult, type Role } from "@/lib/api";
import { fieldErrorsOf, messageOf, valuesOf, type FormState } from "@/lib/forms";
import { REFRESH_COOKIE, clearSession, homeFor, roleOf, safeNext, writeSession } from "./cookies";

const email = z
  .email("Format email belum benar.")
  .max(254)
  .transform((v) => v.toLowerCase());

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Isi sandi.").max(200),
  next: z.string().optional(),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(3, "Nama minimal 3 huruf.").max(80, "Nama maksimal 80 huruf."),
  email,
  password: z.string().min(8, "Sandi minimal 8 karakter.").max(200),
});

/** Simpan sesi lalu arahkan ke tujuan (`next` yang aman) atau beranda sesuai peran. */
async function startSession(result: AuthResult, next?: string): Promise<never> {
  const me = await api.auth.me(result.access_token);
  writeSession(await cookies(), result, roleOf(me));
  redirect(safeNext(next) ?? homeFor(me));
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const values = valuesOf(formData, ["email"]);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  let result: AuthResult;
  try {
    result = await api.auth.login({ email: parsed.data.email, password: parsed.data.password });
  } catch (error) {
    return { ...messageOf(error), values };
  }
  return startSession(result, parsed.data.next);
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  const values = valuesOf(formData, ["full_name", "email"]);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  let result: AuthResult;
  try {
    result = await api.auth.register(parsed.data);
  } catch (error) {
    return { ...messageOf(error), values };
  }
  return startSession(result);
}

const acceptSchema = registerSchema.omit({ email: true }).extend({ token: z.string().min(1).max(200) });

/** P11: teknisi membuat akun dari undangan, lalu langsung masuk. */
export async function acceptInvitation(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = acceptSchema.safeParse(Object.fromEntries(formData));
  const values = valuesOf(formData, ["full_name"]);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error), values };
  const { token, ...body } = parsed.data;
  let result: AuthResult;
  try {
    result = await api.invitations.accept(token, body);
  } catch (error) {
    return { ...messageOf(error), values };
  }
  return startSession(result);
}

export async function demoLogin(_: FormState, formData: FormData): Promise<FormState> {
  const role = z.enum(["pemilik", "teknisi"]).safeParse(formData.get("role"));
  if (!role.success) return { error: "Pilih akun demo." };
  let result: AuthResult;
  try {
    result = await api.auth.demo(role.data satisfies Role);
  } catch (error) {
    return messageOf(error);
  }
  return startSession(result);
}

export async function logout() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  // Keluar tetap berhasil di sisi web walau backend gagal mencabut token.
  if (refreshToken) await api.auth.logout(refreshToken).catch(() => {});
  clearSession(jar);
  redirect("/masuk");
}
