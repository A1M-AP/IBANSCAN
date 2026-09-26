import { expect, test } from "@playwright/test";
import { readFile, readdir, stat } from "node:fs/promises";

test("Workers artifact has no embedded environment files", async () => {
  for (const artifact of ["worker.js", ".build/open-next.config.edge.mjs", ".build/open-next.config.mjs"]) {
    expect((await stat(`.open-next/${artifact}`)).size).toBeGreaterThan(0);
  }
  const compiled = await readFile(".open-next/cloudflare/next-env.mjs", "utf8");
  expect(compiled.replace(/export const (production|development|test) = \{\};/g, "").trim()).toBe("");
  const assets = await readdir(".open-next/assets/cdn-cgi/_next_cache", { recursive: true });
  for (const route of ["robots.txt.cache", "sitemap.xml.cache", "opengraph-image.cache"]) {
    expect(assets.some((file) => file.endsWith(route))).toBe(true);
  }
});

test("Workers has static SEO assets and fails closed without runtime secrets", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toMatchObject({ validation: "available", bankDirectory: "available" });
  expect(health.headers()["cache-control"]).toContain("no-store");
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toBe("image/png");
  const denied = await request.post("/api/ai", { headers: { Origin: "https://invalid.example" }, data: {} });
  expect(denied.status()).toBe(410);
  const unconfigured = await request.post("/api/ai", { headers: { Origin: "https://ibanscan.test" }, data: {} });
  expect(unconfigured.status()).toBe(410);
});
