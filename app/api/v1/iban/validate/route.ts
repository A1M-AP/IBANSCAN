import { handleIban } from "@/lib/server/api-handlers";
export const runtime = "nodejs";
export async function POST(request: Request) { return handleIban(request, "validate"); }

