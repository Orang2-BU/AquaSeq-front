import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Area aplikasi berisi data tambak pengguna: jangan diindeks.
const PRIVATE = [
  "/api/",
  "/app",
  "/dasbor",
  "/kolam",
  "/sampel",
  "/lab",
  "/peringatan",
  "/tugas",
  "/tim",
  "/lokasi",
  "/teknisi",
  "/undangan",
];

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: PRIVATE }, sitemap: `${SITE_URL}/sitemap.xml` };
}
