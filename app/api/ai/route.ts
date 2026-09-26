import { plans } from "@/lib/plans";
import { aiConfigured, explainIban } from "@/lib/server/ai";
import { aiCopy } from "@/lib/server/ai-messages";
import { locales, type Locale } from "@/lib/i18n";
import { errorResponse, HttpError, jsonResponse, readJson, requireIban, requireSameOrigin } from "@/lib/server/http";
import { consumeRateLimit, rateHeaders, requestIdentity } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function GET() { return jsonResponse({ available: aiConfigured() }); }

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readJson(request);
    if (body.locale !== undefined && (typeof body.locale !== "string" || !locales.includes(body.locale as Locale))) {
      throw new HttpError(400, "Choose a supported language: en, it, de, es or fr.");
    }
    const locale = (body.locale || "en") as Locale;
    const copy = aiCopy(locale);
    if (!aiConfigured()) throw new HttpError(503, copy.notConfigured);
    const identity = requestIdentity(request);
    await consumeRateLimit("ai-minute", identity, 3, 60_000);
    const iban = requireIban(body);
    if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 500) {
      throw new HttpError(400, copy.invalidQuestion);
    }
    const daily = await consumeRateLimit("ai-day", identity, plans.free.aiPerDay, 86_400_000);
    const configuredBudget = Number(process.env.AI_GLOBAL_DAILY_LIMIT || "200");
    if (!Number.isSafeInteger(configuredBudget) || configuredBudget < 1 || configuredBudget > 100_000) throw new HttpError(503, copy.notConfigured);
    await consumeRateLimit("ai-global", "all", configuredBudget, 86_400_000);
    const answer = await explainIban(iban, body.question.trim(), locale);
    return jsonResponse({ answer, grounding: "verified-facts" }, 200, rateHeaders(daily));
  } catch (error) { return errorResponse(error); }
}
