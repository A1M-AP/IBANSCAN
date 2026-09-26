import { aiConfigured } from "@/lib/server/ai";
import { apiConfigured } from "@/lib/server/auth";
import { jsonResponse } from "@/lib/server/http";
import { rateLimitConfigured } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const protection = rateLimitConfigured();
  return jsonResponse({
    status: "ok",
    validation: "available",
    ai: aiConfigured() && protection ? "configured" : "unconfigured",
    api: apiConfigured() && protection ? "configured" : "unconfigured",
    requestProtection: protection ? "configured" : "unconfigured",
    note: "Configuration status only; external provider availability is checked on use.",
  });
}

