import { describe, expect, it } from "vitest";
import { isBicFormat } from "@/lib/bic";
describe("ISO 9362 syntax", () => {
  it("supports eight and eleven characters and alphanumeric business prefixes", () => {
    expect(isBicFormat("ABNANL2A")).toBe(true);
    expect(isBicFormat("ABNANL2AXXX")).toBe(true);
    expect(isBicFormat("Q1B2DEFF")).toBe(true); // Synthetic syntax fixture, not an allocated BIC.
  });
  it("rejects incorrect lengths, non-letter country codes and punctuation", () => {
    for (const value of ["ABNANL2", "ABNANL2AX", "ABNA122A", "ABNANL2A!!!!", "ABNA NL2A", ""]) expect(isBicFormat(value)).toBe(false);
  });
});
