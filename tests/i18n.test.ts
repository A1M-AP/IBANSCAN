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
