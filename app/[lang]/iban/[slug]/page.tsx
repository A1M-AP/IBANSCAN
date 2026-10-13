import type { Metadata } from "next";
import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { countries, countryDataSource, getCountry } from "@/lib/countries";
import { sources } from "@/lib/content";
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
  const values = { country: countryName(country.code, locale, country.name), code: country.code, length: country.length };
  return pageMetadata(interpolate(c.ibanMeta, values), interpolate(c.ibanDescription, values), `/iban/${country.slug}`, await getLocale());
}

export default async function IbanCountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const country = getCountry((await params).slug);
  if (!country) notFound();
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const name = countryName(country.code, locale, country.name);
  const values = { country: name, code: country.code, length: country.length, bbanLength: country.length - 4, format: country.format };
  const example = country.example.replace(/\s/g, "").toUpperCase();
  const parts = [
    { label: t.iban.code, start: 0, length: 2 },
    { label: t.iban.checks, start: 2, length: 2 },
    { label: t.iban.bban, start: 4, length: country.length - 4 },
    ...(country.bank ? [{ label: t.iban.bank, start: country.bank.start + 4, length: country.bank.length }] : []),
    ...(country.branch ? [{ label: t.iban.branch, start: country.branch.start + 4, length: country.branch.length }] : []),
    ...(country.account ? [{ label: t.iban.account, start: country.account.start + 4, length: country.account.length }] : []),
  ];
  return <div className="page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema([{ name: t.common.home, path: "/" }, { name: t.common.countries, path: "/countries" }, { name: `${name} · ${c.format}`, path: `/iban/${country.slug}` }], locale)) }} />
    <nav aria-label={c.breadcrumb} className="breadcrumbs"><Link href="/countries">{t.common.countries}</Link><span aria-hidden="true"> / </span><Link href={`/countries/${country.slug}`}>{name}</Link><span aria-hidden="true"> / </span><span>{c.format}</span></nav>
    <header className="page-heading"><p className="eyebrow">{t.iban.eyebrow} / {country.code}</p><h1>{interpolate(c.ibanTitle, values)}</h1><p className="muted">{interpolate(c.ibanIntro, values)}</p></header>
    <section className="card iban-example"><p className="eyebrow">{c.formatExample}</p><p className="iban-text"><code>{example.match(/.{1,4}/g)?.join(" ")}</code></p><p className="muted">{t.common.exampleOnly}</p><Link className="text-link" href="/tools/iban-validator">{c.openValidator} →</Link></section>
    <article className="article wide-article"><h2>{t.iban.layout}</h2><p>{interpolate(c.layout, values)}</p><p>{t.iban.notation}</p>
      <div className="table-scroll" role="region" aria-label={interpolate(c.componentPositions, values)} tabIndex={0}><table className="data-table"><thead><tr><th scope="col">{t.iban.columnPart}</th><th scope="col">{t.iban.columnPosition}</th><th scope="col">{t.iban.columnLength}</th><th scope="col">{t.iban.columnExample}</th></tr></thead><tbody>{parts.map((part) => <tr key={part.label}><th scope="row">{part.label}</th><td>{part.start + 1}–{part.start + part.length}</td><td>{part.length}</td><td><code>{example.slice(part.start, part.start + part.length)}</code></td></tr>)}</tbody></table></div>
      <p className="muted">{t.iban.positions}</p><p>{localizedCountryNotes(country, locale, name)}</p>
      <h2>{t.iban.validation}</h2><ol>{t.iban.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol><p>{t.iban.caution}</p>
      <h2>{t.iban.mistakes}</h2><ul>{t.iban.mistakesList.map((item) => <li key={item}>{item}</li>)}</ul>
      <h2>{c.beyond}</h2><p>{t.country.noBank}</p><p>{t.country.limitations}</p><p><Link href={`/countries/${country.slug}`}>{interpolate(c.readOverview, values)} →</Link></p>
      <h2>{t.common.source}</h2><p>{c.dataset}: {countryDataSource.name}. {c.release}: {countryDataSource.version}. {c.published}: {countryDataSource.published}.</p><ul>{[sources.swift, sources.checksum].map(source => localizeSource(source, locale)).map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul><p className="muted">{t.common.updated}</p>
    </article>
  </div>;
}
