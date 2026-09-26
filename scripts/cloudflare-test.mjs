import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, ".local"), { recursive: true });
// Explicit env file prevents Wrangler from loading the developer's .env/.dev.vars.
writeFileSync(join(root, ".local", "cloudflare-test.vars"), "APP_URL=http://127.0.0.1:8788\n");
const env = { ...process.env, CLOUDFLARE_INCLUDE_PROCESS_ENV: "false", CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "true", WRANGLER_SEND_METRICS: "false" };
delete env.PLAYWRIGHT_BASE_URL;
const result = spawnSync(process.execPath, [join(root, "node_modules", "@playwright", "test", "cli.js"), "test", "--config=playwright.cloudflare.config.ts"], { cwd: root, env, stdio: "inherit" });
process.exit(result.status ?? 1);
