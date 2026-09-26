import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, rateLimitConfigured, requestIdentity } from "@/lib/server/rate-limit";
import { errorResponse, HttpError, readJson, requireSameOrigin } from "@/lib/server/http";

vi.mock("server-only", () => ({}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "");
  vi.stubEnv("RATE_LIMIT_ALLOW_SINGLE_INSTANCE", "false");
  vi.stubEnv("RATE_LIMIT_HASH_SECRET", "test-secret-that-is-at-least-32-characters");
  vi.stubEnv("TRUSTED_IP_HEADER", "");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("abuse protection", () => {
  it("enforces the quota under concurrent requests", async () => {
    const id = randomUUID();
    const results = await Promise.allSettled(Array.from({ length: 12 }, () => consumeRateLimit("test", id, 5, 60_000)));
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(5);
    const failure = results.find(result => result.status === "rejected") as PromiseRejectedResult;
    expect(failure.reason.status).toBe(429);
    expect(Number(failure.reason.headers["Retry-After"])).toBeGreaterThan(0);
  });

  it("expires counters at the end of a window", async () => {
    vi.useFakeTimers();
    const id = randomUUID();
    await consumeRateLimit("test", id, 1, 1000);
    await expect(consumeRateLimit("test", id, 1, 1000)).rejects.toMatchObject({ status: 429 });
    vi.advanceTimersByTime(1001);
    expect((await consumeRateLimit("test", id, 1, 1000)).remaining).toBe(0);
  });

  it("ignores spoofed forwarding headers unless explicitly trusted", () => {
    const a = requestIdentity(new Request("https://ibanscan.test", { headers: { "x-forwarded-for": "1.2.3.4" } }));
    const b = requestIdentity(new Request("https://ibanscan.test", { headers: { "x-forwarded-for": "9.8.7.6" } }));
    expect(a).toBe(b);
    vi.stubEnv("TRUSTED_IP_HEADER", "x-real-ip");
    const trusted = requestIdentity(new Request("https://ibanscan.test", { headers: { "x-real-ip": "192.0.2.12" } }));
    expect(trusted).not.toBe(a);
    expect(trusted).not.toContain("192.0.2.12");
    const chained = requestIdentity(new Request("https://ibanscan.test", { headers: { "x-real-ip": "192.0.2.12, 10.0.0.1" } }));
    expect(chained).toBe(a);
  });

  it("requires production distributed storage or an explicit single-instance choice", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(rateLimitConfigured()).toBe(false);
    await expect(consumeRateLimit("test", randomUUID(), 1, 60_000)).rejects.toMatchObject({ status: 503 });
    vi.stubEnv("RATE_LIMIT_ALLOW_SINGLE_INSTANCE", "true");
    expect(rateLimitConfigured()).toBe(true);
    expect((await consumeRateLimit("test", randomUUID(), 1, 60_000)).remaining).toBe(0);
    vi.stubEnv("RATE_LIMIT_HASH_SECRET", "");
    await expect(consumeRateLimit("test", randomUUID(), 1, 60_000)).rejects.toMatchObject({ status: 503 });
  });

  it("uses atomic Redis increments and never sends raw identity data", async () => {
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "https://redis.test");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "redis-secret");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ result: [2, 58_000] }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await consumeRateLimit("api", "customer-sensitive-id", 10, 60_000)).remaining).toBe(8);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body[0]).toBe("EVAL");
    expect(body[1]).toContain("PEXPIRE");
    expect(JSON.stringify(body)).not.toContain("customer-sensitive-id");
    expect(fetchMock.mock.calls[0][1].redirect).toBe("error");
  });

  it("fails closed on Redis failure even when local fallback is enabled", async () => {
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "https://redis.test");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "redis-secret");
    vi.stubEnv("RATE_LIMIT_ALLOW_SINGLE_INSTANCE", "true");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private service failure")));
    await expect(consumeRateLimit("test", randomUUID(), 10, 60_000)).rejects.toMatchObject({ status: 503, message: "Request protection is temporarily unavailable." });
  });

  it("rejects partial Redis configuration and invalid counter replies", async () => {
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "https://redis.test");
    expect(rateLimitConfigured()).toBe(false);
    await expect(consumeRateLimit("test", randomUUID(), 10, 60_000)).rejects.toMatchObject({ status: 503 });
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "secret");
    expect(rateLimitConfigured()).toBe(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ result: [1, -1] })));
    await expect(consumeRateLimit("test", randomUUID(), 10, 60_000)).rejects.toMatchObject({ status: 503 });
  });

  it("reports invalid Redis endpoints as unconfigured", () => {
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "http://redis.test");
    vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "secret");
    expect(rateLimitConfigured()).toBe(false);
    vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "not a URL");
    expect(rateLimitConfigured()).toBe(false);
  });
});

describe("request boundary", () => {
  it("bounds bodies even without a Content-Length header", async () => {
    const request = new Request("https://ibanscan.test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: "x".repeat(5000) }) });
    expect(request.headers.has("Content-Length")).toBe(false);
    await expect(readJson(request)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects wrong content types and non-object JSON", async () => {
    await expect(readJson(new Request("https://ibanscan.test", { method: "POST", body: "hello" }))).rejects.toMatchObject({ status: 415 });
    for (const body of ["null", "[]", "false", "{broken"]) {
      await expect(readJson(new Request("https://ibanscan.test", { method: "POST", headers: { "Content-Type": "application/json" }, body }))).rejects.toMatchObject({ status: 400 });
    }
  });

  it("checks configured origin rather than trusting the request Host", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://ibanscan.com");
    expect(() => requireSameOrigin(new Request("https://attacker.test/api/ai", { headers: { Origin: "https://attacker.test" } }))).toThrow(HttpError);
    expect(() => requireSameOrigin(new Request("https://internal.test/api/ai", { headers: { Origin: "https://ibanscan.com" } }))).not.toThrow();
    expect(() => requireSameOrigin(new Request("https://ibanscan.com/api/ai", { headers: { Origin: "https://ibanscan.com", "sec-fetch-site": "cross-site" } }))).toThrow(HttpError);
  });

  it("never exposes unexpected exception messages or stack traces", async () => {
    const response = errorResponse(new Error("database-password=private"));
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain("private");
    expect(text).not.toContain("stack");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
