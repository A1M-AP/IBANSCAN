import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { HttpError } from "@/lib/server/http";

type Entry = { count: number; reset: number };
type RateResult = { remaining: number; reset: number; limit: number };
const memory = new Map<string, Entry>();
const developmentSalt = randomBytes(32).toString("hex");
const maxMemoryEntries = 10_000;

function privacySalt() {
  const salt = process.env.RATE_LIMIT_HASH_SECRET;
  if (process.env.NODE_ENV === "production" && (!salt || salt.length < 32)) {
    throw new HttpError(503, "Request protection is not configured yet.");
  }
  return salt || developmentSalt;
}

export function requestIdentity(request: Request): string {
  // Only trust a header that the deployment's ingress always overwrites.
  // Without one, anonymous requests share a conservative bucket.
  const header = process.env.TRUSTED_IP_HEADER;
  const supplied = header ? request.headers.get(header) : null;
  const ip = supplied?.trim();
  const identity = ip && isIP(ip) ? ip : "shared-anonymous";
  return createHmac("sha256", privacySalt()).update(identity).digest("hex");
}

export function rateLimitConfigured() {
  const endpoint = process.env.RATE_LIMIT_REDIS_REST_URL;
  const token = process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  let remote = false;
  if (endpoint || token) {
    if (!endpoint || !token) return false;
    try {
      const url = new URL(endpoint);
      remote = url.protocol === "https:" && !url.username && !url.password;
      if (!remote) return false;
    } catch { return false; }
  }
  const local = process.env.NODE_ENV !== "production" || process.env.RATE_LIMIT_ALLOW_SINGLE_INSTANCE === "true";
  const salt = process.env.NODE_ENV !== "production" || (process.env.RATE_LIMIT_HASH_SECRET?.length || 0) >= 32;
  return salt && (remote || local);
}

const incrementScript = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]); end; return {n,redis.call('PTTL',KEYS[1])}";

export async function consumeRateLimit(namespace: string, identity: string, limit: number, windowMs: number): Promise<RateResult> {
  const now = Date.now();
  const key = `ibanscan:limit:${namespace}:${createHmac("sha256", privacySalt()).update(identity).digest("hex")}`;
  const endpoint = process.env.RATE_LIMIT_REDIS_REST_URL;
  const token = process.env.RATE_LIMIT_REDIS_REST_TOKEN;
  let count: number;
  let reset: number;
  if (endpoint || token) {
    if (!endpoint || !token) throw new HttpError(503, "Request protection is temporarily unavailable.");
    try {
      const url = new URL(endpoint);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error("configuration");
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", incrementScript, "1", key, String(windowMs)]),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(4_000),
      });
      if (!response.ok) throw new Error("unavailable");
      const body = await response.json() as { result?: unknown; error?: unknown };
      if (body.error || !Array.isArray(body.result) || body.result.length !== 2) throw new Error("invalid response");
      count = Number(body.result[0]);
      const ttl = Number(body.result[1]);
      if (!Number.isSafeInteger(count) || count < 1 || !Number.isFinite(ttl) || ttl < 0 || ttl > windowMs) throw new Error("invalid count");
      reset = now + ttl;
    } catch {
      // Never fall back to per-instance counters after a distributed failure.
      throw new HttpError(503, "Request protection is temporarily unavailable.");
    }
  } else {
    if (process.env.NODE_ENV === "production" && process.env.RATE_LIMIT_ALLOW_SINGLE_INSTANCE !== "true") {
      throw new HttpError(503, "Request protection is not configured yet.");
    }
    let entry = memory.get(key);
    if (!entry || entry.reset <= now) {
      if (memory.size >= maxMemoryEntries) {
        for (const [oldKey, oldEntry] of memory) if (oldEntry.reset <= now) memory.delete(oldKey);
        if (memory.size >= maxMemoryEntries && !memory.has(key)) throw new HttpError(503, "Request protection is temporarily unavailable.");
      }
      entry = { count: 0, reset: now + windowMs };
      memory.set(key, entry);
    }
    entry.count += 1;
    count = entry.count;
    reset = entry.reset;
  }
  if (count > limit) {
    throw new HttpError(429, "You've reached the current request limit. Please try again later.", {
      "Retry-After": String(Math.max(1, Math.ceil((reset - now) / 1000))),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": "0",
    });
  }
  return { remaining: Math.max(0, limit - count), reset, limit };
}

export function rateHeaders(result: RateResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
}
