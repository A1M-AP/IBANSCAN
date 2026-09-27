import { it, expect } from "vitest";
import registry from "../data/italian-banks.json";
import index from "../data/italian-bank-names.json";
import { lookupBank } from "../lib/banks";
it("local bank-name index stays in sync with the official register", () => {
  expect(index.source).toBe(registry.source);
  expect(index.retrievedAt).toBe(registry.retrievedAt);
  expect(index.names).toEqual(
    Object.fromEntries(registry.records.map((r) => [r.bankIdentifier, r.name])),
  );
  for (const r of registry.records)
    expect(lookupBank("IT", r.bankIdentifier)?.name).toBeTruthy();
  expect(lookupBank("IT", "99999")).toBeNull();
  expect(lookupBank("XX", "01030")).toBeNull();
});
