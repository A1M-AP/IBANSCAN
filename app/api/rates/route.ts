import { ECB_RATES_URL, parseEcbRates } from "@/lib/exchange-rates";
export async function GET() {
  try {
    const upstream = await fetch(ECB_RATES_URL, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new Error("Upstream unavailable");
    const text = await upstream.text();
    const data = parseEcbRates(text);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Reference rates temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
