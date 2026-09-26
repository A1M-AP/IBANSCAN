export type TcfConsent = {
  eventStatus?: string;
  listenerId?: number;
  gdprApplies?: boolean;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
};
/** Conservative opt-in everywhere; an absent/failed CMP never authorizes an ad. */
export function hasAdConsent(data: TcfConsent): boolean {
  return (
    ["tcloaded", "useractioncomplete"].includes(data.eventStatus || "") &&
    data.vendor?.consents?.[755] === true &&
    [1, 3, 4].every((p) => data.purpose?.consents?.[p] === true)
  );
}
export function googleCmpUrl(value: string | undefined): string | null {
  try {
    const u = new URL(value || "");
    return u.origin === "https://fundingchoicesmessages.google.com" &&
      !u.username &&
      !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
