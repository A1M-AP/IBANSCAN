import registry from "../data/iban-registry.json";

export type IbanField = { start: number; length: number };

export type Country = {
  code: string;
  name: string;
  slug: string;
  flag: string;
  length: number;
  bbanPattern: string;
  example: string;
  /** Geographic scope only, not a bank's adherence to a SEPA scheme. */
  sepa: boolean;
  /** National currency, when supplied; never the account's currency. */
  currency?: string;
  bank?: IbanField;
  branch?: IbanField;
  account?: IbanField;
  /** SWIFT notation: n = digit, a = letter, c = alphanumeric; ! = fixed length. */
  format: string;
  notes: string;
};

export const countryDataSource = {
  name: "SWIFT IBAN Registry",
  version: registry.version,
  published: registry.published,
  retrieved: registry.retrieved,
  url: registry.source,
  sepaUrl: "https://www.europeanpaymentscouncil.eu/document-library/other/epc-list-sepa-scheme-countries",
  sepaVersion: "EPC409-09 v8.0 (24 December 2025)",
} as const;

// EPC geographic scope, including Gibraltar under the United Kingdom. Some French
// overseas territories share FR but are outside SEPA; an IBAN alone cannot distinguish them.
const sepaCodes = new Set("AD AL AT BE BG CH CY CZ DE DK EE ES FI FR GB GI GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM VA".split(" "));

const names: Record<string, string> = {
  AE: "United Arab Emirates", FK: "Falkland Islands", MD: "Moldova",
  NL: "Netherlands", PS: "Palestine", RU: "Russia", TR: "Türkiye",
  VA: "Vatican City", VG: "British Virgin Islands",
};

// Only explicitly mapped account-number segments are exposed. The BBAN remains
// available for every country; no remainder is guessed to be an account number.
const accounts: Record<string, [number, number]> = {
  AD: [8, 12], AE: [3, 16], AL: [8, 16], AT: [5, 11], AZ: [4, 20],
  BA: [6, 8], BE: [3, 7], BG: [10, 8], BH: [4, 14], BI: [10, 11],
  BR: [13, 10], BY: [8, 16], CH: [5, 12], CR: [4, 14], CY: [8, 16],
  CZ: [4, 16], DE: [8, 10], DJ: [10, 11], DO: [4, 20], EG: [8, 17],
  ES: [10, 10], FR: [10, 11], GB: [10, 8], GI: [4, 15], GR: [7, 16],
  HN: [4, 20], HR: [7, 10], IE: [10, 8], IL: [6, 13], IQ: [7, 12],
  IT: [11, 12], JO: [8, 18], KW: [4, 22], KZ: [3, 13], LB: [4, 20],
  LC: [4, 24], LI: [5, 12], LT: [5, 11], LU: [3, 13], LV: [4, 13],
  LY: [6, 15], MC: [10, 11], MD: [2, 18], ME: [3, 13], MK: [3, 10],
  MN: [4, 12], MR: [10, 11], MT: [9, 18], MU: [8, 12], NI: [4, 20],
  NL: [4, 10], OM: [3, 16], PK: [4, 16], PL: [8, 16], PS: [4, 21],
  PT: [8, 11], QA: [4, 21], RO: [4, 16], RS: [3, 13], SA: [2, 18],
  SC: [8, 16], SD: [2, 12], SI: [5, 8], SK: [4, 16], SM: [11, 12],
  SO: [7, 12], ST: [8, 11], SV: [4, 20], TL: [3, 14], TN: [5, 13],
  TR: [6, 16], UA: [6, 19], VA: [3, 15], VG: [4, 16], XK: [4, 10],
  YE: [8, 18],
};

const notes: Record<string, string> = {
  IT: "The first BBAN character is the domestic CIN letter. The next five digits are the ABI bank identifier, followed by the five-digit CAB branch identifier and a 12-character account segment. The international check digits are separate from CIN.",
  SM: "San Marino uses a CIN letter, a five-digit bank identifier, a five-digit branch identifier and a 12-character account segment, like the Italian format, but uses the SM country prefix.",
  DE: "The eight-digit Bankleitzahl identifies the bank. The following ten digits contain the account number, including any leading zeroes. Bank-specific domestic account rules are outside the international IBAN checksum.",
  FR: "French IBANs include a five-digit bank code, five-digit branch code, 11-character account segment and two-digit RIB key. Several overseas territories use FR; some are outside SEPA, so the prefix alone does not establish geographic eligibility.",
  GB: "The BBAN contains a four-letter bank identifier, six-digit sort code and eight-digit account number. A bank identifier is not a complete BIC. The GB prefix also covers the Crown Dependencies listed in the registry.",
  ES: "After the four-digit bank code and four-digit branch code, two domestic control digits precede the ten-digit account number. Domestic control digits and the international IBAN checksum are different checks.",
  NL: "A four-letter bank identifier is followed by a ten-digit account number. Leading zeroes form part of the account segment. A BIC must be taken from an independently verified bank mapping.",
  BE: "The BBAN is numeric: a three-digit bank identifier, seven account digits and two domestic control digits. IBANScan checks the international MOD-97 checksum; it does not validate the separate domestic check.",
  BR: "Registry release 103 permits alphanumeric characters in the eight-character bank identifier and in the final account-type and holder-position fields. Older numeric-only bank-code rules are no longer the current registry format.",
  IS: "The Icelandic BBAN includes bank and branch identifiers, account-related segments and a ten-digit national identifier. IBANScan does not infer a person's identity from these digits or send account segments to the AI provider.",
  MU: "The format contains bank and branch identifiers, an account segment and additional suffix fields, including three alphabetic currency characters. These characters are structural data, not confirmation of account currency or availability.",
  SC: "Seychelles IBANs contain bank and branch identifiers, a 16-digit account segment and three alphabetic currency characters. No account currency, balance or ownership is verified.",
  PT: "Portugal uses a 21-digit BBAN with institution, branch, account and domestic control segments. The SWIFT registry does not separately publish a branch-offset field for PT; this release therefore leaves that extraction unavailable.",
  CZ: "The 16 digits after the bank identifier represent the domestic account prefix and account number together. They should be kept with their leading zeroes when formatting the IBAN.",
  SK: "The BBAN contains a four-digit bank identifier, a six-digit account prefix and a ten-digit account number. IBANScan exposes the account prefix and number together as the account segment.",
};

function field(value: number[] | null | undefined): IbanField | undefined {
  return value ? { start: value[0], length: value[1] } : undefined;
}

export const countries: Country[] = registry.countries.map((row) => {
  const name = names[row.code] ?? row.name;
  const pattern = row.format.replace(/(\d+)!([nac])/g, (_, count: string, type: string) =>
    `${type === "n" ? "[0-9]" : type === "a" ? "[A-Z]" : "[A-Z0-9]"}{${count}}`);
  return {
    code: row.code,
    name,
    slug: name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    flag: [...row.code].map((character) => String.fromCodePoint(127397 + character.charCodeAt(0))).join(""),
    length: row.length,
    bbanPattern: `^${pattern}$`,
    example: row.example,
    sepa: sepaCodes.has(row.code),
    bank: field(row.bank),
    branch: field(row.branch),
    account: field(accounts[row.code]),
    format: row.format,
    notes: notes[row.code] ?? `${name} uses a ${row.length}-character IBAN with the ${row.code} prefix. The BBAN follows the registered ${row.format} pattern. Bank identifiers are extracted from the national format; account activity and bank scheme participation require separate confirmation.`,
  };
});

const byCode = new Map(countries.map((country) => [country.code, country]));
const bySlug = new Map(countries.map((country) => [country.slug, country]));

export function getCountry(codeOrSlug: string): Country | undefined {
  const value = codeOrSlug.trim();
  return byCode.get(value.toUpperCase()) ?? bySlug.get(value.toLowerCase());
}
