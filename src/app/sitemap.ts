import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Hanya halaman publik; aplikasi berlogin tidak diindeks.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/metode", "/kontak", "/privasi", "/masuk", "/daftar"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
