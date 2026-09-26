import { FREE_BULK_LIMIT } from "./plans";
import type { IbanResult } from "./iban";
export const MAX_CSV_BYTES = 1_048_576;

/** Small RFC 4180-style parser. Quoted separators/newlines and escaped quotes are supported. */
export function parseIbanInput(input: string, limit: number = FREE_BULK_LIMIT): string[] {
  if (new TextEncoder().encode(input).length > MAX_CSV_BYTES) throw new Error("Choose a UTF-8 CSV file smaller than 1 MB.");
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0];
  // Separator counts outside quoted fields; a quoted IBAN header is valid.
  const counts = new Map([[",", 0], [";", 0], ["\t", 0]]);
  let inQuotes = false;
  for (const char of firstLine) { if (char === '"') inQuotes = !inQuotes; else if (!inQuotes && counts.has(char)) counts.set(char, counts.get(char)! + 1); }
  const delimiter = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const addRow = () => { row.push(field); if (row.some(v => v.trim())) rows.push(row); if(rows.length > limit + 1) throw new Error(`This batch exceeds the free limit of ${limit} entries. Split the file into smaller batches.`); row=[]; field=""; closed=false; };
  for (let index=0; index<text.length; index++) {
    const char=text[index];
    if (quoted) { if(char==='"') { if(text[index+1]==='"') {field+='"'; index++;} else {quoted=false; closed=true;} } else field+=char; continue; }
    if(char==='"') { if(field.length || closed) throw new Error("The CSV contains an unexpected quote. Use quotes around the entire field."); quoted=true; }
    else if(char===delimiter) { row.push(field);field="";closed=false; }
    else if(char==='\n' || char==='\r') { if(char==='\r' && text[index+1]==='\n')index++; addRow(); }
    else { if(closed && !/\s/.test(char))throw new Error("Unexpected text after a quoted CSV field."); if(!closed)field+=char; }
  }
  if(quoted)throw new Error("The CSV has an unclosed quoted field.");
  if(field || row.length)addRow();
  if(!rows.length)return [];
  const headerIndex = rows[0].findIndex(v=>/^(iban|international bank account number)$/i.test(v.trim()));
  const values = headerIndex >= 0 ? rows.slice(1).map(r=>r[headerIndex] ?? "") : rows.map(r=>{if(r.length!==1)throw new Error("For multi-column CSV files, include a column named IBAN.");return r[0];});
  if(values.length>limit)throw new Error(`This batch exceeds the free limit of ${limit} entries. Split the file into smaller batches.`);
  return values.map(v=>v.trim());
}

/** Neutralize spreadsheet formulas even after leading control/whitespace characters. */
export function csvCell(value: string): string {
  const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(value) || /^[\t\r\n]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
export function resultsToCsv(results: IbanResult[]): string {
  const rows = [["IBAN","Country","Status","Bank","BIC","Error"], ...results.map(r=>[r.normalized,r.country?.name??"",r.valid?"Valid":"Invalid",r.bank?.name??"Bank information unavailable",r.bank?.bic??"",r.errors.join("; ")])];
  return "\uFEFF" + rows.map(row=>row.map(csvCell).join(",")).join("\r\n");
}
