import { AdSlot } from "@/components/ad-slot";
import type { Metadata } from "next";
import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/content";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy, localizedGuides } from "@/lib/localized-content";
import { breadcrumbSchema, faqSchema, jsonLd, localizedUrl, pageMetadata, siteUrl } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const guide = localizedGuides(await getLocale()).find(item => item.slug === slug);
  return guide ? pageMetadata(guide.title, guide.description, `/resources/${guide.slug}`, await getLocale()) : {};
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const translatedGuides = localizedGuides(locale);
  const slug = (await params).slug;
  const guide = translatedGuides.find(item => item.slug === slug);
  if (!guide) notFound();
  const url = localizedUrl(`/resources/${guide.slug}`, locale);
  return <div className="page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: url, url, inLanguage: locale, author: { "@type": "Organization", name: "IBANScan", url: siteUrl() } }, faqSchema(guide.faqs), breadcrumbSchema([{ name: t.common.home, path: "/" }, { name: t.common.resources, path: "/resources" }, { name: guide.title, path: `/resources/${guide.slug}` }], locale)]) }} />
    <nav aria-label={c.breadcrumb} className="breadcrumbs"><Link href="/resources">{t.common.resources}</Link><span aria-hidden="true"> / </span><span>{guide.title}</span></nav>
    <header className="page-heading"><p className="eyebrow">{guide.category} · {guide.readTime}</p><h1>{guide.title}</h1><p className="muted">{guide.description}</p></header>
    <article className="article">{guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
      <section><h2>{c.faq}</h2><div className="faq-list">{guide.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
      <section className="source-notes"><h2>{t.resources.sources}</h2><ul>{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul><p className="muted">{t.common.updated}</p></section>
      <section className="card content-callout"><h2>{c.practice}</h2><p>{t.resources.disclaimer}</p><Link className="button primary" href={guide.tool.href}>{guide.tool.label}</Link></section>
      <section><h2>{t.resources.further}</h2><ul>{translatedGuides.filter((item) => item.slug !== guide.slug).slice(0, 3).map((item) => <li key={item.slug}><Link href={`/resources/${item.slug}`}>{item.title}</Link></li>)}</ul></section>
    </article><AdSlot placement="resource"/>
  </div>;
}
