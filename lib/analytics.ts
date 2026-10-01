export type AnalyticsEvent = "iban_scan" | "iban_valid" | "iban_invalid" | "tool_open" | "csv_upload";
type AnalyticsProvider = (event: AnalyticsEvent) => void;
let provider: AnalyticsProvider | undefined;
// Disabled by default. The contract deliberately accepts no payload, URL or IBAN.
export function configureAnalytics(nextProvider: AnalyticsProvider | undefined) { provider = nextProvider; }
export function track(event: AnalyticsEvent) {
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
  try { provider?.(event); } catch { /* Analytics must never interrupt validation. */ }
}
