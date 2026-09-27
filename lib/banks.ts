import italianNames from "@/data/italian-bank-names.json";
import { isBicFormat } from "./bic";

export type BankContact = {
  url: string;
  /** International telephone number for general customer support, when published. */
  phone?: string;
  source: string;
  verifiedAt: string;
};

export type BankOffice = {
  address: string;
  /** A registered office is not necessarily an operational headquarters. */
  kind: "headquarters" | "registered-office";
  source: string;
  verifiedAt: string;
};

export type BankRecord = {
  name: string;
  bic: string;
  countryCode: string;
  bankIdentifier: string;
  source: string;
  verifiedAt: string;
  additionalSources?: string[];
  website?: string;
  contact?: BankContact;
  office?: BankOffice;
};

/** A deliberately small, independently sourced dataset. No heuristic BIC creation. */
export const bankRecords: readonly BankRecord[] = [
  {
    name: "ABN AMRO Bank N.V.",
    bic: "ABNANL2A",
    countryCode: "NL",
    bankIdentifier: "ABNA",
    source: "https://www.abnamro.nl/en/personal/payments/making-payments/iban.html",
    verifiedAt: "2026-09-20",
    website: "https://www.abnamro.nl/en/personal/",
    contact: {
      url: "https://www.abnamro.nl/en/personal/contact/index.html",
      phone: "+31 10 241 17 20",
      source: "https://www.abnamro.nl/en/personal/contact/overview-all-telephone-numbers.html",
      verifiedAt: "2026-09-22",
    },
    office: {
      address: "Gustav Mahlerlaan 10, 1082 PP Amsterdam, Netherlands",
      kind: "headquarters",
      source: "https://www.abnamro.nl/en/personal/overabnamro/index.html",
      verifiedAt: "2026-09-22",
    },
  },
  {
    name: "National Westminster Bank Plc",
    bic: "NWBKGB2L",
    countryCode: "GB",
    bankIdentifier: "NWBK",
    source: "https://www.natwest.com/business/trade-finance/online-solutions-and-tools/iban.html",
    verifiedAt: "2026-09-20",
    website: "https://www.natwest.com/",
    contact: {
      url: "https://www.natwest.com/support-centre/contact-us.html",
      phone: "+44 3457 888 444",
      source: "https://www.natwest.com/support-centre/contact-us.html",
      verifiedAt: "2026-09-22",
    },
    office: {
      address: "250 Bishopsgate, London EC2M 4AA, United Kingdom",
      kind: "registered-office",
      source: "https://www.natwest.com/website-terms-and-conditions.html",
      verifiedAt: "2026-09-22",
    },
  },
  {
    name: "Intesa Sanpaolo S.p.A.",
    bic: "BCITITMM",
    countryCode: "IT",
    bankIdentifier: "03069",
    source: "https://imi.intesasanpaolo.com/it/documentazione/kyc/",
    additionalSources: ["https://group.intesasanpaolo.com/en/footer-pages/corporate-data"],
    verifiedAt: "2026-09-22",
    website: "https://www.intesasanpaolo.com/",
    contact: {
      url: "https://group.intesasanpaolo.com/it/pagine-footer/contatti",
      phone: "+39 011 8019200",
      source: "https://group.intesasanpaolo.com/it/pagine-footer/contatti",
      verifiedAt: "2026-09-22",
    },
    office: {
      address: "Piazza San Carlo 156, 10121 Torino, Italia",
      kind: "registered-office",
      source: "https://group.intesasanpaolo.com/en/footer-pages/corporate-data",
      verifiedAt: "2026-09-22",
    },
  },
  {
    name: "N26 Bank SE",
    bic: "NTSBDEB1XXX",
    countryCode: "DE",
    bankIdentifier: "10011001",
    source: "https://www.bundesbank.de/en/homepage/search/bank-sort-codes-search",
    verifiedAt: "2026-09-22",
    website: "https://n26.com/en-de",
    contact: {
      url: "https://support.n26.com/en-de/app-and-features/app/how-to-contact-n26",
      source: "https://support.n26.com/en-de/app-and-features/app/how-to-contact-n26",
      verifiedAt: "2026-09-22",
    },
    office: {
      address: "Voltairestraße 8, 10179 Berlin, Deutschland",
      kind: "registered-office",
      source: "https://n26.com/en-de/imprint",
      verifiedAt: "2026-09-22",
    },
  },
  {
    name: "Banco Santander, S.A.",
    bic: "BSCHESMMXXX",
    countryCode: "ES",
    bankIdentifier: "0049",
    source: "https://www.bancosantander.es/empresas/negocio-internacional/cobros-pagos-internacionales/calcular-swift",
    additionalSources: ["https://www.bancosantander.es/aviso-legal"],
    verifiedAt: "2026-09-22",
    website: "https://www.bancosantander.es/",
    contact: {
      url: "https://www.bancosantander.es/en/particulares/atencion-cliente",
      phone: "+34 915 123 123",
      source: "https://www.bancosantander.es/en/particulares/atencion-cliente",
      verifiedAt: "2026-09-22",
    },
    office: {
      address: "Ciudad Grupo Santander, Av. de Cantabria s/n, 28660 Boadilla del Monte, Madrid, España",
      kind: "headquarters",
      source: "https://www.santander.com/en/landing-pages/contact",
      verifiedAt: "2026-09-22",
    },
  },
 {name:'UniCredit S.p.A.',bic:'UNCRITMMXXX',countryCode:'IT',bankIdentifier:'02008',source:'https://www.unicreditgroup.eu/it/info/general-company-info.html',additionalSources:['https://circolofirenze.unicredit.it/diventa-socio'],verifiedAt:'2026-09-26',website:'https://www.unicredit.it/',contact:{url:'https://www.unicredit.it/it/info/contatti.html',source:'https://www.unicredit.it/it/info/contatti.html',verifiedAt:'2026-09-26'},office:{address:'Piazza Gae Aulenti 3, Tower A, 20154 Milano, Italia',kind:'registered-office',source:'https://www.unicreditgroup.eu/it/info/general-company-info.html',verifiedAt:'2026-09-26'}},
];

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength &&
    !/[\u0000-\u001f\u007f<>]/.test(value);
}

/** Data links are rendered publicly. No script schemes, credentials or local URLs. */
function isPublicHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048 || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(url.hostname) &&
      !/(?:^|\.)(?:localhost|local|internal|test|invalid)$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Copy allowlisted, validated data so a provider cannot leak arbitrary fields. */
function sanitizeRecord(value: unknown): BankRecord | null {
  if (!isObject(value) || typeof value.countryCode !== "string" || !/^[A-Z]{2}$/.test(value.countryCode) ||
    typeof value.bankIdentifier !== "string" || !/^[A-Z0-9]{1,12}$/.test(value.bankIdentifier) ||
    typeof value.bic !== "string" || !isBicFormat(value.bic) || value.bic.slice(4, 6) !== value.countryCode ||
    !isText(value.name, 200) || !isPublicHttpsUrl(value.source) || !isDate(value.verifiedAt)) return null;
  const record: BankRecord = {
    name: value.name, bic: value.bic, countryCode: value.countryCode,
    bankIdentifier: value.bankIdentifier, source: value.source, verifiedAt: value.verifiedAt,
  };
  if (Array.isArray(value.additionalSources)) {
    const sources = value.additionalSources.filter(isPublicHttpsUrl).slice(0, 5);
    if (sources.length) record.additionalSources = [...new Set(sources)];
  }
  if (isPublicHttpsUrl(value.website)) record.website = value.website;
  const contact = value.contact;
  if (isObject(contact) && isPublicHttpsUrl(contact.url) && isPublicHttpsUrl(contact.source) && isDate(contact.verifiedAt)) {
    record.contact = { url: contact.url, source: contact.source, verifiedAt: contact.verifiedAt };
    if (typeof contact.phone === "string" && /^\+[1-9][0-9 ()-]{6,28}$/.test(contact.phone)) {
      record.contact.phone = contact.phone;
    }
  }
  const office = value.office;
  if (isObject(office) && isText(office.address, 300) &&
    (office.kind === "headquarters" || office.kind === "registered-office") &&
    isPublicHttpsUrl(office.source) && isDate(office.verifiedAt)) {
    record.office = { address: office.address, kind: office.kind, source: office.source, verifiedAt: office.verifiedAt };
  }
  return record;
}

function copyRecord(record: BankRecord): BankRecord {
  return {
    ...record,
    ...(record.additionalSources ? { additionalSources: [...record.additionalSources] } : {}),
    ...(record.contact ? { contact: { ...record.contact } } : {}),
    ...(record.office ? { office: { ...record.office } } : {}),
  };
}

export interface BankDataProvider {
  readonly name: string;
  lookup(countryCode: string, bankIdentifier: string): BankRecord | null;
  search(query: string, countryCode?: string): BankRecord[];
}

/**
 * Swap in a maintained, licensed dataset without changing validation logic.
 * The provider receives country and bank identifier only, never the full IBAN.
 * Duplicate/conflicting mappings fail closed instead of selecting a BIC arbitrarily.
 */
export function createBankDataProvider(records: readonly BankRecord[], name = "verified-local"): BankDataProvider {
  const validRecords = records.map(sanitizeRecord).filter((record): record is BankRecord => record !== null);
  return {
    name,
    lookup(countryCode, bankIdentifier) {
      const matches = validRecords.filter((record) => record.countryCode === countryCode.toUpperCase() && record.bankIdentifier === bankIdentifier.toUpperCase());
      return matches.length === 1 ? copyRecord(matches[0]) : null;
    },
    search(query, countryCode) {
      const value = query.trim().toLowerCase();
      if (value.length < 2 || value.length > 100) return [];
      return validRecords.filter((record) =>
        (!countryCode || record.countryCode === countryCode.toUpperCase()) &&
        [record.name, record.bic, record.bankIdentifier].some((field) => field.toLowerCase().includes(value)),
      ).slice(0, 20).map(copyRecord);
    },
  };
}

export const bankDataProvider = createBankDataProvider(bankRecords);
export function lookupBank(countryCode: string, bankIdentifier: string): BankRecord | null {
  const known = bankDataProvider.lookup(countryCode, bankIdentifier);
  if (known) return known;
  const name = countryCode.toUpperCase() === "IT" ? (italianNames.names as Record<string,string>)[bankIdentifier] : undefined;
  return name ? { name, bic: "", countryCode: "IT", bankIdentifier, source: italianNames.source, verifiedAt: italianNames.retrievedAt } : null;
}
export function searchBanks(query: string, countryCode?: string): BankRecord[] {
  return bankDataProvider.search(query, countryCode);
}
