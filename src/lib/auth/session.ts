import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError, type Me } from "@/lib/api";
import { ACCESS_COOKIE } from "./cookies";

/**
 * Pengguna yang sedang masuk. Membaca cookie, jadi panggil di dalam `<Suspense>` (cacheComponents).
 * Token kedaluwarsa sudah disegarkan proxy; di sini 401 berarti sesi benar-benar habis.
 */
export async function getCurrentUser(): Promise<Me> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/masuk");
  try {
    return await api.auth.me(token);
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") redirect("/masuk");
    throw error;
  }
}
