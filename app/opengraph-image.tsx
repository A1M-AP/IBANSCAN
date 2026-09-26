import { ImageResponse } from "next/og";
export const runtime = "nodejs";
export const alt = "IBANScan — Scan. Verify. Understand.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#f4f4f5", padding: 80, flexDirection: "column", color: "#18181b", fontFamily: "sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 15, fontSize: 34, fontWeight: 700 }}><svg width="43" height="43" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="#18181b"/><path d="M11 8H8v5m13-5h3v5M8 19v5h3m13-5v5h-3M12 12v8m4-10v12m4-10v8" stroke="#fafafa" strokeWidth="1.7" strokeLinecap="round"/></svg>IBANScan.</div><div style={{ display: "flex", marginTop: 90, fontSize: 78, fontWeight: 700, letterSpacing: -4 }}>Scan. Verify. Understand.</div><div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "#62626a" }}>A little clarity. For every IBAN.</div><div style={{ display: "flex", marginTop: 72, fontSize: 20 }}>PRIVATE BY DESIGN · INSTANT IBAN ANALYSIS</div></div>, size); }
