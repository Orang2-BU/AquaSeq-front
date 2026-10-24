import type { NextConfig } from "next";

// Header keamanan dasar. CSP menyusul: Next butuh nonce untuk skrip inline, dipasang bersama landing (T26).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Laporan tugas teknisi membawa sampai 4 foto × 1 MB (sudah dikompres di HP).
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
