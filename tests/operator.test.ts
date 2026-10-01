import { describe, expect, it } from "vitest";
import { contactEmail, operatorDetails } from "@/lib/operator";

describe("operator details", () => {
  const complete = { name: "Example S.r.l.", address: "Via Roma 1, 00100 Roma", email: "info@example.com" };
  it("stays a draft until identity, address and contact email are all configured", () => {
    expect(operatorDetails({})).toBeNull();
    expect(operatorDetails({ ...complete, address: " " })).toBeNull();
    expect(operatorDetails({ ...complete, email: "not-an-email" })).toBeNull();
    expect(operatorDetails(complete)).toEqual({ ...complete, vatId: undefined, pec: undefined, hosting: undefined });
  });
  it("normalises optional fields and rejects markup or malformed addresses", () => {
    expect(
      operatorDetails({ ...complete, vatId: " IT 01234567890 ", pec: "bad pec", hosting: "<b>x</b>" }),
    ).toMatchObject({ vatId: "IT 01234567890", pec: undefined, hosting: undefined });
    expect(operatorDetails({ ...complete, name: "<script>" })).toBeNull();
  });
  it("validates the public contact address", () => {
    expect(contactEmail(" help@example.com ")).toBe("help@example.com");
    expect(contactEmail("help@example.com?bcc=x@y.z")).toBeNull();
    expect(contactEmail(undefined)).toBeNull();
  });
});
