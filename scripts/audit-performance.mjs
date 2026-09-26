import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const url = process.env.AUDIT_URL || "http://127.0.0.1:3001";
const port = 9223;
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
try {
  const result = await lighthouse(url, { port, output: ["json", "html"], logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] });
  if (!result) throw new Error("No audit result returned.");
  mkdirSync("test-results/performance", { recursive: true });
  writeFileSync("test-results/performance/lighthouse.json", result.report[0]);
  writeFileSync("test-results/performance/lighthouse.html", result.report[1]);
  console.log(JSON.stringify({ url, scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])), metrics: Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"].map(key => [key, result.lhr.audits[key].displayValue])), issues: Object.values(result.lhr.audits).filter(a => a.score !== null && a.score < 0.9 && a.details?.type !== "debugdata").map(a => ({ id: a.id, title: a.title, score: a.score, display: a.displayValue })) }, null, 2));
} finally { await browser.close(); }
