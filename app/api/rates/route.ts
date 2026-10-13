import { getReferenceRates } from "@/lib/rates-cache";
export async function GET() {
  try {
    const { data, stale } = await getReferenceRates();
    const maxAge = stale ? 60 : 300;
    return Response.json(data, {
      headers: {
        "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
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
