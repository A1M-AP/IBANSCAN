import { GoogleAd } from "./google-ad";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n-server";
import { googleCmpUrl } from "@/lib/advertising";
import { productCopy } from "@/locales/product";
export type AdPlacement = "home" | "tool" | "result" | "resource";
export type AdProvider = { render: (placement: AdPlacement) => ReactNode };
/** Nothing renders until AdSense and a certified consent provider are configured; no ad network loads without consent. */
export async function AdSlot({
  placement,
  provider,
  adFree = false,
}: {
  placement: AdPlacement;
  provider?: AdProvider;
  adFree?: boolean;
}) {
  if (adFree) return null;
  const t = productCopy[await getLocale()];
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const slots = {
    home: process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT,
    tool: process.env.NEXT_PUBLIC_ADSENSE_TOOL_SLOT,
    result: process.env.NEXT_PUBLIC_ADSENSE_TOOL_SLOT,
    resource: process.env.NEXT_PUBLIC_ADSENSE_RESOURCE_SLOT,
  };
  const slot = slots[placement] || "";
  const placeholder = (
    <div className="ad-reserved">
      <span>{t.adSpace}</span>
      <small>{t.adNote}</small>
    </div>
  );
  const configured =
    /^ca-pub-\d{16}$/.test(client) &&
    /^\d{6,20}$/.test(slot) &&
    googleCmpUrl(process.env.NEXT_PUBLIC_GOOGLE_CMP_URL);
  // An empty "advertising space" box makes an unconfigured site look unfinished.
  if (!provider && !configured) return null;
  return (
    <aside className="ad-slot" data-placement={placement} aria-label={t.ad}>
      <span className="ad-label">{t.ad}</span>
      {provider ? (
        provider.render(placement)
      ) : (
        <GoogleAd client={client} slot={slot} placeholder={placeholder} />
      )}
    </aside>
  );
}
