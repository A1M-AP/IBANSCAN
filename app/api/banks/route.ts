import { directoryLookup, directorySearch } from "@/lib/bank-directory";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const q = p.get("q");
  let body: unknown;
  if (q !== null) {
    if (
      q.trim().length < 2 ||
      q.length > 100 ||
      /[<>\x00-\x1f]/.test(q) ||
      /^[A-Z]{2}\d{2}[A-Z0-9 ]{10,}$/i.test(q)
    )
      return Response.json(
        { error: "Search by bank name, BIC or bank code." },
        { status: 400 },
      );
    body = { banks: directorySearch(q) };
  } else {
    const country = p.get("country") || "",
      code = p.get("code") || "",
      branch = p.get("branch") || "";
    if (
      !/^[A-Z]{2}$/.test(country) ||
      !/^[A-Z0-9]{1,12}$/.test(code) ||
      (branch && !/^[A-Z0-9]{1,12}$/.test(branch))
    )
      return Response.json(
        { error: "Invalid bank identifier." },
        { status: 400 },
      );
    body = { bank: directoryLookup(country, code, branch || undefined) };
  }
  return Response.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
