import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getUi } from "../lib/i18n";
import { getEditorialCopy, interpolate, localizedGuides } from "../lib/localized-content";
import { countryName } from "../lib/iban-display";
import { apiCopy } from "../lib/api-copy";

for (const locale of ["it", "de", "es", "fr"] as const) {
  test(`${locale}: language selection persists, translates validation and keeps IBAN local`, async ({ page, context }) => {
    const ui=getUi(locale);
    await page.goto("/ai");
    await page.locator(".language-select").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang",locale);
    await expect(page.getByRole("heading",{level:1})).toHaveText(ui.ai.pageTitle);
    await page.reload();
    await expect(page.locator(".language-select")).toHaveValue(locale);
    expect((await context.cookies()).find(c=>c.name==="ibanscan-locale")?.sameSite).toBe("Lax");
    const requests: string[]=[];
    page.on("request",r=>requests.push(r.url()+(r.postData()||"")));
    await page.getByLabel(ui.scanner.label,{exact:true}).fill("NL91ABNA0417164300");
    await page.getByRole("button",{name:ui.scanner.submit,exact:true}).click();
    await expect(page.getByRole("heading",{name:ui.scanner.success,exact:true})).toBeVisible();
    await expect(page.locator(".bank-profile")).toContainText("ABN AMRO");
    await expect(page.locator(".bank-profile")).toContainText(ui.bankDetails.headquarters);
    await expect(page.locator(".bank-profile address")).not.toBeEmpty();
    await expect(page.locator(".bank-profile").getByRole("link",{name:ui.bankDetails.website,exact:true})).toHaveAttribute("href",/^https:\/\//);
    await page.getByLabel(ui.scanner.label,{exact:true}).fill("IT61X0542811101000000123456");
    await page.getByRole("button",{name:ui.scanner.submit,exact:true}).click();
    await expect(page.getByRole("heading",{name:ui.scanner.failure,exact:true})).toBeVisible();
    expect(await page.locator(".check-list").innerText()).not.toContain("international check digits are incorrect");
    expect(requests.join(" ")).not.toContain("0417164300");
    expect(requests.join(" ")).not.toContain("IT61X054");
    await page.goto("/tools/iban-formatter");
    await expect(page.getByLabel(ui.tools.formatterLabel)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang",locale);
  });
}

test("all five languages fit mobile and desktop with a neutral accessible theme", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.goto("/");
  for(const width of [375,768,1092,1440]){
    await page.setViewportSize({width,height:900});
    for(const locale of ["en","it","de","es","fr"] as const){
      await page.locator(".language-select").selectOption(locale);
      await expect(page.locator("html")).toHaveAttribute("lang",locale);
      await expect(page.getByRole("heading",{level:1})).toContainText(getUi(locale).hero.accent);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
  await page.locator(".language-select").selectOption("it");
  await expect(page.locator("html")).toHaveAttribute("lang","it");
  const ui=getUi("it");
  await page.getByRole("button",{name:ui.nav.theme}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  expect(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe("rgb(17, 17, 19)");
  const audit=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({path:info.outputPath("italian-dark-desktop.png"),fullPage:false});
  await page.setViewportSize({width:375,height:812});
  await page.screenshot({path:info.outputPath("italian-dark-mobile.png"),fullPage:false});
});

test("AI passes the selected locale only after consent",async({page})=>{
  const ui=getUi("it");
  await page.goto("/ai");await page.locator(".language-select").selectOption("it");
  await expect(page.locator("html")).toHaveAttribute("lang","it");
  await page.getByLabel(ui.scanner.label,{exact:true}).fill("IT60X0542811101000000123456");
  await page.getByRole("button",{name:ui.scanner.submit,exact:true}).click();
  await expect(page.getByRole("heading",{name:ui.scanner.success,exact:true})).toBeVisible();
  let calls=0;
  await page.route("**/api/ai",async route=>{calls++;expect(route.request().postDataJSON().locale).toBe("it");await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"IBANScan AI non è ancora configurato."})});});
  await page.getByRole("button",{name:ui.ai.submit,exact:true}).click();expect(calls).toBe(0);
  await page.getByRole("checkbox").check();await page.getByRole("button",{name:ui.ai.submit,exact:true}).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("non è ancora configurato");expect(calls).toBe(1);
});

test("translated guides, country pages and API explanations survive navigation and reload", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  for(const locale of ["it","de","es","fr"] as const){
    await page.locator(".language-select").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang",locale);
    const c=getEditorialCopy(locale);
    const country=countryName("IT",locale);
    const routes=[
      ["/countries/italy",interpolate(c.bankingTitle,{country})],
      ["/iban/italy",interpolate(c.ibanTitle,{country})],
      ["/resources/what-is-an-iban",localizedGuides(locale)[0].title],
      ["/api",apiCopy[locale].title],
      ["/about",c.aboutTitle],
      ["/contact",c.contactTitle],
    ];
    for(const [route,title] of routes){
      await page.goto(route);
      await expect(page.getByRole("heading",{level:1})).toContainText(title);
      await expect(page.locator("html")).toHaveAttribute("lang",locale);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await page.reload();await expect(page.locator(".language-select")).toHaveValue(locale);
  }
});

test("language switch preserves the scan but resets AI consent and language-specific text",async({page})=>{
  await page.goto("/");
  await page.getByLabel("Enter an IBAN",{exact:true}).fill("NL91ABNA0417164300");
  await page.getByRole("button",{name:"Scan IBAN",exact:true}).click();
  await expect(page.locator(".ai-assistant")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.locator(".language-select").selectOption("it");
  await expect(page.locator("html")).toHaveAttribute("lang","it");
  const ui=getUi("it");
  await expect(page.getByRole("heading",{name:ui.scanner.success,exact:true})).toBeVisible();
  await expect(page.getByLabel(ui.ai.questionLabel,{exact:true})).toHaveValue(ui.ai.suggestions[0]);
  await expect(page.getByRole("checkbox")).not.toBeChecked();
});
