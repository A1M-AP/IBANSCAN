import "server-only";
import epc from "@/data/epc-banks.json";
import italian from "@/data/italian-banks.json";
import branches from "@/data/italian-branches.json";
import offices from "@/data/bank-offices.json";
import contacts from "@/data/bank-contacts.json";
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
export function directorySearch(query: string): DirectoryBank[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2 || q.length > 100) return [];
  const out: DirectoryBank[] = [];
  const seen = new Set<string>();
  const add = (r: DirectoryBank) => {
    const key = r.bic ? bicKey(r.bic) : r.countryCode + r.bankIdentifier;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  };
  for (const r of searchBanks(query)) add(directoryLookup(r.countryCode,r.bankIdentifier)||enrich(r));
  for (const r of italian.records) {
    if ((r.name + " " + r.bankIdentifier).toLowerCase().includes(q)) {
      const bank = directoryLookup("IT", r.bankIdentifier);
      if (bank) add(bank);
    }
    if (out.length >= 20) break;
  }
  for (const r of epc.records) {
    if (out.length >= 20) break;
    if ((r.name + " " + r.bic).toLowerCase().includes(q))
      add(participantBank(r));
  }
  return out.slice(0, 20);
}
export const directoryStats = {
  italianBanks: italian.records.length,
  branches: branches.records.length,
  bics: epc.records.length,
  certifiedContacts: contacts.length,
  italianDate: italian.retrievedAt,
  epcDate: epc.retrievedAt,
};
