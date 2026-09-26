import { describe, expect, it } from "vitest";
import { analyzeIban, formatIban, generateIban, mod97, normalizeIban } from "../lib/iban";
import { countries, getCountry } from "../lib/countries";
import { bankRecords, createBankDataProvider, lookupBank, searchBanks } from "../lib/banks";

const italian = "IT60X0542811101000000123456";

describe("IBAN registry conformance", () => {
  it("contains all 89 formats in SWIFT release 103, with unique country codes and URLs", () => {
    expect(countries).toHaveLength(89);
    expect(new Set(countries.map((country) => country.code)).size).toBe(89);
    expect(new Set(countries.map((country) => country.slug)).size).toBe(89);
  });

  it.each(countries)("validates the official $code example and regenerates its international check digits", (country) => {
    const result = analyzeIban(country.example);
    expect(result.valid, JSON.stringify(result.errors)).toBe(true);
    expect(result.country?.code).toBe(country.code);
    expect(result.normalized).toHaveLength(country.length);
    expect(generateIban(country.code, country.example.slice(4))).toBe(country.example);
    expect(result.bankIdentifier).toHaveLength(country.bank!.length);
  });

  it.each(countries)("rejects a one-digit checksum change for $code", (country) => {
    const example = country.example;
    const bad = example.slice(0, 3) + ((Number(example[3]) + 1) % 10) + example.slice(4);
    expect(analyzeIban(bad).valid).toBe(false);
    expect(analyzeIban(bad).checks.find((check) => check.id === "checksum")?.passed).toBe(false);
  });

  it("supports the alphanumeric Brazilian bank identifier introduced in release 103", () => {
    const result = analyzeIban("BR6699999A03000010009795493C1");
    expect(result.valid).toBe(true);
    expect(result.bankIdentifier).toBe("99999A03");
    expect(result.branchIdentifier).toBe("00001");
  });

  it("bounds every mapped bank, branch and account segment to the BBAN", () => {
    for (const country of countries) {
      for (const field of [country.bank, country.branch, country.account]) {
        if (!field) continue;
        expect(field.start).toBeGreaterThanOrEqual(0);
        expect(field.length).toBeGreaterThan(0);
        expect(field.start + field.length).toBeLessThanOrEqual(country.length - 4);
      }
    }
  });
});

describe("normalization and extraction", () => {
  it("accepts lowercase, pasted line breaks and nonbreaking whitespace", () => {
    const result = analyzeIban("  it60\u00a0x054 2811\n1010 0000\t0123 456  ");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe(italian);
    expect(result.formatted).toBe("IT60 X054 2811 1010 0000 0123 456");
    expect(result.bankIdentifier).toBe("05428");
    expect(result.branchIdentifier).toBe("11101");
    expect(result.accountIdentifier).toBe("000000123456");
    expect(result.bban).toBe("X0542811101000000123456");
    expect(result.masked).not.toContain(result.accountIdentifier);
    expect(result.bank).toBeNull();
  });

  it("normalizes without deleting punctuation or converting Unicode look-alikes", () => {
    expect(normalizeIban("it60-x054")).toBe("IT60-X054");
    expect(normalizeIban("ſa03")).toBe("ſA03");
    expect(formatIban(italian)).toBe("IT60 X054 2811 1010 0000 0123 456");
    expect(formatIban("")).toBe("");
  });

  it("finds countries by code and stable readable slug", () => {
    expect(getCountry("it")?.slug).toBe("italy");
    expect(getCountry("united-kingdom")?.code).toBe("GB");
    expect(getCountry("unknown")).toBeUndefined();
  });

  it("preserves leading zeroes and extracts sort code/account separately", () => {
    const result = analyzeIban("GB29NWBK60161331926819");
    expect(result.bankIdentifier).toBe("NWBK");
    expect(result.branchIdentifier).toBe("601613");
    expect(result.accountIdentifier).toBe("31926819");
    expect(result.bank?.bic).toBe("NWBKGB2L");
  });

  it("does not expose an Icelandic national identifier as an account number", () => {
    const result = analyzeIban(getCountry("IS")!.example);
    expect(result.valid).toBe(true);
    expect(result.accountIdentifier).toBeNull();
  });
});

describe("invalid inputs and checksum boundaries", () => {
  it.each(["", " ", "123", "ZZ60X0542811101000000123456", "US12345678901234567890", "IT60-X0542811101000000123456", "IT60X054281110100000012345", "IT60X05428111010000001234567", "IT60X05428<script>", "IT６０X0542811101000000123456", "IT60X05428\u200b11101000000123456"])("rejects malformed input %s", (input) => {
    expect(analyzeIban(input).valid).toBe(false);
    expect(analyzeIban(input).errors.length).toBeGreaterThan(0);
  });

  it("rejects a correctly checksummed value with an invalid national structure", () => {
    const bban = "A" + getCountry("DE")!.example.slice(5);
    const checkDigits = String(98 - mod97(bban + "DE00")).padStart(2, "0");
    const result = analyzeIban("DE" + checkDigits + bban);
    expect(result.checks.find((check) => check.id === "checksum")?.passed).toBe(true);
    expect(result.checks.find((check) => check.id === "structure")?.passed).toBe(false);
    expect(result.valid).toBe(false);
    expect(result.bankIdentifier).toBeNull();
  });

  it.each(["00", "01", "99"])("rejects out-of-range check digits %s, including MOD-97 collisions", (digits) => {
    let collision = "";
    for (let i = 0; i < 1000; i++) {
      const candidate = "DE" + digits + "37040044" + String(i).padStart(10, "0");
      if (mod97(candidate.slice(4) + candidate.slice(0, 4)) === 1) { collision = candidate; break; }
    }
    expect(collision).not.toBe("");
    expect(analyzeIban(collision).valid).toBe(false);
  });

  it("never validates a truncated oversized input or echoes it into errors", () => {
    const input = italian + " ".repeat(1000);
    const result = analyzeIban(input);
    expect(result.valid).toBe(false);
    expect(result.normalized).toBe("");
    expect(JSON.stringify(result.errors)).not.toContain(italian);
    expect(analyzeIban(null as unknown as string).valid).toBe(false);
  });

  it("keeps full IBAN and account segments out of diagnostic messages", () => {
    const result = analyzeIban(italian.slice(0, -1) + "7");
    expect(JSON.stringify(result.checks)).not.toContain(result.normalized);
    expect(JSON.stringify(result.checks)).not.toContain("000000123457");
  });

  it("computes long MOD-97 values without numerical precision loss", () => {
    for (const country of countries) {
      const rearranged = country.example.slice(4) + country.example.slice(0, 4);
      const numeric = rearranged.replace(/[A-Z]/g, (character) => String(character.charCodeAt(0) - 55));
      expect(mod97(rearranged)).toBe(Number(BigInt(numeric) % 97n));
    }
    expect(Number.isNaN(mod97("12?3"))).toBe(true);
    expect(Number.isNaN(mod97("1".repeat(129)))).toBe(true);
  });
});

describe("scope and bank data", () => {
  it("uses current EPC SEPA geographic coverage without claiming bank participation", () => {
    for (const code of ["AL", "ME", "MK", "MD", "RS", "GI", "GB"]) {
      expect(getCountry(code)?.sepa).toBe(true);
    }
    expect(getCountry("US")).toBeUndefined();
    expect(getCountry("TR")?.sepa).toBe(false);
    expect(analyzeIban("ZZ12345").sepa).toBeNull();
    expect(getCountry("FR")?.notes).toContain("some are outside SEPA");
  });

  it("resolves only documented mappings and supplies their provenance", () => {
    const result = analyzeIban("NL91ABNA0417164300");
    expect(result.bank?.name).toBe("ABN AMRO Bank N.V.");
    expect(result.bank?.source).toContain("abnamro.nl");
    expect(result.bank?.verifiedAt).toBe("2026-09-20");
    expect(lookupBank("NL", "ZZZZ")).toBeNull();
    expect(searchBanks("ABNA", "GB")).toEqual([]);
    expect(searchBanks("ABNANL2A", "NL")).toHaveLength(1);
    expect(searchBanks("x")).toEqual([]);
    expect(analyzeIban("NL90ABNA0417164300").bank).toBeNull();
  });

  it("fails closed for conflicting or malformed dataset records", () => {
    const duplicate = createBankDataProvider([bankRecords[0], bankRecords[0]]);
    expect(duplicate.lookup("NL", "ABNA")).toBeNull();
    const bad = createBankDataProvider([{ ...bankRecords[0], bic: "FABRICATED" }]);
    expect(bad.lookup("NL", "ABNA")).toBeNull();
  });
});

describe("generation", () => {
  it("requires a supplied national BBAN and calculates only international digits", () => {
    expect(generateIban("IT", "x05428 11101 000000123456")).toBe(italian);
    expect(() => generateIban("US", "123")).toThrow("not currently supported");
    expect(() => generateIban("IT", "123")).toThrow("23-character");
    expect(() => generateIban("DE", "A70400440532013000")).toThrow();
    expect(() => generateIban("DE", " ".repeat(257))).toThrow();
  });

  it("does not present an unimplemented domestic checksum as a checked result", () => {
    // A structurally admissible CIN is not itself validated by MOD-97.
    const result = analyzeIban(generateIban("IT", "A0542811101000000123456"));
    expect(result.checks.map((check) => check.id)).not.toContain("domestic-checksum");
    expect(result.checks.find((check) => check.id === "checksum")?.message).toContain("international");
  });
});
