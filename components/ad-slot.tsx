import type { ReactNode } from "react";
import { getServerUi } from "@/lib/i18n-server";
export type AdPlacement = "home" | "tool" | "result" | "resource";
export type AdProvider = { render: (placement: AdPlacement) => ReactNode };
// No ad provider or third-party tracking is enabled in the first release.
// Future providers must integrate consent and update the strict CSP before use.
export async function AdSlot({ placement, provider, adFree = false }: { placement: AdPlacement; provider?: AdProvider; adFree?: boolean }) {
  const ui = await getServerUi();
  if (!provider || adFree) return null;
  return <aside className="ad-slot" aria-label={ui.shell.advertisement}><span>{ui.shell.advertisement}</span>{provider.render(placement)}</aside>;
}
