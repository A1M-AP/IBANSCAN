import { test, expect } from "@playwright/test";
import { calculateItalianIban } from "../lib/iban-calculator";

test("bank name survives directory failure and retry loads verified details", async ({
  page,
}) => {
  let failed = true;
  const urls: string[] = [];
  await page.route("**/api/banks?*", (route) => {
    urls.push(route.request().url());
    return failed
      ? route.fulfill({ status: 503, json: { error: "unavailable" } })
      : route.continue();
  });
  await page.goto("/");
  const iban = calculateItalianIban("01030", "00000", "1");
  await page.getByLabel("Enter an IBAN", { exact: true }).fill(iban);
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.locator(".result-highlights")).toContainText(
    "MONTE DEI PASCHI",
  );
  await expect(page.locator(".bank-lookup-status")).toContainText(
    "could not be loaded",
  );
  expect(
    urls.every((url) => !url.includes(iban) && !url.includes("account")),
  ).toBe(true);
  failed = false;
  await page.getByRole("button", { name: "Retry bank lookup" }).click();
  await expect(page.locator(".bank-profile")).toContainText("PIAZZA SALIMBENI");
  await expect(page.locator(".bank-lookup-status")).toHaveCount(0);
});

test("no match is distinguished from a failed request", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Enter an IBAN", { exact: true })
    .fill(calculateItalianIban("99999", "00000", "1"));
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.locator(".bank-lookup-status")).toContainText(
    "No verified bank match",
  );
  await expect(
    page.getByRole("button", { name: "Retry bank lookup" }),
  ).toHaveCount(0);
});

test("each tool has distinct artwork; background animates and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/tools");
  const arts = await page
    .locator(".tool-visual svg")
    .evaluateAll((els) => els.map((el) => el.innerHTML));
  expect(arts).toHaveLength(15);
  expect(new Set(arts).size).toBe(15);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const shape = page.locator(".abstract-background > div").first();
  const before = await shape.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => shape.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(before);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(shape).toHaveCSS("animation-name", "none");
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
