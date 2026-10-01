import "server-only";
import epc from "@/data/epc-banks.json";
import italian from "@/data/italian-banks.json";
import branches from "@/data/italian-branches.json";
import offices from "@/data/bank-offices.json";
import contacts from "@/data/bank-contacts.json";
import national from "@/data/national-banks.json";
import { lookupBank, searchBanks } from "./banks";
import type { DirectoryBank } from "./bank-directory-types";
const nameKey = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
const bicKey = (s: string) => (s.length === 8 ? s + "XXX" : s);
const epcByBic = new Map(epc.records.map((r) => [r.bic, r]));
type NationalCountry = { kind: string; file: string; banks: Record<string, (string | number)[]> };
const nationalCountries = national.countries as Record<string, NationalCountry>;
/** National bank-code registers (schwifty) for countries beyond the detailed Italian directory. */
function nationalBank(country: string, identifier: string): DirectoryBank | null {
  const entry = nationalCountries[country];
  const row = entry && Object.hasOwn(entry.banks, identifier) ? entry.banks[identifier] : undefined;
  if (!row) return null;
  const [name, bic, curated] = row as [string, string, number?];
  return {
    name,
    bic,
    countryCode: country,
    bankIdentifier: identifier,
    source: `${national.source.replace("/tree/", "/blob/")}/${entry.file}`,
    verifiedAt: national.releasedAt,
    sourceKind: curated || entry.kind === "curated" ? "curated" : "register",
  };
}
const italianByCode = new Map(
  italian.records.map((r) => [r.bankIdentifier, r]),
);
const names = new Map<string, typeof epc.records>();
for (const r of epc.records) {
  const key = r.countryCode + nameKey(r.name);
  names.set(key, [...(names.get(key) || []), r]);
}
function enrich(bank: DirectoryBank): DirectoryBank {
  const participant = epcByBic.get(bicKey(bank.bic));
  const record = { ...bank };
  if (participant) {
    record.schemes = participant.schemes;
    record.schemeDate = epc.retrievedAt;
    record.registryAddress = participant.address;
    record.registrySource = epc.source;
    record.registryDate = epc.retrievedAt;
  }
  const contact =
    bank.countryCode === "IT"
      ? contacts.find((c) => c.bankIdentifier === bank.bankIdentifier)
      : undefined;
  if (contact) record.pec = contact;
  return record;
}
export function directoryLookup(
  country: string,
  identifier: string,
  branch?: string,
): DirectoryBank | null {
  let bank: DirectoryBank | null = lookupBank(country, identifier);
  if (country === "IT") {
    const r = italianByCode.get(identifier);
    if (r) {
      const candidates = names.get("IT" + nameKey(r.name)) || [];
      const participant = candidates.length === 1 ? candidates[0] : undefined;
      const raw = r as typeof r & {
        legalAddress?: string;
        headquarters?: string;
        website?: string;
      };
      bank = bank || {
        name: r.name,
        bic: participant?.bic || "",
        countryCode: "IT",
        bankIdentifier: identifier,
        source: r.source,
        verifiedAt: r.verifiedAt,
      };
      if (!bank.bic && participant) bank.bic = participant.bic;
      if (!bank.bic) {
        const registered = nationalBank("IT", identifier);
        if (registered?.bic) {
          bank.bic = registered.bic;
          bank.bicSource = registered.source;
        }
      }
      if (!bank.office && raw.legalAddress)
        bank.office = {
          address: raw.legalAddress,
          kind: "registered-office",
          source: r.source,
          verifiedAt: r.verifiedAt,
        };
      if (raw.headquarters) {
        bank.headquartersAddress = raw.headquarters;
        bank.headquartersSource = r.source;
        bank.headquartersDate = r.verifiedAt;
      }
      if (!bank.office) {
        bank.registryAddress = r.address;
        bank.registrySource = r.source;
        bank.registryDate = r.verifiedAt;
      }
      if (!bank.website && raw.website) {
        const url = raw.website.trim().toLowerCase();
        const normalized = url.startsWith("https://")
          ? url
          : "https://" + (url.startsWith("http://") ? url.slice(7) : url);
        try {
          const parsed = new URL(normalized);
          if (
            parsed.protocol === "https:" &&
            !parsed.username &&
            !parsed.password &&
            /^[a-z0-9.-]+\.[a-z]{2,}$/.test(parsed.hostname)
          )
            bank.website = parsed.href;
        } catch {}
      }
    }
  }
  bank ??= nationalBank(country, identifier);
  if (!bank) return null;
  const office=offices.find(o=>o.countryCode===country&&o.bankIdentifier===identifier);
  if(office){bank.headquartersAddress=office.address;bank.headquartersSource=office.source;bank.headquartersDate=office.verifiedAt;}
  const out = enrich(bank);
  if (country === "IT" && branch) {
    const matches = branches.records.filter(
      (r) => r.abi === identifier && r.cab === branch,
    );
    out.branches = matches
      .slice(0, 20)
      .map(({ id, address }) => ({ id, address }));
    out.branchCount = matches.length;
    out.branchSource = branches.source;
    out.branchDate = branches.retrievedAt;
  }
  return out;
}
function participantBank(r: (typeof epc.records)[number]): DirectoryBank {
  return enrich({
    name: r.name,
    bic: r.bic,
    countryCode: r.countryCode,
    bankIdentifier: "",
    source: epc.source,
    verifiedAt: epc.retrievedAt,
  });
}
/** Lower-cased once at start-up; Italy is served by the detailed Banca d'Italia directory. */
const nationalIndex = Object.entries(nationalCountries)
  .filter(([country]) => country !== "IT")
  .flatMap(([country, entry]) =>
    Object.entries(entry.banks).map(([code, row]) => {
      const name = String(row[0]);
      const bic = String(row[1]);
      return { country, code, name, bic, haystack: (name + " " + bic + " " + code).toLowerCase() };
    }),
  );
/** 0: exact code/BIC, 1: exact name, 2: name or BIC prefix, 3: word prefix, 4: substring. */
function matchRank(q: string, name: string, bic: string, code: string): number {
  const n = name.toLowerCase();
  const b = bic.toLowerCase();
  if (code.toLowerCase() === q || b === q || b === q + "xxx") return 0;
  if (nameKey(name) === nameKey(q)) return 1;
  if (n.startsWith(q) || b.startsWith(q)) return 2;
  if (n.includes(" " + q)) return 3;
  return 4;
}
export function directorySearch(query: string): DirectoryBank[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2 || q.length > 100) return [];
  const limit = 20;
  // Candidates are gathered per source in priority order, then ranked by match quality.
  const candidates: { rank: number; order: number; load: () => DirectoryBank | null }[] = [];
  const consider = (name: string, bic: string, code: string, load: () => DirectoryBank | null) => {
    const haystack = (name + " " + bic + " " + code).toLowerCase();
    if (haystack.includes(q))
      candidates.push({ rank: matchRank(q, name, bic, code), order: candidates.length, load });
  };
  for (const r of searchBanks(query))
    consider(r.name, r.bic, r.bankIdentifier, () => directoryLookup(r.countryCode, r.bankIdentifier) || enrich(r));
  for (const r of italian.records)
    consider(r.name, "", r.bankIdentifier, () => directoryLookup("IT", r.bankIdentifier));
  for (const r of nationalIndex)
    if (r.haystack.includes(q))
      consider(r.name, r.bic, r.code, () => directoryLookup(r.country, r.code));
  for (const r of epc.records) consider(r.name, r.bic, "", () => participantBank(r));
  // Equal matches keep source priority: reviewed records, Italian register, national registers, EPC.
  candidates.sort((a, b) => a.rank - b.rank || a.order - b.order);
  const out: DirectoryBank[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (out.length >= limit) break;
    const r = candidate.load();
    if (!r) continue;
    const key = r.bic ? bicKey(r.bic) : r.countryCode + r.bankIdentifier;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}
export const directoryStats = {
  italianBanks: italian.records.length,
  branches: branches.records.length,
  bics: epc.records.length,
  certifiedContacts: contacts.length,
  nationalCountries: Object.keys(nationalCountries).length,
  nationalBanks: Object.values(nationalCountries).reduce((n, c) => n + Object.keys(c.banks).length, 0),
  nationalDate: national.releasedAt,
  italianDate: italian.retrievedAt,
  epcDate: epc.retrievedAt,
};
