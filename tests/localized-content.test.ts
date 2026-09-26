import { describe, expect, it } from "vitest";
import { guides } from "../lib/content";
import { countries, getCountry } from "../lib/countries";
import { countryName } from "../lib/iban-display";
import { getEditorialCopy, interpolate, localizedCountryNotes, localizedGuides } from "../lib/localized-content";

describe("localized editorial coverage", () => {
  it.each(["it", "de", "es", "fr"] as const)("serves seven substantive %s guides while preserving source URLs and tool destinations", locale => {
    const translations = localizedGuides(locale);
    expect(translations).toHaveLength(guides.length);
    for (const original of guides) {
      const translated = translations.find(guide => guide.slug === original.slug)!;
      expect(translated.title).not.toBe(original.title);
      expect(translated.description).not.toBe(original.description);
      expect(translated.sections).toHaveLength(original.slug === "what-is-sepa" ? 3 : 2);
      expect(translated.sections.flatMap(section => section.paragraphs).join(" ").length).toBeGreaterThan(500);
      expect(translated.faqs).toHaveLength(2);
      expect(translated.sources.map(source => source.url)).toEqual(original.sources.map(source => source.url));
      expect(translated.tool.href).toBe(original.tool.href);
    }
    expect(interpolate(getEditorialCopy(locale).ibanTitle, { country: "Italia" })).not.toMatch(/\{\w+\}/);
  });

  it.each(["it", "de", "es", "fr"] as const)("provides %s notes for every country without English fallback or unreplaced template variables", locale => {
    for (const country of countries) {
      const notes = localizedCountryNotes(country, locale, countryName(country.code, locale, country.name));
      expect(notes).not.toBe(country.notes);
      expect(notes).not.toMatch(/\{\w+\}/);
      expect(notes.length).toBeGreaterThan(60);
    }
  });

  it("retains important country-specific caveats rather than replacing them with generic text", () => {
    const france = getCountry("FR")!;
    for (const locale of ["it", "de", "es", "fr"] as const) {
      const notes = localizedCountryNotes(france, locale, france.name);
      expect(notes).toContain("RIB");
      expect(notes).toContain("SEPA");
      expect(localizedCountryNotes(getCountry("IT")!, locale, "Italy")).toContain("CIN");
      expect(localizedCountryNotes(getCountry("DE")!, locale, "Germany")).toContain("Bankleitzahl");
    }
  });

  it("preserves the original English guide editions", () => {
    expect(localizedGuides("en")).toEqual(guides);
    expect(localizedCountryNotes(getCountry("BR")!, "en", "Brazil")).toBe(getCountry("BR")!.notes);
  });
});
