import { createHash, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as validate } from "@/app/api/v1/iban/validate/route";
import { POST as analyze } from "@/app/api/v1/iban/analyze/route";
import { GET as search } from "@/app/api/v1/bank/search/route";
import { POST as askAi, GET as aiStatus } from "@/app/api/ai/route";
import { GET as health } from "@/app/api/health/route";
import { buildAiFacts, explainIban, redactQuestion } from "@/lib/server/ai";

vi.mock("server-only", () => ({}));

const key = "test_0123456789abcdefghijklmnopqrstuvwxyz";
const validIban = "IT60X0542811101000000123456";
let ipNumber = 0;

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("APP_URL", "https://ibanscan.test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "");
  vi.stubEnv("RATE_LIMIT_ALLOW_SINGLE_INSTANCE", "false");
  vi.stubEnv("RATE_LIMIT_HASH_SECRET", "test-secret-that-is-at-least-32-characters");
  vi.stubEnv("TRUSTED_IP_HEADER", "x-real-ip");
  vi.stubEnv("AI_API_KEY", "");
  vi.stubEnv("AI_PROVIDER", "openai-compatible");
  vi.stubEnv("GOOGLE_AI_API_KEY", "");
  vi.stubEnv("GOOGLE_AI_MODEL", "");
  vi.stubEnv("AI_MODEL", "");
  vi.stubEnv("AI_BASE_URL", "https://provider.test/v1");
  vi.stubEnv("AI_GLOBAL_DAILY_LIMIT", "200");
  vi.stubEnv("IBANSCAN_API_KEY_HASHES", JSON.stringify([{ id: randomUUID(), hash: createHash("sha256").update(key).digest("hex"), plan: "business" }]));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function request(body: unknown, token: string | null = key) {
  return new Request("https://ibanscan.test/api/v1/iban/validate", {
    method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

function aiRequest(body: unknown, origin = "https://ibanscan.test") {
  ipNumber++;
  return new Request("https://ibanscan.test/api/ai", {
    method: "POST", headers: { "Content-Type": "application/json", origin, "x-real-ip": `192.0.2.${ipNumber}` }, body: JSON.stringify(body),
  });
}

function providerReply(value: unknown, finishReason = "stop") {
  return Response.json({ choices: [{ finish_reason: finishReason, message: { content: JSON.stringify(value) } }] });
}

function configureAi() { vi.stubEnv("AI_API_KEY", "private-provider-key"); vi.stubEnv("AI_MODEL", "configured-model"); }

describe("authenticated validation API", () => {
  it("validates a real Italian fixture and returns non-cacheable JSON", async () => {
    const response = await validate(request({ iban: "it60 x054 2811 1010 0000 0123 456" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(true);
    expect(body.normalized).toBe(validIban);
    expect(body.country.code).toBe("IT");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("599");
  });

  it("returns actionable validation failures instead of a transport failure", async () => {
    const response = await validate(request({ iban: "IT61X0542811101000000123456" }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(false);
    expect(body.checks.find((check: { id: string }) => check.id === "checksum").passed).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it("returns structured extracted fields without inventing a bank", async () => {
    const response = await analyze(request({ iban: validIban }));
    const body = await response.json();
    expect(body.bankIdentifier).toBe("05428");
    expect(body.branchIdentifier).toBe("11101");
    expect(body.bank).toBeNull();
  });

  it("rejects missing, wrong and query-string credentials", async () => {
    expect((await validate(request({ iban: validIban }, null))).status).toBe(401);
    expect((await validate(request({ iban: validIban }, "invalid_0123456789abcdefghijklmnopqrstuvwxyz"))).status).toBe(401);
    const response = await search(new Request(`https://ibanscan.test/api/v1/bank/search?q=abna&key=${key}`));
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("fails closed when the API registry is absent or malformed", async () => {
    vi.stubEnv("IBANSCAN_API_KEY_HASHES", "");
    expect((await validate(request({ iban: validIban }))).status).toBe(503);
    vi.stubEnv("IBANSCAN_API_KEY_HASHES", "private-not-json-value");
    const response = await validate(request({ iban: validIban }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private-not-json-value");
  });

  it("does not accept client-supplied quota upgrades", async () => {
    vi.stubEnv("IBANSCAN_API_KEY_HASHES", JSON.stringify([{ id: randomUUID(), hash: createHash("sha256").update(key).digest("hex"), plan: "free" }]));
    const response = await validate(request({ iban: validIban, plan: "business" }));
    expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
  });

  it("rejects ambiguous duplicate key configuration", async () => {
    const hash = createHash("sha256").update(key).digest("hex");
    vi.stubEnv("IBANSCAN_API_KEY_HASHES", JSON.stringify([{ id: "first", hash, plan: "free" }, { id: "second", hash, plan: "business" }]));
    expect((await validate(request({ iban: validIban }))).status).toBe(503);
  });

  it("rejects invalid types and oversized input", async () => {
    expect((await validate(request({ iban: 123 }))).status).toBe(400);
    expect((await validate(request({ iban: "X".repeat(129) }))).status).toBe(400);
    expect((await validate(request({ iban: validIban, extra: "x".repeat(5000) }))).status).toBe(413);
  });

  it("searches only available bank mappings", async () => {
    const response = await search(new Request("https://ibanscan.test/api/v1/bank/search?q=ABNA&country=NL", { headers: { Authorization: `Bearer ${key}` } }));
    const body = await response.json();
    expect(body.banks[0].bic).toBe("ABNANL2A");
    const empty = await search(new Request("https://ibanscan.test/api/v1/bank/search?q=not-a-known-bank", { headers: { Authorization: `Bearer ${key}` } }));
    expect(await empty.json()).toEqual({ banks: [], count: 0, message: "Bank information unavailable" });
  });

  it("rejects malformed bank search parameters", async () => {
    const response = await search(new Request("https://ibanscan.test/api/v1/bank/search?q=a&country=ITALY", { headers: { Authorization: `Bearer ${key}` } }));
    expect(response.status).toBe(400);
  });
});

describe("grounded AI backend", () => {
  it("reports missing credentials honestly and makes no external request", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    expect(await (await aiStatus()).json()).toEqual({ available: false });
    const response = await askAi(aiRequest({ iban: validIban, question: "Explain this result" }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("not configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires same-origin requests", async () => {
    configureAi();
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    expect((await askAi(aiRequest({ iban: validIban, question: "Explain" }, "https://attacker.test"))).status).toBe(403);
    expect((await askAi(aiRequest({ iban: validIban, question: "Explain" }, ""))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops repeated AI requests before another paid provider call", async () => {
    configureAi();
    vi.stubEnv("RATE_LIMIT_HASH_SECRET", randomUUID());
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(providerReply({ intent: "explanation", facts: ["validation"] })));
    vi.stubGlobal("fetch", fetchMock);
    const makeRequest = () => new Request("https://ibanscan.test/api/ai", {
      method: "POST", headers: { "Content-Type": "application/json", origin: "https://ibanscan.test", "x-real-ip": "198.51.100.1" },
      body: JSON.stringify({ iban: validIban, question: "Explain" }),
    });
    for (let i = 0; i < 3; i++) expect((await askAi(makeRequest())).status).toBe(200);
    const limited = await askAi(makeRequest());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("applies a shared AI spending limit across different visitors", async () => {
    configureAi();
    vi.stubEnv("RATE_LIMIT_HASH_SECRET", randomUUID());
    vi.stubEnv("AI_GLOBAL_DAILY_LIMIT", "1");
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(providerReply({ intent: "explanation", facts: ["validation"] })));
    vi.stubGlobal("fetch", fetchMock);
    expect((await askAi(aiRequest({ iban: validIban, question: "Explain" }))).status).toBe(200);
    expect((await askAi(aiRequest({ iban: validIban, question: "Explain" }))).status).toBe(429);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("uses a real provider response to select verified facts without exposing account data", async () => {
    configureAi();
    const fetchMock = vi.fn().mockResolvedValue(providerReply({ intent: "explanation", facts: ["validation", "country", "bank"] }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await askAi(aiRequest({ iban: validIban, question: `Explain ${validIban} and account 123456` }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.answer).toContain("Bank information unavailable");
    expect(body.answer).toContain("does not confirm account ownership");
    expect(body.grounding).toBe("verified-facts");
    expect(fetchMock).toHaveBeenCalledOnce();
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.model).toBe("configured-model");
    expect(sent.store).toBe(false);
    expect(sent.response_format.json_schema.strict).toBe(true);
    expect(JSON.stringify(sent)).not.toContain(validIban);
    expect(JSON.stringify(sent)).not.toContain("000000123456");
    expect(JSON.stringify(sent)).not.toContain("123456");
    expect(JSON.stringify(body)).not.toContain("private-provider-key");
  });

  it("rejects fabricated facts and model-authored extra prose", async () => {
    configureAi();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(providerReply({ intent: "explanation", facts: ["made_up_bank"] })));
    await expect(explainIban(validIban, "What bank?" )).rejects.toMatchObject({ status: 502 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(providerReply({ intent: "explanation", facts: ["bank"], answer: "Fabricated Bank" })));
    await expect(explainIban(validIban, "What bank?" )).rejects.toMatchObject({ status: 502 });
  });

  it("safely handles provider errors, refusals, and truncated output", async () => {
    configureAi();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("secret-provider-error", { status: 500 })));
    const response = await askAi(aiRequest({ iban: validIban, question: "Explain" }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("secret-provider-error");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(providerReply({ intent: "explanation", facts: ["country"] }, "length")));
    await expect(explainIban(validIban, "Explain")).rejects.toMatchObject({ status: 502 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ choices: [{ finish_reason: "stop", message: { refusal: "no", content: "{}" } }] })));
    await expect(explainIban(validIban, "Explain")).rejects.toMatchObject({ status: 502 });
  });

  it("bounds provider output and rejects insecure upstream configuration", async () => {
    configureAi();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("x".repeat(33_000))));
    await expect(explainIban(validIban, "Explain")).rejects.toMatchObject({ status: 502 });
    vi.stubEnv("AI_BASE_URL", "http://public-provider.test/v1");
    await expect(explainIban(validIban, "Explain")).rejects.toMatchObject({ status: 503 });
  });

  it("redacts identifiers and includes the exact failure in grounded evidence", () => {
    expect(redactQuestion(`Explain ${validIban}; email me at owner@example.com; number 1234`)).not.toMatch(/1234|owner@example\.com|IT60/);
    const facts = buildAiFacts("IT61X0542811101000000123456");
    expect(facts.find(fact => fact.id === "check_4")?.text).toContain("not passed");
    expect(JSON.stringify(facts)).not.toContain("IT61X0542811101000000123456");
    expect(facts.find(fact => fact.id === "bank")?.text).toContain("unavailable");
  });

  it("returns configuration status without secret values", async () => {
    configureAi();
    const response = await health();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.ai).toBe("configured");
    expect(JSON.stringify(body)).not.toContain("private-provider-key");
    expect(JSON.stringify(body)).not.toContain(key);
  });
});
