/**
 * Keeps the IBAN on screen when the visitor switches language. The value travels only in
 * the URL fragment (never sent to the server) and the scanner removes it immediately.
 */
let current: string | null = null;

export function setCarriedScan(iban: string | null) {
  current = iban;
}

export function carriedScanHash(): string {
  return current ? "#" + new URLSearchParams({ iban: current, carry: "1" }) : "";
}
