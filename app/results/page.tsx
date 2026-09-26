import { Scanner } from "@/components/scanner";
import type { Metadata } from "next";
import { getServerUi } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> { const ui = await getServerUi(); return { title: ui.resultsPage.metadataTitle, robots: { index: false, follow: false }, referrer: "no-referrer" }; }
export default async function ResultsPage() {
  const ui = await getServerUi(); return <div className="page-shell tool-page"><div className="page-heading centered"><span className="eyebrow">{ui.resultsPage.eyebrow}</span><h1>{ui.resultsPage.title}</h1><p>{ui.resultsPage.description}</p></div><Scanner readHash/></div>; }
