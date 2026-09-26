import Link from "next/link";
import { sources } from "@/lib/content";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy, localizeSource } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const c = getEditorialCopy(await getLocale());
  return pageMetadata(c.about, c.aboutIntro, "/about", await getLocale());
}
export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">{c.about}</p><h1>{c.aboutTitle}</h1><p className="muted">{c.aboutIntro}</p></header>
    <div className="grid-3"><section className="card"><p className="eyebrow">01 / {c.calculated}</p><h2>{c.calculatedTitle}</h2><p>{c.calculatedBody}</p></section><section className="card"><p className="eyebrow">02 / {c.verified}</p><h2>{c.verifiedTitle}</h2><p>{c.verifiedBody}</p></section><section className="card"><p className="eyebrow">03 / {c.unavailable}</p><h2>{c.unavailableTitle}</h2><p>{c.unavailableBody}</p></section></div>
    <article className="article"><h2>{c.boundaries}</h2><p>{t.country.limitations}</p><p>{c.processing}</p>
      <h2>{c.sourcesTitle}</h2><p>{c.sourceBody}</p><ul>{[sources.swift, sources.sepa, sources.bic].map(source => localizeSource(source, locale)).map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
      <h2>{c.noAccount}</h2><p>{c.noAccountBody}</p><p><Link className="button primary" href="/tools">{t.common.exploreTools}</Link></p>
    </article>
  </div>;
}
