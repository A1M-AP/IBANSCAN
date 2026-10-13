import { expect, test } from "@playwright/test";
import { getUi } from "../lib/i18n";
import { productCopy } from "../locales/product";
for (const locale of ["it", "de", "es", "fr"] as const) {
  test(
    locale + ": selection persists and tools and bank results stay translated",
    async ({ page, context }) => {
      const ui = getUi(locale),
        t = productCopy[locale];
      await page.goto("/");
      await page.locator(".language-select").selectOption(locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        t.title,
      );
      await page.reload();
      await expect(page.locator(".language-select")).toHaveValue(locale);
      expect(
        (await context.cookies()).find((c) => c.name === "ibanscan-locale")
          ?.sameSite,
      ).toBe("Lax");
      const requests: string[] = [];
      page.on("request", (r) => requests.push(r.url() + (r.postData() || "")));
      await page
        .getByLabel(ui.scanner.label, { exact: true })
        .fill("NL91ABNA0417164300");
      await page
        .getByRole("button", { name: ui.scanner.submit, exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: ui.scanner.success, exact: true }),
      ).toBeVisible();
      await expect(page.locator(".bank-profile")).toContainText("ABN AMRO");
      await expect(page.locator(".bank-profile address")).not.toBeEmpty();
      expect(requests.join(" ")).not.toContain("0417164300");
      await page.goto("/tools/iban-calculator");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        t.calculate,
      );
      await page.goto("/tools/currency-codes");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.codes);
      await page.getByLabel(t.searchCurrency).fill("EUR");
      await expect(page.getByRole("table")).toContainText("978");
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    },
  );
}
test("language switch preserves the local scan", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Enter an IBAN", { exact: true })
    .fill("NL91ABNA0417164300");
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Valid IBAN structure", exact: true }),
  ).toBeVisible();
  await page.locator(".language-select").selectOption("it");
  await expect(
    page.getByRole("heading", {
      name: getUi("it").scanner.success,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".ai-assistant")).toHaveCount(0);
});

test("each language has its own indexable URL with hreflang alternates", async ({ page, request }) => {
  await page.goto("/it/tools");
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/it\/tools$/);
  for (const [lang, path] of [["en", "/tools"], ["de", "/de/tools"], ["x-default", "/tools"]])
    await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", new RegExp(path.replace(/\//g, "\\/") + "$"));
  // Internal links keep the visitor in Italian.
  await expect(page.locator('a[href="/it/countries"]').first()).toBeVisible();
  const english = await request.get("/en/tools", { maxRedirects: 0 });
  expect(english.status()).toBe(308);
  expect(english.headers().location).toMatch(/\/tools$/);
  const missing = await request.get("/it/does-not-exist");
  expect(missing.status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/fr/resources/what-is-an-iban</loc>");
  expect(sitemap).toContain('hreflang="es"');
});
test("a German IBAN resolves its bank from the national register", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Enter an IBAN", { exact: true }).fill("DE89370400440532013000");
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.locator(".bank-profile")).toContainText("Commerzbank");
  await expect(page.locator(".bank-profile")).toContainText("COBADEFFXXX");
});
