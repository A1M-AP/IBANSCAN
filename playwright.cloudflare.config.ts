import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: ["**/*.spec.ts", "**/*.cloudflare.ts"],
  use: { ...base.use, baseURL: "http://127.0.0.1:8788" },
  webServer: {
    command: "node node_modules/wrangler/bin/wrangler.js dev --ip 127.0.0.1 --port 8788 --inspector-port 0 --local --env-file .local/cloudflare-test.vars",
    url: "http://127.0.0.1:8788/api/health",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
