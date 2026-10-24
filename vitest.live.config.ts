import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["tests/live/*.live.test.ts"],
    env: { API_MODE: "live", API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:18080" },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
