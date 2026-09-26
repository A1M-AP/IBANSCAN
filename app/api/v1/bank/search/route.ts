import { handleBankSearch } from "@/lib/server/api-handlers";
export const runtime = "nodejs";
export async function GET(request: Request) { return handleBankSearch(request); }

