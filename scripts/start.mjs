import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const entry = resolve(".next/standalone/server.js");
if (!existsSync(entry)) { process.stderr.write("Run npm run build before starting the production server.\n"); process.exit(1); }
const child = spawn(process.execPath, [entry], { stdio: "inherit", env: { ...process.env, NODE_ENV: "production", HOSTNAME: process.env.HOSTNAME || "0.0.0.0" } });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
