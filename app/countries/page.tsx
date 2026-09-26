import Link from "next/link";
import { countries } from "@/lib/countries";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { countryName } from "@/lib/iban-display";
import { getEditorialCopy } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const c = getEditorialCopy(await getLocale());
  return pageMetadata(c.directoryMeta, c.directoryDescription, "/countries", await getLocale());
}

export default async function CountriesPage() {
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const localized = countries.map(country => ({ ...country, name: countryName(country.code, locale, country.name) }));
  return <div className="page-shell">
    <header className="page-heading"><p className="eyebrow">{t.country.eyebrow}</p><h1>{t.country.title}</h1><p className="muted">{t.country.intro}</p></header>
    <div className="grid-3 country-grid">{localized.sort((a, b) => a.name.localeCompare(b.name, locale)).map((country) => <Link className="card country-card" href={`/countries/${country.slug}`} key={country.code}>
      <span className="country-flag" aria-hidden="true">{country.flag}</span><h2>{country.name}</h2><p className="muted">{country.code} · {country.length} {t.common.characters}</p><span className="tag">{country.sepa ? c.inScope : c.outScope}</span>
    </Link>)}</div>
    <section className="card content-callout"><h2>{t.country.boundaries}</h2><p>{t.country.limitations}</p><p className="muted">{t.country.scopeNote}</p><Link className="text-link" href="/resources/what-is-sepa">{c.understandSepa} →</Link></section>
  </div>;
}
