import { describe, expect, it } from "vitest";
import { bankRecords, createBankDataProvider, lookupBank, searchBanks, type BankRecord } from "../lib/banks";
import { analyzeIban, generateIban } from "../lib/iban";

describe("verified bank details", () => {
  it.each([
    ["IT", "03069", "Intesa Sanpaolo S.p.A.", "BCITITMM"],
    ["DE", "10011001", "N26 Bank SE", "NTSBDEB1XXX"],
    ["ES", "0049", "Banco Santander, S.A.", "BSCHESMMXXX"],
  ])("resolves the independently documented %s / %s mapping", (country, identifier, name, bic) => {
    expect(lookupBank(country, identifier)).toMatchObject({ name, bic, countryCode: country, bankIdentifier: identifier });
    expect(lookupBank(country, identifier)?.contact?.url).toMatch(/^https:\/\//);
    expect(lookupBank(country, identifier)?.office?.source).toMatch(/^https:\/\//);
  });

  it("includes source-linked bank contacts in a valid analysis without assuming ownership", () => {
    // Structurally generated test data, not a statement that an account exists.
    const iban = generateIban("IT", "A0306901000000000000000");
    const result = analyzeIban(iban);
    expect(result.valid).toBe(true);
    expect(result.bank?.name).toBe("Intesa Sanpaolo S.p.A.");
    expect(result.bank?.contact?.phone).toBe("+39 011 8019200");
    expect(result.bank?.office).toMatchObject({ kind: "registered-office", address: "Piazza San Carlo 156, 10121 Torino, Italia" });
    expect(result.bank).not.toHaveProperty("owner");
    expect(analyzeIban(`IT00${iban.slice(4)}`).bank).toBeNull();
  });

  it("keeps registered offices distinct from published headquarters", () => {
    expect(lookupBank("NL", "ABNA")?.office?.kind).toBe("headquarters");
    expect(lookupBank("ES", "0049")?.office?.kind).toBe("headquarters");
    expect(lookupBank("GB", "NWBK")?.office?.kind).toBe("registered-office");
    expect(lookupBank("DE", "10011001")?.contact?.phone).toBeUndefined();
    expect(lookupBank("IT", "05428")).toBeNull();
  });

  it("search results include verified contact and office provenance", () => {
    const [bank] = searchBanks("santander", "ES");
    expect(bank.contact?.verifiedAt).toBe("2026-09-22");
    expect(bank.office?.source).toBe("https://www.santander.com/en/landing-pages/contact");
    expect(bank.additionalSources).toContain("https://www.bancosantander.es/aviso-legal");
  });

  it.each(["javascript:alert(1)", "https://user:secret@bank.com/", "https://localhost/", "https://127.0.0.1/", "https://bank.com:444/", "https://bank.com/\nattack"])("discards unsafe optional URLs: %s", (url) => {
    const provider = createBankDataProvider([{ ...bankRecords[0], website: url,
      contact: { ...bankRecords[0].contact!, url },
      office: { ...bankRecords[0].office!, source: url },
      additionalSources: [url],
    }]);
    const bank = provider.lookup("NL", "ABNA");
    expect(bank?.name).toBe("ABN AMRO Bank N.V.");
    expect(bank?.website).toBeUndefined();
    expect(bank?.contact).toBeUndefined();
    expect(bank?.office).toBeUndefined();
    expect(bank?.additionalSources).toBeUndefined();
  });

  it("rejects invalid core provenance and safely ignores malformed optional provider fields", () => {
    const provider = createBankDataProvider([
      null, undefined, { ...bankRecords[0], source: "https://" },
      { ...bankRecords[0], verifiedAt: "2026-02-30" },
    ] as unknown as BankRecord[]);
    expect(provider.lookup("NL", "ABNA")).toBeNull();
    const optional = createBankDataProvider([{ ...bankRecords[0],
      contact: { ...bankRecords[0].contact, phone: "123;malicious", verifiedAt: "2026-09-22" },
      office: { ...bankRecords[0].office, kind: "branch" },
      additionalSources: [5, "javascript:alert(1)"],
    }] as unknown as BankRecord[]).lookup("NL", "ABNA");
    expect(optional?.contact?.url).toBe(bankRecords[0].contact?.url);
    expect(optional?.contact?.phone).toBeUndefined();
    expect(optional?.office).toBeUndefined();
    expect(optional?.additionalSources).toBeUndefined();
  });

  it("isolates records from mutations by callers and data providers", () => {
    const original = structuredClone(bankRecords[0]);
    original.additionalSources = [original.source];
    const provider = createBankDataProvider([original]);
    original.contact!.url = "https://untrusted.example/";
    const lookup = provider.lookup("NL", "ABNA")!;
    lookup.contact!.phone = "+1 555 000 0000";
    lookup.office!.address = "Another address";
    lookup.additionalSources!.push("https://untrusted.example/");
    expect(provider.lookup("NL", "ABNA")?.contact).toEqual(bankRecords[0].contact);
    expect(provider.search("ABNA")[0].office).toEqual(bankRecords[0].office);
    expect(provider.lookup("NL", "ABNA")?.additionalSources).toEqual([original.source]);
  });
});
