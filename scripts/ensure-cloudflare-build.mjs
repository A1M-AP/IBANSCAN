// Wrangler runs this before `deploy`, `versions upload` and `dev` (see "build" in wrangler.jsonc).
// Cloudflare Workers Builds uses `npx wrangler versions upload` for non-production branches, which
// would otherwise fail with ".open-next/worker.js was not found". An existing artifact is reused,
// so `npm run cf:deploy`, `cf:preview` and `cf:test` do not build twice.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (existsSync(join(root, ".open-next", "worker.js"))) process.exit(0);
console.log("No OpenNext build found; running npm run cf:build first.");
const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "cf:build"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
