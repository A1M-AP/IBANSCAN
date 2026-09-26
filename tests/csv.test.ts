import { describe, expect, it } from "vitest";
import { csvCell, MAX_CSV_BYTES, parseIbanInput, resultsToCsv } from "../lib/csv";
import { analyzeIban } from "../lib/iban";

const italian = "IT60X0542811101000000123456";
const dutch = "NL91ABNA0417164300";

describe("bulk IBAN parsing", () => {
  it("accepts a pasted list, trims each entry and ignores blank physical rows", () => {
    expect(parseIbanInput("\n  " + italian + "  \r\n\r\n" + dutch + "\n")).toEqual([italian, dutch]);
  });

  it.each([",", ";", "\t"])("detects the %j separator and selects the named IBAN column", (separator) => {
    const csv = ["Reference", "IBAN", "Notes"].join(separator) + "\r\n" + ["example", italian, "ok"].join(separator) + "\r\n" + ["example", dutch, "ok"].join(separator);
    expect(parseIbanInput(csv)).toEqual([italian, dutch]);
  });

  it("accepts BOM, case-insensitive quoted headers and CR-only newlines", () => {
    expect(parseIbanInput('\uFEFF"Reference","iBaN"\r"A","' + italian + '"\r"B","' + dutch + '"')).toEqual([italian, dutch]);
  });

  it("accepts the expanded IBAN header", () => {
    expect(parseIbanInput("International bank account number,reference\n" + italian + ",sample")).toEqual([italian]);
  });

  it("parses escaped quotes, quoted commas and embedded line breaks without shifting columns", () => {
    const csv = 'Reference,IBAN,Notes\r\n"A, B","' + italian + '","line 1\r\nline 2 says ""hello"""\r\n"C","' + dutch + '","finished"';
    expect(parseIbanInput(csv)).toEqual([italian, dutch]);
  });

  it("ignores alternative delimiters inside quoted fields", () => {
    const csv = '"Reference, a, b, c";"IBAN";"Comment\ttext"\n"sample, x";' + italian + ';"x;y"';
    expect(parseIbanInput(csv)).toEqual([italian]);
  });

  it("preserves embedded newlines inside a quoted IBAN for normalizer validation", () => {
    expect(parseIbanInput('IBAN\n"IT60 X054\n2811 1010 0000 0123 456"')).toEqual(["IT60 X054\n2811 1010 0000 0123 456"]);
  });

  it("requires an IBAN header for multi-column data instead of guessing an account column", () => {
    expect(() => parseIbanInput("A," + italian + "\nB," + dutch)).toThrow("include a column named IBAN");
    expect(() => parseIbanInput("Reference,Account\nA," + italian)).toThrow("include a column named IBAN");
  });

  it("retains rows with missing/blank IBAN cells so they appear as invalid", () => {
    expect(parseIbanInput("Reference,IBAN\nA,\nB," + italian + "\nC\n")).toEqual(["", italian, ""]);
    const results = parseIbanInput("IBAN,Reference\n,sample\n" + italian + ",sample").map(analyzeIban);
    expect(results).toHaveLength(2);
    expect(results[0].valid).toBe(false);
    expect(results[1].valid).toBe(true);
  });

  it.each(["", "\n\r\n", "\uFEFF", "IBAN\n"])("returns an empty list for an empty batch %j", (value) => {
    expect(parseIbanInput(value)).toEqual([]);
  });

  it("allows exactly 100 free rows and excludes the header from that limit", () => {
    const entries = Array.from({ length: 100 }, () => italian).join("\n");
    expect(parseIbanInput(entries)).toHaveLength(100);
    expect(parseIbanInput("IBAN\n" + entries)).toHaveLength(100);
    expect(() => parseIbanInput(entries + "\n" + dutch)).toThrow("100 entries");
    expect(() => parseIbanInput("IBAN\n" + entries + "\n" + dutch)).toThrow("100 entries");
  });

  it("supports configurable future account limits", () => {
    expect(parseIbanInput(italian + "\n" + dutch, 2)).toHaveLength(2);
    expect(() => parseIbanInput(italian + "\n" + dutch, 1)).toThrow("1 entries");
  });

  it("rejects oversized UTF-8 input by bytes, including multibyte characters", () => {
    expect(() => parseIbanInput("A".repeat(MAX_CSV_BYTES + 1))).toThrow("1 MB");
    expect(() => parseIbanInput("é".repeat(MAX_CSV_BYTES / 2 + 1))).toThrow("1 MB");
  });

  it.each([
    ['IBAN\n"unclosed', "unclosed quoted field"],
    ['IBAN\nunexpected"quote', "unexpected quote"],
    ['IBAN\n"value"trailing', "Unexpected text"],
  ])("rejects malformed CSV instead of quietly altering data", (csv, error) => {
    expect(() => parseIbanInput(csv)).toThrow(error);
  });
});

describe("safe CSV export", () => {
  it.each(["=1+1", "+SUM(A1)", "-1+2", "@SUM(A1)", "  =1", "\u0000\t=1", "\ttext", "\rtext", "\ntext"])("neutralizes spreadsheet formula/control prefix %j", (input) => {
    expect(csvCell(input)).toBe('"\'' + input.replace(/"/g, '""') + '"');
  });

  it("escapes quotes and preserves ordinary content, separators and line breaks", () => {
    expect(csvCell('Bank "A", Europe')).toBe('"Bank ""A"", Europe"');
    expect(csvCell("two\nlines")).toBe('"two\nlines"');
    expect(csvCell(italian)).toBe('"' + italian + '"');
  });

  it("exports headers, actual validation statuses, sourced bank data and row errors", () => {
    const invalid = "IT61X0542811101000000123456";
    const csv = resultsToCsv([analyzeIban(italian), analyzeIban(dutch), analyzeIban(invalid)]);
    expect(csv.startsWith('\uFEFF"IBAN","Country","Status","Bank","BIC","Error"\r\n')).toBe(true);
    expect(csv).toContain('"Italy","Valid","Bank information unavailable"');
    expect(csv).toContain('"Netherlands","Valid","ABN AMRO Bank N.V.","ABNANL2A"');
    expect(csv).toContain('"' + invalid + '","Italy","Invalid"');
    expect(csv).toContain("international check digits are incorrect");
    expect(parseIbanInput(csv)).toEqual([italian, dutch, invalid]);
  });

  it("neutralizes malicious invalid IBAN cells in exported reports", () => {
    const csv = resultsToCsv([analyzeIban('=HYPERLINK("https://invalid.example")')]);
    expect(csv).toContain('"\'=HYPERLINK(');
    expect(csv).not.toContain('\r\n"=HYPERLINK(');
  });
});
