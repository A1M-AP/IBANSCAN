export const ECB_RATES_URL =
  "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
export const ECB_SOURCE =
  "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html";
export type ExchangeRates = {
  base: "EUR";
  date: string;
  rates: Record<string, number>;
  source: string;
};
/** Strict parser for the ECB's tiny, fixed daily format. Never expands XML entities. */
export function parseEcbRates(xml: string): ExchangeRates {
  if (xml.length > 100_000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Invalid rates document");
  const date = xml.match(/<Cube\s+time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
  if (
    !date ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error("Missing reference date");
  const rates: Record<string, number> = { EUR: 1 };
  for (const match of xml.matchAll(
    /<Cube\s+currency=['"]([A-Z]{3})['"]\s+rate=['"](\d+(?:\.\d+)?)['"]\s*\/?\s*>/g,
  )) {
    const rate = Number(match[2]);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 1e9 || rates[match[1]])
      throw new Error("Invalid rate");
    rates[match[1]] = rate;
  }
  if (Object.keys(rates).length < 10) throw new Error("Incomplete rates");
  return { base: "EUR", date, rates, source: ECB_SOURCE };
}
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 1e12 ||
    !Object.hasOwn(rates, from) ||
    !Object.hasOwn(rates, to) ||
    rates[from] <= 0 ||
    rates[to] <= 0
  )
    throw new Error("Invalid conversion");
  return (amount / rates[from]) * rates[to];
}
export function parseAmount(value: string): number {
  if (!/^\d{1,13}(?:[.,]\d{1,8})?$/.test(value.trim())) return NaN;
  return Number(value.trim().replace(",", "."));
}
