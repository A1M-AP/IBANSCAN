import { expect, it } from "vitest";
import names from "../data/display-names.json";
import { countries } from "../lib/countries";
import currencies from "../data/currencies.json";
import { locales } from "../lib/i18n";
import { displayName } from "../lib/display-names";
it("every supported country and currency has a deterministic name in every language", () => {
  for (const locale of locales) {
    expect(Object.keys(names[locale].region).sort()).toEqual(
      countries.map((c) => c.code).sort(),
    );
    expect(Object.keys(names[locale].currency).sort()).toEqual(
      currencies.records.map((c) => c.code).sort(),
    );
    for (const code of ["IT", "DE", "GB"])
      expect(displayName(code, locale, "region")).toBeTruthy();
    for (const code of ["EUR", "USD", "GBP"])
      expect(displayName(code, locale, "currency")).toBeTruthy();
  }
  expect(displayName("ZZ", "en", "region", "Unknown")).toBe("Unknown");
});
