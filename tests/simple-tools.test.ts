import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateItalianIban } from "@/lib/iban-calculator";
import { analyzeIban } from "@/lib/iban";
import {
  parseEcbRates,
  convertCurrency,
  parseAmount,
} from "@/lib/exchange-rates";
import { schemeState } from "@/lib/bank-directory-types";
import { hasAdConsent, googleCmpUrl } from "@/lib/advertising";
import {
  directoryLookup,
  directorySearch,
  directoryStats,
} from "@/lib/bank-directory";
vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllGlobals());
describe("Italian IBAN calculation", () => {
  it("reproduces the independent SWIFT registry example including national CIN", () => {
    expect(calculateItalianIban("05428", "11101", "123456")).toBe(
      "IT60X0542811101000000123456",
    );
  });
  it("pads accounts, preserves zeros and normalises letters", () => {
    const a = calculateItalianIban("02008", "00000", "abc12");
    expect(a).toHaveLength(27);
    expect(a.endsWith("0000000ABC12")).toBe(true);
    expect(analyzeIban(a).valid).toBe(true);
  });
  it.each([
    ["1234", "12345", "123"],
    ["12345", "abcde", "123"],
    ["12345", "12345", "1234567890123"],
    ["12345", "12345", ""],
    ["12345", "12345", "a-b"],
  ])("rejects malformed domestic input", (...args) =>
    expect(() =>
      calculateItalianIban(...(args as [string, string, string])),
    ).toThrow(),
  );
});
describe("reference rates", () => {
  it("cross converts, handles decimals and rejects invalid amounts/currencies", () => {
    const rates = { EUR: 1, USD: 1.25, GBP: 0.8 };
    expect(convertCurrency(100, "USD", "GBP", rates)).toBe(64);
    expect(convertCurrency(0, "EUR", "EUR", rates)).toBe(0);
    expect(parseAmount("12,50")).toBe(12.5);
    for (const text of ["1,200.50", "Infinity", "1e3", "-1", "1 200"])
      expect(Number.isNaN(parseAmount(text))).toBe(true);
    for (const amount of [-1, Infinity, NaN, 1e13])
      expect(() => convertCurrency(amount, "EUR", "USD", rates)).toThrow();
    expect(() => convertCurrency(10, "BAD", "USD", rates)).toThrow();
  });
  it("validates ECB structure and date without XML entity expansion", () => {
    const rows = [
      "USD",
      "GBP",
      "JPY",
      "CHF",
      "CAD",
      "AUD",
      "SEK",
      "NOK",
      "DKK",
      "PLN",
    ]
      .map((c) => `<Cube currency='${c}' rate='1.5'/>`)
      .join("");
    const xml = `<Cube time='2026-09-25'>${rows}</Cube>`;
    expect(parseEcbRates(xml)).toMatchObject({
      date: "2026-09-25",
      rates: { EUR: 1, USD: 1.5 },
    });
    for (const bad of [
      '<!ENTITY x="x">' + xml,
      xml.replace("2026-09-25", "2026-02-30"),
      xml.replace("rate='1.5'", "rate='0'"),
      "<Cube/>",
    ])
      expect(() => parseEcbRates(bad)).toThrow();
  });
});
describe("bank directory and dated schemes", () => {
  it("contains imported registers and the independently verified branch", () => {
    expect(directoryStats.italianBanks).toBeGreaterThan(400);
    expect(directoryStats.bics).toBeGreaterThan(3000);
    expect(directoryStats.branches).toBeGreaterThan(18000);
    const bank = directoryLookup("IT", "02008", "21703")!;
    expect(bank.bic).toBe("UNCRITMMXXX");
    expect(bank.branches?.[0].address).toContain("FOLIGNO");
    expect(bank.office?.address).toContain("Milano");
    expect(bank.pec?.purpose).toBe("complaints");
    expect(bank.schemes?.sct_inst).toBeDefined();
  });
  it("supports broad BIC search and never guesses absent data", () => {
    expect(
      directorySearch("DEUTDEFF").some((b) => b.bic.startsWith("DEUTDEFF")),
    ).toBe(true);
    expect(directoryLookup("IT", "99999")).toBeNull();
    expect(directorySearch("nonexistent_xyz")).toEqual([]);
  });
  it("resolves banks outside Italy from national registers, with their source", () => {
    expect(directoryLookup("DE", "37040044")).toMatchObject({
      name: "Commerzbank",
      bic: "COBADEFFXXX",
      sourceKind: "register",
    });
    expect(directoryLookup("ES", "2100")?.bic).toBe("CAIXESBB");
    expect(directoryLookup("FR", "30004")).toMatchObject({ bic: "BNPAFRPPIFN", sourceKind: "curated" });
    expect(directoryLookup("DE", "37040044")?.source).toMatch(/^https:\/\/github\.com\/mdomke\/schwifty\/blob\/.+\/generated_de\.json$/);
    expect(directoryLookup("DE", "00000000")).toBeNull();
    expect(directoryLookup("DE", "constructor")).toBeNull();
  });
  it("ranks exact codes and names before partial matches", () => {
    expect(directorySearch("37040044")[0].name).toBe("Commerzbank");
    expect(directorySearch("intesa")[0].bic).toBe("BCITITMM");
    expect(directorySearch("deutsche bank")[0].name).toBe("Deutsche Bank");
    expect(directorySearch("bank").length).toBeLessThanOrEqual(20);
  });
  it("checks effective and departure dates and leaves missing membership unknown", () => {
    expect(schemeState(undefined)).toBe("unknown");
    expect(
      schemeState(
        { ready: "2020-01-01", leaving: "", source: "x" },
        "2026-09-26",
      ),
    ).toBe("active");
    expect(
      schemeState(
        { ready: "2027-01-01", leaving: "", source: "x" },
        "2026-09-26",
      ),
    ).toBe("future");
    expect(
      schemeState(
        { ready: "2020-01-01", leaving: "2026-09-01", source: "x" },
        "2026-09-26",
      ),
    ).toBe("ended");
  });
});
describe("advertising consent", () => {
  it("fails closed until a complete CMP decision", () => {
    expect(hasAdConsent({})).toBe(false);
    expect(
      hasAdConsent({
        eventStatus: "useractioncomplete",
        vendor: { consents: { 755: true } },
        purpose: { consents: { 1: true, 3: true, 4: true } },
      }),
    ).toBe(true);
    expect(
      hasAdConsent({
        eventStatus: "useractioncomplete",
        vendor: { consents: { 755: false } },
        purpose: { consents: { 1: true, 3: true, 4: true } },
      }),
    ).toBe(false);
    expect(googleCmpUrl("https://evil.test/cmp.js")).toBeNull();
    expect(
      googleCmpUrl("https://user:secret@fundingchoicesmessages.google.com/"),
    ).toBeNull();
  });
});
