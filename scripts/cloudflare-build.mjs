import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stage = join(root, ".local", "cloudflare-build");

// OpenNext embeds ALL .env files, including development/test secrets. Never
// compile in the user's working tree: copy only application source to a clean
// directory. This also leaves the local launcher and its .next build untouched.
function removeBuildDirectory(path) {
  const target = resolve(path);
  if (![stage, join(root, ".open-next")].includes(target) || !target.startsWith(root + sep)) {
    throw new Error("Refusing to remove a directory outside the build outputs.");
  }
  try {
    rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
  } catch {
    throw new Error("Cannot clear the build output. Stop cf:preview or cf:test before rebuilding.");
  }
}

function safeSource(path) {
  const name = path.split(/[\\/]/).at(-1);
  return !name.startsWith(".env") && !name.startsWith(".dev.vars") &&
    !/\.(pem|key|p12|pfx|log)$/i.test(name);
}

// Inherit OS tooling only. Server credentials are supplied to Workers at runtime,
// never to Next.js or dependency lifecycle scripts during this build.
const allowed = /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|TMPDIR|HOME|USERPROFILE|APPDATA|LOCALAPPDATA|PROGRAMFILES|PROGRAMFILES\(X86\)|SYSTEMDRIVE|CI)$/i;
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.test(key)));
env.NEXT_TELEMETRY_DISABLED = "1";
env.WRANGLER_SEND_METRICS = "false";
env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ibanscan.com";
for (const name of ['NEXT_PUBLIC_CONTACT_EMAIL','NEXT_PUBLIC_OPERATOR_NAME','NEXT_PUBLIC_OPERATOR_ADDRESS','NEXT_PUBLIC_OPERATOR_VAT_ID','NEXT_PUBLIC_OPERATOR_PEC','NEXT_PUBLIC_HOSTING_PROVIDER','NEXT_PUBLIC_ADSENSE_CLIENT','NEXT_PUBLIC_ADSENSE_HOME_SLOT','NEXT_PUBLIC_ADSENSE_TOOL_SLOT','NEXT_PUBLIC_ADSENSE_RESOURCE_SLOT','NEXT_PUBLIC_GOOGLE_CMP_URL']) if(process.env[name])env[name]=process.env[name];

const npmCli = process.env.npm_execpath;
if (!npmCli || !existsSync(npmCli)) throw new Error("Run this script using npm run cf:build.");
function run(args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd: stage, env, stdio: "inherit" });
  if (result.error || result.status !== 0) throw new Error("Cloudflare build step failed.");
}

removeBuildDirectory(stage);
// Remove stale deployable output before attempting a new build.
removeBuildDirectory(join(root, ".open-next"));
mkdirSync(stage, { recursive: true });
for (const name of ["app", "components", "data", "lib", "locales", "public", "styles",
  "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "open-next.config.ts", "wrangler.jsonc"]) {
  cpSync(join(root, name), join(stage, name), { recursive: true, filter: safeSource });
}
if (readdirSync(stage).some((name) => name.startsWith(".env") || name.startsWith(".dev.vars"))) {
  throw new Error("Environment files must not be present in the build directory.");
}
console.log("Building Workers from isolated source; local environment files and server secrets are excluded.");
run(["ci", "--no-audit", "--no-fund"]);
run(["exec", "--", "opennextjs-cloudflare", "build"]);
// Include prerendered routes in ASSETS so direct Wrangler deploys are complete.
run(["exec", "--", "opennextjs-cloudflare", "populateCache", "local"]);
const requiredArtifacts = ["worker.js", ".build/open-next.config.edge.mjs", ".build/open-next.config.mjs"];
for (const artifact of requiredArtifacts) {
  if (!existsSync(join(stage, ".open-next", artifact))) {
    throw new Error(`Cloudflare build artifact is missing: ${artifact}`);
  }
}
const compiledEnv = readFileSync(join(stage, ".open-next", "cloudflare", "next-env.mjs"), "utf8");
if (compiledEnv.replace(/export const (production|development|test) = \{\};/g, "").trim()) {
  throw new Error("Refusing to publish a Worker containing embedded environment values.");
}
cpSync(join(stage, ".open-next"), join(root, ".open-next"), { recursive: true });
for (const artifact of requiredArtifacts) {
  if (!existsSync(join(root, ".open-next", artifact))) {
    throw new Error(`Cloudflare deploy artifact was not transferred: ${artifact}`);
  }
}
console.log("Cloudflare build ready in .open-next/. Ready for Workers deployment.");
