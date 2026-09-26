import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aiConfigured, buildAiFacts, explainIban } from "@/lib/server/ai";
import { POST } from "@/app/api/ai/route";
vi.mock("server-only", () => ({}));
const iban = "NL91ABNA0417164300";
const response = (output: unknown, finishReason = "STOP") => Response.json({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(output) }] } }] });
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("APP_URL", "https://ibanscan.test");
  vi.stubEnv("AI_PROVIDER", "google");
  vi.stubEnv("GOOGLE_AI_API_KEY", "test-google-secret");
  vi.stubEnv("GOOGLE_AI_MODEL", "gemini-3.5-flash-lite");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("Google Gemini integration", () => {
  it("calls Google's fixed origin with a private header, structured output and redacted evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ intent: "explanation", facts: ["bank", "validation"] }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await explainIban(iban, `Explain ${iban} for person@example.com`, "it");
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
    expect(request.headers["x-goog-api-key"]).toBe("test-google-secret");
    expect(String(url)).not.toContain("test-google-secret");
    expect(request.body).not.toContain(iban);
    expect(request.body).not.toContain("0417164300");
    expect(request.body).not.toContain("person@example.com");
    const body = JSON.parse(request.body);
    expect(body.generationConfig.responseFormat.text.mimeType).toBe("APPLICATION_JSON");
    expect(body.generationConfig.responseFormat.text.schema.additionalProperties).toBe(false);
    expect(request.redirect).toBe("error");
    expect(result).toContain("ABN AMRO");
    expect(result).toContain("intestatario");
  });
  it.each(["en", "it", "de", "fr", "es"] as const)("grounds its answer in reviewed %s facts", async locale => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ intent: "explanation", facts: ["check_4", "bank"] })));
    const answer = await explainIban("IT61X0542811101000000123456", "Why invalid?", locale);
    const facts = buildAiFacts("IT61X0542811101000000123456", locale);
    expect(answer).toContain(facts.find(f => f.id === "check_4")!.text);
    expect(answer).toContain(facts.find(f => f.id === "ownership")!.text);
    expect(answer).not.toContain("ABN AMRO");
  });
  it.each(["MAX_TOKENS", "SAFETY", "RECITATION"])("rejects incomplete or blocked %s output", async finishReason => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ intent: "explanation", facts: ["bank"] }, finishReason)));
    await expect(explainIban(iban, "Bank?")).rejects.toMatchObject({ status: 502 });
  });
  it.each([{ intent: "explanation", facts: ["invented_bank"] }, { intent: "explanation", facts: ["bank"], answer: "Fake bank" }])("rejects fabricated claims", async output => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(output)));
    await expect(explainIban(iban, "Bank?")).rejects.toMatchObject({ status: 502 });
  });
  it("requires both credentials and a safe model, without calling any provider", async () => {
    const fetchMock=vi.fn();vi.stubGlobal("fetch",fetchMock);
    vi.stubEnv("GOOGLE_AI_API_KEY", "");
    expect(aiConfigured()).toBe(false);
    await expect(explainIban(iban,"Explain","fr")).rejects.toMatchObject({status:503});
    vi.stubEnv("GOOGLE_AI_API_KEY", "secret");vi.stubEnv("GOOGLE_AI_MODEL", "../other?key=secret");
    expect(aiConfigured()).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects unsupported client locales and cross-origin calls", async () => {
    const req=(locale:string,origin="https://ibanscan.test")=>new Request("https://ibanscan.test/api/ai",{method:"POST",headers:{Origin:origin,"Content-Type":"application/json"},body:JSON.stringify({iban,question:"Explain",locale})});
    expect((await POST(req("xx"))).status).toBe(400);
    expect((await POST(req("it","https://attacker.test"))).status).toBe(403);
  });
});
