import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { plans, type PlanId } from "@/lib/plans";
import { HttpError } from "@/lib/server/http";
import { consumeRateLimit, rateHeaders, requestIdentity } from "@/lib/server/rate-limit";

type ApiPrincipal = { id: string; hash: string; plan: PlanId };

/** Store SHA-256 digests of high-entropy API keys, never their cleartext values. */
function configuredPrincipals(): ApiPrincipal[] {
  const config = process.env.IBANSCAN_API_KEY_HASHES;
  if (!config) throw new HttpError(503, "The API is not configured yet.");
  try {
    const parsed: unknown = JSON.parse(config);
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > 1_000) throw new Error("shape");
    const ids = new Set<string>();
    const hashes = new Set<string>();
    for (const item of parsed) {
      if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^[\w-]{1,80}$/.test(item.id)
        || ids.has(item.id) || typeof item.hash !== "string" || !/^[a-f0-9]{64}$/i.test(item.hash) || hashes.has(item.hash.toLowerCase())
        || !["free", "pro", "business"].includes(item.plan)) throw new Error("shape");
      ids.add(item.id);
      hashes.add(item.hash.toLowerCase());
    }
    return parsed as ApiPrincipal[];
  } catch {
    throw new HttpError(503, "The API is not configured yet.");
  }
}

export function apiConfigured() {
  try { return configuredPrincipals().length > 0; } catch { return false; }
}

export async function authenticateApi(request: Request) {
  const principals = configuredPrincipals();
  const authorization = request.headers.get("authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]{32,256})$/i.exec(authorization);
  const candidate = createHash("sha256").update(match?.[1] || "invalid").digest();
  let principal: ApiPrincipal | undefined;
  for (const item of principals) {
    if (timingSafeEqual(candidate, Buffer.from(item.hash, "hex")) && match) principal = item;
  }
  if (!principal) {
    await consumeRateLimit("api-auth", requestIdentity(request), 30, 60_000);
    throw new HttpError(401, "A valid API key is required.", { "WWW-Authenticate": "Bearer" });
  }
  const rate = await consumeRateLimit("api", principal.id, plans[principal.plan].apiPerMinute, 60_000);
  return { principal: { id: principal.id, plan: principal.plan }, headers: rateHeaders(rate) };
}
