import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias "@/" sama dengan tsconfig.json.
export default defineConfig({
  test: { exclude: ["tests/live/**", "**/node_modules/**", "**/.git/**"] },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
