import { afterEach, describe, it, expect, vi } from "vitest";
import { POST as ai } from "@/app/api/ai/route";
import { POST as validate } from "@/app/api/v1/iban/validate/route";
import { GET as health } from "@/app/api/health/route";
import { GET as banks } from "@/app/api/banks/route";
import { GET as rates } from "@/app/api/rates/route";
import { getReferenceRates, resetRatesCache } from "@/lib/rates-cache";
vi.mock("server-only", () => ({}));
afterEach(() => {
  vi.unstubAllGlobals();
  resetRatesCache();
});
const ecbXml = `<Cube time='2026-09-25'>${["USD", "GBP", "JPY", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF"]
  .map((c) => `<Cube currency='${c}' rate='1.5'/>`)
  .join("")}</Cube>`;
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
  it("downloads ECB rates once per hour and shares concurrent requests", async () => {
    const f = vi.fn().mockImplementation(async () => new Response(ecbXml));
    vi.stubGlobal("fetch", f);
    const [a, b] = await Promise.all([rates(), rates()]);
    expect(a.status).toBe(200);
    expect((await b.json()).date).toBe("2026-09-25");
    await rates();
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("reuses a recent verified publication while the ECB is unreachable", async () => {
    const t = Date.UTC(2026, 8, 25, 12);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(ecbXml)));
    await getReferenceRates(t);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("down")));
    const later = await getReferenceRates(t + 2 * 60 * 60 * 1000);
    expect(later).toMatchObject({ stale: true, data: { date: "2026-09-25" } });
    await expect(getReferenceRates(t + 5 * 24 * 60 * 60 * 1000)).rejects.toThrow();
  });
});
