import "server-only";
import { ECB_RATES_URL, parseEcbRates, type ExchangeRates } from "./exchange-rates";

/** The ECB publishes once per working day; refreshing hourly is plenty. */
export const RATES_FRESH_MS = 60 * 60 * 1000;
/** A previously verified ECB publication may be served while the ECB is unreachable. */
export const RATES_STALE_MS = 4 * 24 * 60 * 60 * 1000;

let cached: { data: ExchangeRates; fetchedAt: number } | null = null;
let inflight: Promise<ExchangeRates> | null = null;

async function download(): Promise<ExchangeRates> {
  const upstream = await fetch(ECB_RATES_URL, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!upstream.ok) throw new Error("Upstream unavailable");
  return parseEcbRates(await upstream.text());
}

/** Test hook: forget the in-memory publication. */
export function resetRatesCache() {
  cached = null;
  inflight = null;
}

/**
 * Returns the latest ECB publication, downloading at most once per hour per instance.
 * When the ECB is unreachable, a verified publication up to four days old is reused;
 * its own reference date is always displayed, so it is never presented as today's.
 */
export async function getReferenceRates(
  now = Date.now(),
): Promise<{ data: ExchangeRates; stale: boolean }> {
  if (cached && now - cached.fetchedAt < RATES_FRESH_MS)
    return { data: cached.data, stale: false };
  try {
    // Concurrent visitors share one upstream request.
    inflight ??= download().finally(() => {
      inflight = null;
    });
    const data = await inflight;
    cached = { data, fetchedAt: now };
    return { data, stale: false };
  } catch (error) {
    if (cached && now - cached.fetchedAt < RATES_STALE_MS)
      return { data: cached.data, stale: true };
    throw error;
  }
}
