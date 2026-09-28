import { afterEach, expect, it, vi } from "vitest";
import { scannerExamples } from "../lib/scanner-examples";
import { analyzeIban } from "../lib/iban";
import {
  convertCurrency,
  validateExchangeRates,
  ECB_SOURCE,
} from "../lib/exchange-rates";
import { fetchJson } from "../lib/fetch-json";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("each homepage example passes validation and resolves an independently verified bank", () => {
  for (const [code, iban] of Object.entries(scannerExamples)) {
    const result = analyzeIban(iban);
    expect(result.valid).toBe(true);
    expect(result.country?.code).toBe(code);
    expect(result.bank?.name).toBeTruthy();
    expect(result.bank?.bic).toBeTruthy();
  }
});
it("validates the exchange JSON boundary and keeps the fixed official source", () => {
  const good = {
    base: "EUR",
    date: "2026-09-25",
    rates: { EUR: 1, GBP: 0.8 },
    source: "https://invalid.test",
  };
  expect(validateExchangeRates(good).source).toBe(ECB_SOURCE);
  for (const bad of [
    null,
    {},
    { ...good, date: "2026-02-30" },
    { ...good, rates: { EUR: 1 } },
    { ...good, rates: { EUR: 2, GBP: 0.8 } },
    { ...good, rates: { EUR: 1, GBP: NaN } },
    { ...good, rates: { EUR: 1, GBP: "0.8" } },
    { ...good, rates: { EUR: 1, bad: 0.8 } },
  ])
    expect(() => validateExchangeRates(bad)).toThrow();
  expect(() =>
    convertCurrency(10, "EUR", "USD", { EUR: 1, USD: NaN }),
  ).toThrow();
  expect(() =>
    convertCurrency(10, "EUR", "USD", { EUR: 1, USD: Infinity }),
  ).toThrow();
});
it("read-only JSON requests time out instead of leaving the UI loading forever", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_url, { signal }) =>
        new Promise((_, reject) =>
          signal.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    ),
  );
  const outcome = fetchJson("/api/rates").catch((e) => e.message);
  await vi.advanceTimersByTimeAsync(12000);
  expect(await outcome).toBe("aborted");
  expect(vi.getTimerCount()).toBe(0);
});
it("respects cancellation and HTTP failures", async () => {
  const f = vi.fn().mockResolvedValue(new Response("{}", { status: 503 }));
  vi.stubGlobal("fetch", f);
  await expect(fetchJson("/api/rates")).rejects.toThrow("Request unavailable");
  const controller = new AbortController();
  controller.abort();
  f.mockImplementation((_url, { signal }) => {
    expect(signal.aborted).toBe(true);
    return Promise.reject(Error("aborted"));
  });
  await expect(fetchJson("/api/banks", controller.signal)).rejects.toThrow(
    "aborted",
  );
});
