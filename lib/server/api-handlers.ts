import "server-only";
import { analyzeIban } from "@/lib/iban";
import { searchBanks } from "@/lib/banks";
import { authenticateApi } from "@/lib/server/auth";
import { errorResponse, HttpError, jsonResponse, readJson, requireIban } from "@/lib/server/http";

export async function handleIban(request: Request, mode: "validate" | "analyze") {
  try {
    const { headers } = await authenticateApi(request);
    const body = await readJson(request);
    const result = analyzeIban(requireIban(body));
    const value = mode === "analyze" ? result : {
      valid: result.valid,
      normalized: result.normalized,
      country: result.country ? { code: result.country.code, name: result.country.name } : null,
      checks: result.checks,
      errors: result.errors,
    };
    return jsonResponse(value, 200, headers);
  } catch (error) { return errorResponse(error); }
}

export async function handleBankSearch(request: Request) {
  try {
    const { headers } = await authenticateApi(request);
    const params = new URL(request.url).searchParams;
    const query = params.get("q")?.trim() || "";
    const country = params.get("country")?.toUpperCase();
    if (query.length < 2 || query.length > 80 || (country && !/^[A-Z]{2}$/.test(country))) {
      throw new HttpError(400, "Provide q (2–80 characters) and optionally a two-letter country code.");
    }
    const banks = searchBanks(query, country).slice(0, 20);
    return jsonResponse({ banks, count: banks.length, message: banks.length ? null : "Bank information unavailable" }, 200, headers);
  } catch (error) { return errorResponse(error); }
}
