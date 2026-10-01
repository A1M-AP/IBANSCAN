import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { calculateItalianIban } from "../lib/iban-calculator";
test("calculator produces a valid IBAN and verified bank and branch information", async ({
  page,
}) => {
  await page.goto("/tools/iban-calculator");
  await page.getByLabel("ABI · bank code").fill("02008");
  await page.getByLabel("CAB · branch code").fill("21703");
  await page.getByLabel("Account number", { exact: true }).fill("000000000001");
  await page
    .getByRole("button", { name: "Calculate IBAN", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Valid IBAN structure", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".bank-profile")).toContainText(
    "VIALE CESARE BATTISTI, 39",
  );
  await expect(page.locator(".bank-profile")).toContainText(
    "reclami@pec.unicredit.eu",
  );
  await expect(page.locator(".bank-profile")).toContainText(
    "SEPA Instant Credit Transfer",
  );
  await expect(page.locator(".result-iban")).toContainText(
    calculateItalianIban("02008", "21703", "1")
      .match(/.{1,4}/g)!
      .join(" "),
  );
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
});
test("BIC search uses the full directory", async ({ page }) => {
  await page.goto("/tools/bic-swift-finder");
  await page.getByLabel("Search by bank name, BIC or ABI").fill("UNCRITMM");
  await page.getByRole("button", { name: "Find bank", exact: true }).click();
  await expect(page.locator(".bank-search-results")).toContainText(
    /unicredit/i,
  );
});
test("currency conversion and reference date are visible, with honest network failure", async ({
  page,
}) => {
  await page.route("**/api/rates", (r) =>
    r.fulfill({
      json: {
        base: "EUR",
        date: "2026-09-25",
        rates: { EUR: 1, USD: 1.25, GBP: 0.8 },
        source: "https://www.ecb.europa.eu/",
      },
    }),
  );
  await page.goto("/tools/currency-converter");
  await expect(page.locator(".fx-output strong")).toContainText("125.00");
  await page.getByLabel("Amount", { exact: true }).fill("12,50");
  await expect(page.locator(".fx-output strong")).toContainText("15.63");
  await page.getByRole("button", { name: "Swap currencies" }).click();
  await expect(page.locator(".fx-output strong")).toContainText("10.00");
  await expect(page.locator(".source-note")).toContainText("2026-09-25");
  await page.unroute("**/api/rates");
  await page.route("**/api/rates", (r) =>
    r.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await page.reload();
  await expect(page.getByRole("status")).toContainText(
    "temporarily unavailable",
  );
});
test("new design stays readable and has no ads before configuration or consent", async ({
  page,
}, info) => {
  const thirdParty: string[] = [];
  page.on("request", (r) => {
    if (/googlesyndication|doubleclick|generativelanguage/.test(r.url()))
      thirdParty.push(r.url());
  });
  for (const width of [390, 768, 1092, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator(".hero-description")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(19);
    await expect(page.locator(".ad-slot")).toHaveCount(0);
    await page.screenshot({
      path: info.outputPath("home-" + width + ".png"),
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(thirdParty).toEqual([]);
  await expect(page.locator("footer")).toContainText("MAP Technologies");
});
