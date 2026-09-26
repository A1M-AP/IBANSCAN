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
