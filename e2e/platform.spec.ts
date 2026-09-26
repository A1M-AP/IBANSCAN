import { expect, test, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const italian = "IT60X0542811101000000123456";
const italianPrinted = "IT60 X054 2811 1010 0000 0123 456";
const validHeading = "Valid IBAN structure";

test("scanner cannot submit a sensitive IBAN before JavaScript is available", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL || "http://127.0.0.1:3000/");
  const input = page.getByLabel("Enter an IBAN", { exact: true });
  await input.fill(italian);
  await expect(input).not.toHaveAttribute("name");
  await expect(page.getByRole("button", { name: "Scan IBAN", exact: true })).toBeDisabled();
  await input.press("Enter");
  expect(page.url()).not.toContain(italian);
  await context.close();
});

async function scan(page: Page, iban = italian) {
  await page.getByLabel("Enter an IBAN", { exact: true }).fill(iban);
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.getByRole("heading", { name: iban === italian ? validHeading : "Invalid IBAN", exact: true })).toBeVisible();
}

async function noHorizontalScroll(page: Page) {
  const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.content, `Document ${widths.content}px exceeds viewport ${widths.viewport}px`).toBeLessThanOrEqual(widths.viewport);
}

async function screenshot(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(name + ".png");
  await page.screenshot({ path, fullPage: true, animations: "disabled" });
  await info.attach(name, { path, contentType: "image/png" });
  const viewportPath = info.outputPath(name + "-viewport.png");
  await page.screenshot({ path: viewportPath, animations: "disabled" });
  await info.attach(name + "-viewport", { path: viewportPath, contentType: "image/png" });
}

async function accessible(page: Page) {
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(audit.violations.map(({ id, impact, nodes }) => ({ id, impact, elements: nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
}

test("homepage example, validation errors, reset and private browser processing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Your money tools/ })).toBeVisible();
  const requests: { url: string; body: string }[] = [];
  page.on("request", (request) => requests.push({ url: request.url(), body: request.postData() || "" }));
  await page.getByRole("button", { name: /Italy/ }).click();
  await expect(page.getByLabel("Enter an IBAN", { exact: true })).toHaveValue(italianPrinted);
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.getByRole("heading", { name: validHeading, exact: true })).toBeVisible();
  await expect(page.getByText("Bank information unavailable", { exact: true })).toBeVisible();
  await expect(page.getByText("05428", { exact: true })).toBeVisible();
  await expect(page.getByText("11101", { exact: true })).toBeVisible();
  await scan(page, "IT61X0542811101000000123456");
  await expect(page.getByText(/international check digits are incorrect/).first()).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Enter an IBAN", { exact: true })).toBeEmpty();
  await expect(page.getByRole("heading", { name: "Invalid IBAN", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Scan IBAN", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Enter an IBAN to continue.");
  expect(page.url()).not.toContain("iban=");
  for (const request of requests) {
    expect(request.url).not.toContain(italian);
    expect(request.url).not.toContain("IT61X054");
    expect(request.body).not.toContain(italian);
  }
});

test("a shared fragment is consumed locally and requires explicit share action", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/results#iban=" + italian);
  await expect(page.getByRole("heading", { name: validHeading, exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/results$/);
  expect(requests.every((url) => !url.includes(italian))).toBe(true);
  await page.getByRole("button", { name: "Share result", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Anyone with the link can read it");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("retired features are absent and cannot contact providers",async({page,request})=>{await page.goto('/');await scan(page);await expect(page.locator('.ai-assistant')).toHaveCount(0);await expect(page.locator('header a[href="/api"],header a[href="/ai"]')).toHaveCount(0);expect((await request.post('/api/ai',{data:{}})).status()).toBe(410);await page.goto('/ai');await expect(page).toHaveURL(/\/tools$/)});

test("theme preference persists and both themes pass accessible contrast checks", async ({ page }, info) => {
  await page.goto("/");
  await accessible(page);
  await page.getByRole("button", { name: "Toggle color theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await accessible(page);
  await screenshot(page, info, "desktop-dark-home");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await scan(page);
  await accessible(page);
  await screenshot(page, info, "desktop-dark-result");
  await page.getByRole("button", { name: "Toggle color theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const width of [375, 390, 768, 1440]) {
  test(`scanner fits ${width}px viewport before and after validation`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width >= 768 ? 1000 : 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noHorizontalScroll(page);
    if (width === 375 || width === 1440) await screenshot(page, info, `${width === 375 ? "mobile" : "desktop"}-home`);
    await scan(page);
    await noHorizontalScroll(page);
    if (width === 375 || width === 1440) {
      await accessible(page);
      await screenshot(page, info, `${width === 375 ? "mobile" : "desktop"}-result`);
    }
  });
}

test("mobile navigation is keyboard accessible and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation", exact: true })).toHaveAttribute("aria-expanded", "true");
  await accessible(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toHaveCount(0);
});

test("formatter preserves the electronic IBAN and adds print grouping", async ({ page }) => {
  await page.goto("/tools/iban-formatter");
  await page.getByLabel("IBAN to format", { exact: true }).fill("it60 x054 2811 1010 0000 0123 456");
  await expect(page.getByText(italian, { exact: true })).toBeVisible();
  await expect(page.getByText(italianPrinted, { exact: true })).toBeVisible();
});

test("generator calculates check digits from supplied BBAN and reports malformed input", async ({ page }) => {
  await page.goto("/tools/iban-generator");
  await page.getByLabel("Country", { exact: true }).selectOption("IT");
  await page.getByLabel("Domestic account number (BBAN)", { exact: true }).fill("X0542811101000000123456");
  await page.getByRole("button", { name: "Calculate IBAN", exact: true }).click();
  await expect(page.getByText(italianPrinted, { exact: true })).toBeVisible();
  await page.getByLabel("Domestic account number (BBAN)", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Calculate IBAN", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("23-character");
});

test("bulk validation exports actual statuses and clears the batch", async ({ page }, info) => {
  await page.goto("/tools/bulk-iban-validator");
  await page.getByLabel("Paste IBANs", { exact: true }).fill(italian + "\nIT61X0542811101000000123456\nNL91ABNA0417164300");
  await page.getByRole("button", { name: "Validate batch", exact: true }).click();
  const table = page.getByRole("table");
  await expect(table).toContainText("ABN AMRO");
  await expect(table.getByRole("row")).toHaveCount(4);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloaded;
  const file = info.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  const csv = await readFile(file, "utf8");
  expect(csv).toContain(italian);
  expect(csv).toContain("IT61X0542811101000000123456");
  expect(csv).toContain("ABNANL2A");
  expect(csv.toLowerCase()).toContain("invalid");
  await page.getByRole("button", { name: "Clear batch", exact: true }).click();
  await expect(page.getByLabel("Paste IBANs", { exact: true })).toBeEmpty();
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("CSV upload handles a real file locally", async ({ page }) => {
  await page.goto("/tools/csv-iban-validator");
  const requests: string[] = [];
  page.on("request", (request) => requests.push((request.postData() || "") + request.url()));
  await page.locator('input[type="file"]').setInputFiles({ name: "reference-examples.csv", mimeType: "text/csv", buffer: Buffer.from("IBAN,Reference\n" + italian + ",example\nNL91ABNA0417164300,example\n") });
  await expect(page.getByLabel("Paste IBANs", { exact: true })).toHaveValue(new RegExp(italian));
  await page.getByRole("button", { name: "Validate batch", exact: true }).click();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(3);
  expect(requests.every((request) => !request.includes(italian))).toBe(true);
});

test("country and guide pages expose useful content and canonical metadata", async ({ page }) => {
  for (const path of ["/countries", "/countries/italy", "/iban/germany", "/resources", "/resources/what-is-an-iban", "/data-sources", "/tools/currency-codes"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), path).toBeVisible();
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute("href", new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
    await expect(page.locator('meta[name="description"]'), path).toHaveAttribute("content", /\S.{30,}/);
  }
});

test("public API fails closed without valid credentials", async ({ request }) => {
  for (const endpoint of ["validate", "analyze"]) {
    const response = await request.post("/api/v1/iban/" + endpoint, { data: { iban: italian } });
    expect(response.status()).toBe(410);
    expect(await response.text()).not.toContain(italian);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  const search = await request.get("/api/v1/bank/search?q=ABNA");
  expect(search.status()).toBe(410);
});

test("SEO endpoints list public tools and security headers protect the site", async ({ request }) => {
  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["referrer-policy"]).toBe("no-referrer");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("/tools/iban-validator</loc>");
  expect(xml).toContain("/countries/italy</loc>");
  expect(xml).toContain("/iban/germany</loc>");
  expect(xml).not.toContain("/results</loc>");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Disallow: /api/v1/");
});
