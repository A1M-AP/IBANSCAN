import { test, expect } from "@playwright/test";
import { toolCatalog } from "../lib/tools";

test("all tool pages render without runtime errors or mobile overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/rates", (r) =>
    r.fulfill({
      json: {
        base: "EUR",
        date: "2026-09-25",
        rates: { EUR: 1, USD: 1.2, GBP: 0.8 },
      },
    }),
  );
  await page.setViewportSize({ width: 375, height: 900 });
  for (const tool of toolCatalog) {
    const response = await page.goto("/tools/" + tool.slug);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      tool.slug,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("currency tools reject malformed responses, recover, and explain invalid amounts", async ({
  page,
}) => {
  let bad = true;
  await page.route("**/api/rates", (r) =>
    r.fulfill({
      json: bad
        ? { base: "EUR", rates: { EUR: 1 } }
        : { base: "EUR", date: "2026-09-25", rates: { EUR: 1, GBP: 0.8 } },
    }),
  );
  await page.goto("/tools/currency-converter");
  await expect(page.getByRole("status")).toContainText(
    "temporarily unavailable",
  );
  bad = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("GBP");
  await expect(page.locator(".fx-output strong")).toContainText("80.00");
  await page.getByLabel("Amount", { exact: true }).fill("-1");
  await expect(page.getByRole("status")).toContainText("Enter an amount");
  await expect(page.getByLabel("Amount", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Amount", { exact: true }).fill("0");
  await expect(page.locator(".fx-output strong")).toContainText("0.00");
  await expect(page.locator("#fx-error")).toHaveCount(0);
});

test("editing a bank query cancels obsolete results and permits a new search", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  let started!: () => void;
  const pending = new Promise<void>((r) => {
    started = r;
  });
  await page.route("**/api/banks?*", async (route) => {
    if (new URL(route.request().url()).searchParams.get("q") === "old bank") {
      started();
      await gate;
      await route
        .fulfill({ json: { banks: [{ name: "Obsolete bank" }] } })
        .catch(() => {});
    } else await route.continue();
  });
  await page.goto("/tools/bic-swift-finder");
  const field = page.getByLabel("Search by bank name, BIC or ABI");
  await field.fill("old bank");
  await page.getByRole("button", { name: "Find bank", exact: true }).click();
  await pending;
  await field.fill("UNCRITMM");
  await page.getByRole("button", { name: "Find bank", exact: true }).click();
  await expect(page.locator(".bank-search-results")).toContainText("UniCredit");
  release();
  await expect(page.getByText("Obsolete bank")).toHaveCount(0);
});

test("shared translated labels hydrate correctly in every language", async ({
  page,
  context,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const language of ["en", "it", "de", "fr", "es"]) {
    await context.addCookies([
      {
        name: "ibanscan-locale",
        value: language,
        url: baseURL || "http://127.0.0.1:3000",
      },
    ]);
    for (const slug of [
      "iban-generator",
      "iban-calculator",
      "currency-codes",
    ]) {
      await page.goto("/tools/" + slug);
      await page.locator("select,input").last().focus();
    }
  }
  expect(errors).toEqual([]);
});
