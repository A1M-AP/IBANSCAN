import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
// Next's standalone server needs these assets alongside the traced application.
const output = resolve(".next/standalone");
if (!existsSync(output)) throw new Error("Build the Next.js application before preparing standalone assets.");
cpSync(resolve("public"), resolve(output, "public"), { recursive: true });
cpSync(resolve(".next/static"), resolve(output, ".next/static"), { recursive: true });
