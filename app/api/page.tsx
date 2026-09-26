import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n-server";
import { apiCopy } from "@/lib/api-copy";
export async function generateMetadata(){const t=apiCopy[await getLocale()];return pageMetadata(t.title,t.intro,"/api",await getLocale());}
export default async function ApiPage(){
 const t=apiCopy[await getLocale()];
 const routes=["/api/v1/iban/validate","/api/v1/iban/analyze","/api/v1/bank/search"];
 return <div className="page-shell"><header className="page-heading"><span className="eyebrow">{t.eyebrow}</span><h1>{t.title}</h1><div className="button-row"><Link className="button primary" href="/api/docs">{t.docs} →</Link><Link className="button" href="/api/playground">{t.playground}</Link></div></header><section className="card api-explanation"><h2>{t.introTitle}</h2><p>{t.intro}</p><p>{t.example}</p></section><div className="grid-3">{routes.map((route,i)=><section className="card" key={route}><span className="tag">{i===2?"GET":"POST"}</span><h2>{t.labels[i]}</h2><code>{route}</code><p>{t.descriptions[i]}</p></section>)}</div><article className="article"><h2>{t.access}</h2><p>{t.accessText}</p><p>{t.availability}</p><p>{t.limits}</p></article></div>;
}
