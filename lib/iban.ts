import { getCountry, type Country, type IbanField } from "./countries";
import { lookupBank, type BankRecord } from "./banks";

export type IbanCheck = { id: string; label: string; passed: boolean; message: string };
export type IbanResult = {
  normalized: string;
  formatted: string;
  masked: string;
  valid: boolean;
  country: Country | null;
  bban: string;
  bankIdentifier: string | null;
  branchIdentifier: string | null;
  accountIdentifier: string | null;
  checks: IbanCheck[];
  errors: string[];
  bank: BankRecord | null;
  sepa: boolean | null;
};

export const MAX_IBAN_INPUT_LENGTH = 256;

/** Whitespace and ASCII case only: punctuation and look-alike Unicode stay invalid. */
export function normalizeIban(input: string): string {
  return input.replace(/\s/g, "").replace(/[a-z]/g, (letter) => letter.toUpperCase());
}

export function formatIban(input: string): string {
  const normalized = normalizeIban(input);
  return normalized.match(/.{1,4}/g)?.join(" ") ?? "";
}

/** Streaming remainder avoids floating-point overflow for the longest IBAN. */
export function mod97(value: string): number {
  if (!/^[A-Z0-9]+$/.test(value) || value.length > 128) return Number.NaN;
  let remainder = 0;
  for (const character of value) {
    const code = character.charCodeAt(0);
    remainder = code >= 65
      ? (remainder * 100 + code - 55) % 97
      : (remainder * 10 + code - 48) % 97;
  }
  return remainder;
}

function extract(bban: string, field?: IbanField): string | null {
  return field && bban.length >= field.start + field.length
    ? bban.slice(field.start, field.start + field.length)
    : null;
}

export function analyzeIban(input: string): IbanResult {
  // Reject an oversized payload, never silently validate a truncated prefix.
  if (typeof input !== "string" || input.length > MAX_IBAN_INPUT_LENGTH) {
    const message = "Enter one IBAN using no more than 256 input characters.";
    return {
      normalized: "", formatted: "", masked: "", valid: false, country: null,
      bban: "", bankIdentifier: null, branchIdentifier: null, accountIdentifier: null,
      checks: [{ id: "input", label: "Input", passed: false, message }],
      errors: [message], bank: null, sepa: null,
    };
  }
  const normalized = normalizeIban(input);
  const country = getCountry(normalized.slice(0, 2)) ?? null;
  const bban = normalized.slice(4);
  const charactersValid = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(normalized);
  const lengthValid = country !== null && normalized.length === country.length;
  const structureValid = country !== null && new RegExp(country.bbanPattern).test(bban);
  const digits = Number(normalized.slice(2, 4));
  const checksumValid = charactersValid && normalized.length <= 34 && digits >= 2 && digits <= 98 &&
    mod97(bban + normalized.slice(0, 4)) === 1;
  const checks: IbanCheck[] = [
    {
      id: "characters", label: "Country format", passed: charactersValid,
      message: charactersValid ? "Two country letters, two check digits and alphanumeric account characters." : "Use two country letters, two check digits, then letters or numbers. Spaces are allowed; punctuation is not.",
    },
    {
      id: "country", label: "Supported country", passed: country !== null,
      message: country ? `${country.name} (${country.code}) has a registered IBAN format.` : "This country format is not currently supported. Check the first two letters.",
    },
    {
      id: "length", label: "IBAN length", passed: lengthValid,
      message: country ? lengthValid ? `Exactly ${country.length} characters, as required for ${country.name}.` : `${country.name} requires ${country.length} characters; this input has ${normalized.length}.` : "Length cannot be checked until a supported country is identified.",
    },
    {
      id: "structure", label: "BBAN structure", passed: structureValid,
      message: structureValid ? "The national letter and digit positions match the registered format." : country ? "The letters and numbers do not match this country's BBAN format." : "BBAN structure cannot be checked until a supported country is identified.",
    },
    {
      id: "checksum", label: "Check digits", passed: checksumValid,
      message: checksumValid ? "The international MOD-97 checksum is correct." : "The international check digits are incorrect or could not be checked. Confirm the complete IBAN with its source.",
    },
  ];
  const valid = checks.every((check) => check.passed);
  const canExtract = charactersValid && lengthValid && structureValid;
  const bankIdentifier = canExtract ? extract(bban, country?.bank) : null;
  return {
    normalized,
    formatted: formatIban(normalized),
    masked: normalized.length >= 8 ? `${normalized.slice(0, 4)} ${"•".repeat(Math.min(normalized.length - 8, 8))} ${normalized.slice(-4)}` : "•".repeat(normalized.length),
    valid,
    country,
    bban,
    bankIdentifier,
    branchIdentifier: canExtract ? extract(bban, country?.branch) : null,
    accountIdentifier: canExtract ? extract(bban, country?.account) : null,
    checks,
    errors: checks.filter((check) => !check.passed).map((check) => check.message),
    // Never resolve a malformed/invalid IBAN to a bank, even if its prefix matches.
    bank: valid && country && bankIdentifier ? lookupBank(country.code, bankIdentifier) : null,
    sepa: country?.sepa ?? null,
  };
}

/** Calculates international check digits only; it neither issues nor creates an account. */
export function generateIban(countryCode: string, suppliedBban: string): string {
  const country = getCountry(countryCode);
  if (!country) throw new Error("This country format is not currently supported.");
  if (typeof suppliedBban !== "string" || suppliedBban.length > MAX_IBAN_INPUT_LENGTH) {
    throw new Error("Enter a BBAN using no more than 256 input characters.");
  }
  const bban = normalizeIban(suppliedBban);
  if (bban.length !== country.length - 4 || !new RegExp(country.bbanPattern).test(bban)) {
    throw new Error(`Enter a BBAN that matches ${country.name}'s ${country.length - 4}-character national format.`);
  }
  const checkDigits = String(98 - mod97(bban + country.code + "00")).padStart(2, "0");
  return country.code + checkDigits + bban;
}
