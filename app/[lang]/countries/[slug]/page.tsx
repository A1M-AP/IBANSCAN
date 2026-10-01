import type { Metadata } from "next";
import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { countries, countryDataSource, getCountry } from "@/lib/countries";
import { countryEditorial, sources } from "@/lib/content";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { countryName } from "@/lib/iban-display";
import { getEditorialCopy, interpolate, localizedCountryNotes, localizeSource } from "@/lib/localized-content";
import { breadcrumbSchema, jsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return countries.map((country) => ({ slug: country.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const country = getCountry((await params).slug);
  if (!country) return {};
  const locale = await getLocale();
  const c = getEditorialCopy(locale);
  const values = { country: countryName(country.code, locale, country.name), length: country.length };
  return pageMetadata(interpolate(c.countryMeta, values), interpolate(c.countryDescription, values), `/countries/${country.slug}`, await getLocale());
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const country = getCountry((await params).slug);
  if (!country) notFound();
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const name = countryName(country.code, locale, country.name);
  const values = { country: name, code: country.code, length: country.length, format: country.format };
  const editorial = countryEditorial[country.code];
  return <div className="page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([{ name: t.common.home, path: "/" }, { name: t.common.countries, path: "/countries" }, { name, path: `/countries/${country.slug}` }], locale)) }} />
    <nav aria-label={c.breadcrumb} className="breadcrumbs"><Link href="/countries">{t.common.countries}</Link><span aria-hidden="true"> / </span><span>{name}</span></nav>
    <header className="page-heading"><p className="eyebrow">{t.country.eyebrow} / {country.code}</p><h1><span aria-hidden="true">{country.flag}</span> {interpolate(c.bankingTitle, values)}</h1><p className="muted">{interpolate(c.bankingIntro, values)}</p></header>
    <dl className="grid-3 country-facts">
      <div className="card"><dt className="muted">{t.country.prefix}</dt><dd>{country.code}</dd></div>
      <div className="card"><dt className="muted">{t.country.length}</dt><dd>{country.length} {t.common.characters}</dd></div>
      <div className="card"><dt className="muted">{t.country.scope}</dt><dd>{country.sepa ? c.included : c.excluded}</dd></div>
    </dl>
    <div className="grid-2 content-columns">
      <article className="article"><h2>{locale === "en" && editorial ? editorial.title : c.identifiersTitle}</h2>
        <p>{interpolate(c.nationalFormat, values)}</p>
        {locale === "en" && editorial && editorial.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p>{localizedCountryNotes(country, locale, name)}</p>
        <p>{country.bank ? interpolate(c.bankField, { length: country.bank.length }) : c.noBankField} {country.branch ? interpolate(c.branchField, { length: country.branch.length }) : c.noBranchField}</p>
        <p>{t.country.noBank}</p><Link className="text-link" href={`/iban/${country.slug}`}>{t.common.formatGuide} →</Link>
        <h2>{t.country.scope}</h2><p>{country.sepa ? t.country.scopeNote : t.country.notScopeNote}</p>
        <h2>{t.country.next}</h2><p>{t.country.confirm}</p>
      </article>
      <aside><section className="card"><p className="eyebrow">{c.startFormat}</p><h2>{interpolate(c.checkCountry, values)}</h2><p>{c.checkDescription}</p><Link className="button primary" href="/tools/iban-validator">{t.common.scanIban}</Link><p className="muted">{t.country.limitations}</p></section>
        <section className="card content-callout"><h2>{c.related}</h2><p><Link className="text-link" href="/tools/bank-identifier-finder">{c.bankFinder} →</Link></p><p><Link className="text-link" href="/tools/sepa-checker">{c.sepaChecker} →</Link></p>{country.code === "IT" && <p><Link className="text-link" href="/tools/abi-cab-checker">{c.abiFinder} →</Link></p>}</section>
      </aside>
    </div>
    <section className="article source-notes"><h2>{t.common.source}</h2><p>{t.country.sources}</p><p className="muted">{c.dataset}: {countryDataSource.name}. {c.release}: {countryDataSource.version}. {c.published}: {countryDataSource.published}. {c.sepaSource}: {countryDataSource.sepaVersion}.</p><ul>{[sources.swift, sources.sepa, ...(editorial?.source ? [editorial.source] : [])].map(source => localizeSource(source, locale)).map((source) => <li key={source.url}><a href={source.url} rel="noopener noreferrer" target="_blank">{source.label}</a></li>)}</ul><p className="muted">{t.common.updated}</p></section>
  </div>;
}
