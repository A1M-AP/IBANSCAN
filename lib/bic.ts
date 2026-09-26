/** ISO 9362 syntax only. A matching code is not proof of assignment or network connectivity.
 * Source: https://www.swift.com/standards/data-standards/bic-business-identifier-code
 */
export function isBicFormat(value: string): boolean {
  return /^[A-Z0-9]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value);
}
