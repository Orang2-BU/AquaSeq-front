import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { api, ApiError, type Farm, type Me } from "@/lib/api";
import { ACCESS_COOKIE, FARM_COOKIE, pickFarm } from "./cookies";

// Data Access Layer sesi. Membaca cookie, jadi panggil di dalam `<Suspense>` atau Server Action (cacheComponents).

/** Access token untuk memanggil backend. Token kedaluwarsa sudah disegarkan proxy. */
async function getAccessToken(): Promise<string> {
  // Panggilan backend selalu per permintaan. Mock tanpa I/O jaringan (Date.now untuk kedaluwarsa token)
  // akan dianggap bisa di-prerender oleh validasi cacheComponents tanpa penanda ini.
  await connection();
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/masuk");
  return token;
}

/** 401 dari backend berarti sesi benar-benar habis: hapus cookie lalu kembali ke halaman masuk. */
export async function withSession<T>(call: (token: string) => Promise<T>): Promise<T> {
  try {
    return await call(await getAccessToken());
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") redirect("/api/sesi/berakhir");
    throw error;
  }
}

export function getCurrentUser(): Promise<Me> {
  return withSession((token) => api.auth.me(token));
}

/** Lokasi aktif (belum diarsipkan), yang diarsipkan, dan lokasi aktif terpilih sesuai cookie. */
export async function getActiveFarms(): Promise<{ farms: Farm[]; archived: Farm[]; current: Farm | undefined }> {
  const [all, preferred] = await Promise.all([
    withSession((token) => api.farms.list(token)),
    cookies().then((jar) => jar.get(FARM_COOKIE)?.value),
  ]);
  const farms = all.filter((f) => !f.archived_at);
  return { farms, archived: all.filter((f) => f.archived_at), current: pickFarm(farms, preferred) };
}
