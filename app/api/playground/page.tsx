import { ApiPlayground } from "@/components/api-playground";
import { pageMetadata } from "@/lib/seo";
import { getServerUi } from "@/lib/i18n-server";
export const metadata=pageMetadata("API Playground", "Test authenticated IBAN validation and analysis requests with your own API key in the IBANScan API playground.", "/api/playground");
export default async function PlaygroundPage(){
  const ui = await getServerUi();return <div className="page-shell tool-page"><div className="page-heading"><span className="eyebrow">API PLAYGROUND</span><h1>{ui.playground.title}</h1><p>{ui.playground.description}</p></div><ApiPlayground/></div>}
