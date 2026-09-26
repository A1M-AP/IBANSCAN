import { afterEach, describe, it, expect, vi } from "vitest";
import { POST as ai } from "@/app/api/ai/route";
import { POST as validate } from "@/app/api/v1/iban/validate/route";
import { GET as health } from "@/app/api/health/route";
import { GET as banks } from "@/app/api/banks/route";
import { GET as rates } from "@/app/api/rates/route";
vi.mock("server-only", () => ({}));
afterEach(() => vi.unstubAllGlobals());
describe("simplified public services", () => {
  it("retires AI and business API without any provider request", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    for (const handler of [ai, validate]) {
      const r = await handler();
      expect(r.status).toBe(410);
      expect(r.headers.get("cache-control")).toBe("no-store");
    }
    expect(f).not.toHaveBeenCalled();
  });
  it("reports health without obsolete credential requirements", async () => {
    expect(await (await health()).json()).toMatchObject({
      status: "ok",
      validation: "available",
    });
  });
  it("returns sourced institutional data without receiving an account number", async () => {
    const r = await banks(
      new Request(
        "https://ibanscan.test/api/banks?country=IT&code=02008&branch=21703",
      ),
    );
    const { bank } = await r.json();
    expect(bank.name).toContain("UniCredit");
    expect(bank.bic).toBe("UNCRITMMXXX");
    expect(bank.branches[0].address).toContain("CESARE BATTISTI");
    expect(bank.office.address).toContain("Gae Aulenti");
    expect(bank.pec.email).toBe("reclami@pec.unicredit.eu");
  });
  it("rejects malformed identifiers and full IBAN searches", async () => {
    for (const p of [
      "country=IT&code=<script>",
      "q=a",
      "q=IT60X0542811101000000123456",
    ])
      expect(
        (await banks(new Request("https://ibanscan.test/api/banks?" + p)))
          .status,
      ).toBe(400);
  });
  it("returns no guessed match for an unknown bank", async () => {
    expect(
      await (
        await banks(
          new Request("https://ibanscan.test/api/banks?country=IT&code=99999"),
        )
      ).json(),
    ).toEqual({ bank: null });
  });
  it("handles unavailable ECB without invented rates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("private stack")));
    const r = await rates();
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("private stack");
  });
});
