import { Scanner } from "@/components/scanner";
import { Icon } from "@/components/icon";
import { getServerUi, getLocale } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() { const ui = await getServerUi(); return pageMetadata(ui.aiPage.metadataTitle, ui.aiPage.metadataDescription, "/ai", await getLocale()); }
export default async function AiPage() {
  const ui = await getServerUi(); return <div className="page-shell tool-page"><div className="page-heading centered"><span className="eyebrow"><Icon name="sparkles" size={17}/>{ui.aiPage.eyebrow}</span><h1>{ui.ai.pageTitle}</h1><p>{ui.ai.pageDescription}</p></div><Scanner/><div className="trust-note"><Icon name="shield"/><p>{ui.home.aiNote} {ui.ai.privacy}</p></div></div>; }
