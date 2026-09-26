import { generateIban, normalizeIban } from "./iban";
// Italian national CIN: alternating substitutions, positions counted from one.
const odd = [
  1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10,
  22, 25, 24, 23,
];
export function calculateItalianIban(
  abiInput: string,
  cabInput: string,
  accountInput: string,
): string {
  if (
    [abiInput, cabInput, accountInput].some(
      (v) => typeof v !== "string" || v.length > 40,
    )
  )
    throw new Error("Invalid domestic details");
  const abi = normalizeIban(abiInput),
    cab = normalizeIban(cabInput),
    account = normalizeIban(accountInput);
  if (
    !/^\d{5}$/.test(abi) ||
    !/^\d{5}$/.test(cab) ||
    !/^[A-Z0-9]{1,12}$/.test(account)
  )
    throw new Error("Invalid domestic details");
  const domestic = abi + cab + account.padStart(12, "0");
  let sum = 0;
  for (let i = 0; i < domestic.length; i++) {
    const c = domestic.charCodeAt(i);
    const n = c >= 65 ? c - 65 : c - 48;
    sum += i % 2 === 0 ? odd[n] : n;
  }
  return generateIban("IT", String.fromCharCode(65 + (sum % 26)) + domestic);
}
