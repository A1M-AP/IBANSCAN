import "server-only";

/** Never place input, credentials, or provider responses into public errors. */
export class HttpError extends Error {
  constructor(public status: number, message: string, public headers: Record<string, string> = {}) {
    super(message);
    this.name = "HttpError";
  }
}

export function jsonResponse(value: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
      ...headers,
    },
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return jsonResponse({ error: error.message }, error.status, error.headers);
  return jsonResponse({ error: "The request could not be completed. Please try again later." }, 500);
}

/** Streaming bounds apply even when a client omits or falsifies Content-Length. */
export async function readJson(request: Request, maxBytes = 4_096): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new HttpError(415, "Use application/json for this request.");
  }
  const size = request.headers.get("content-length");
  if (size !== null && (!/^\d+$/.test(size) || Number(size) > maxBytes)) {
    throw new HttpError(413, "The request is too large.");
  }
  if (!request.body) throw new HttpError(400, "A JSON request body is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "The request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("shape");
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Enter a valid JSON object.");
  }
}

export function requireIban(body: Record<string, unknown>): string {
  if (typeof body.iban !== "string" || !body.iban.trim() || body.iban.length > 128) {
    throw new HttpError(400, "Provide an IBAN string between 1 and 128 characters.");
  }
  return body.iban;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NODE_ENV === "production" && !siteUrl) {
    throw new HttpError(503, "This service is not configured yet.");
  }
  let expected: string;
  try {
    expected = new URL(siteUrl || request.url).origin;
  } catch {
    throw new HttpError(503, "This service is not configured yet.");
  }
  if (!origin || origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new HttpError(403, "This request must originate from IBANScan.");
  }
}
