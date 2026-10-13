import { describe, expect, it } from "vitest";
import { getUi, getMessages, isLocale, locales } from "@/lib/i18n";
import { analyzeIban } from "@/lib/iban";
import { localizeResult } from "@/lib/iban-display";
describe("localized validation", () => {
  it.each(locales)("preserves engine facts in %s, including failures and unknown countries", locale => {
    for (const iban of ["IT60X0542811101000000123456", "IT61X0542811101000000123456", "ZZ11", "X".repeat(257)]) {
      const original=analyzeIban(iban);const snapshot=JSON.stringify(original);const display=localizeResult(original,locale);
      expect(JSON.stringify(original)).toBe(snapshot);
      expect(display.valid).toBe(original.valid);
      expect(display.normalized).toBe(original.normalized);
      expect(display.checks.map(c=>[c.id,c.passed])).toEqual(original.checks.map(c=>[c.id,c.passed]));
      expect(display.errors.length).toBe(original.errors.length);
      expect(display.checks.every(c=>c.message.length>0&&!/\{\w+\}/.test(c.message))).toBe(true);
      if(locale!=="en")expect(display.checks[0].message).not.toBe(original.checks[0].message);
    }
  });
  it.each(locales.filter(l=>l!=="en"))("provides translated core and reference copy for %s", locale=>{
    expect(getUi(locale).hero.description).not.toBe(getUi("en").hero.description);
    expect(getUi(locale).bankDetails.contact).not.toBe(getUi("en").bankDetails.contact);
    expect(getMessages(locale).iban.rules[0]).not.toBe(getMessages("en").iban.rules[0]);
  });
  it("falls back safely for untrusted locale values",()=>{
    expect(isLocale("__proto__")).toBe(false);
    expect(getUi("../../config")).toBe(getUi("en"));
  });
});

describe("language URLs", () => {
  it("keeps English unprefixed and prefixes other languages", async () => {
    const { localePath, stripLocale } = await import("@/lib/i18n");
    expect(localePath("en", "/tools")).toBe("/tools");
    expect(localePath("it", "/")).toBe("/it");
    expect(localePath("it", "/tools?x=1#y")).toBe("/it/tools?x=1#y");
    expect(localePath("de", "/#scanner")).toBe("/de#scanner");
    for (const untouched of ["/api/banks", "/favicon.svg", "https://example.com/", "//evil.example", "#top"])
      expect(localePath("fr", untouched)).toBe(untouched);
    expect(stripLocale("/it/tools/iban-calculator")).toBe("/tools/iban-calculator");
    expect(stripLocale("/es")).toBe("/");
    expect(stripLocale("/tools")).toBe("/tools");
    expect(stripLocale("/italy")).toBe("/italy");
  });
  it("publishes canonical and hreflang alternates for every language", async () => {
    const { pageMetadata } = await import("@/lib/seo");
    const meta = pageMetadata("Tools", "d", "/tools", "it");
    expect(meta.alternates?.canonical).toBe("https://ibanscan.com/it/tools");
    expect(meta.alternates?.languages).toEqual({
      en: "https://ibanscan.com/tools",
      it: "https://ibanscan.com/it/tools",
      de: "https://ibanscan.com/de/tools",
      fr: "https://ibanscan.com/fr/tools",
      es: "https://ibanscan.com/es/tools",
      "x-default": "https://ibanscan.com/tools",
    });
    expect(pageMetadata("IBANScan — Home", "d", "/", "en").title).toEqual({ absolute: "IBANScan — Home" });
  });
});
