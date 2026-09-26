import Link from "next/link";
import { legalPages } from "@/lib/content";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy } from "@/lib/localized-content";

export default async function LegalContent({ page }: { page: keyof typeof legalPages }) {
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const content = legalPages[page];
  const titles: Record<string, string> = { privacy: c.privacy, cookies: c.cookies, terms: c.terms, disclaimer: c.disclaimer };
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">IBANScan / {c.transparency}</p><h1>{locale === "en" ? content.title : titles[page]}</h1>{locale !== "en" && <p className="muted">{c.legalEnglish}</p>}<p className="muted" lang="en">{content.description}</p></header><article className="article">
    <aside className="card"><h2>{t.legal.status}</h2><p>{t.legal.notice}</p></aside>
    <div lang="en">{content.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
    <p><Link href="/contact">{c.contact}</Link> · <Link href="/privacy">{c.privacy}</Link> · <Link href="/cookies">{c.cookies}</Link> · <Link href="/terms">{c.terms}</Link> · <Link href="/disclaimer">{c.disclaimer}</Link></p>
  </article></div>;
}
