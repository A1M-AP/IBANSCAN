import Link from "@/components/localized-link";
import { legalPages, operatorSections } from "@/lib/content";
import { operatorDetails } from "@/lib/operator";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";

function legalTitles(c: ReturnType<typeof getEditorialCopy>): Record<string, string> {
  return { privacy: c.privacy, cookies: c.cookies, terms: c.terms, disclaimer: c.disclaimer };
}

export async function legalMetadata(page: keyof typeof legalPages) {
  const locale = await getLocale();
  const content = legalPages[page];
  const title = locale === "en" ? content.title : legalTitles(getEditorialCopy(locale))[page];
  return pageMetadata(title, content.description, `/${page}`, locale);
}

export default async function LegalContent({ page }: { page: keyof typeof legalPages }) {
  const locale = await getLocale();
  const t = await getServerMessages();
  const c = getEditorialCopy(locale);
  const content = legalPages[page];
  const operator = operatorDetails();
  const sections = operator
    ? [...content.sections.filter((section) => !section.draftOnly), ...operatorSections(page, operator)]
    : content.sections;
  const titles = legalTitles(c);
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">IBANScan / {c.transparency}</p><h1>{locale === "en" ? content.title : titles[page]}</h1>{locale !== "en" && <p className="muted">{c.legalEnglish}</p>}<p className="muted" lang="en">{content.description}</p></header><article className="article">
    {!operator && <aside className="card"><h2>{t.legal.status}</h2><p>{t.legal.notice}</p></aside>}
    <div lang="en">{sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
    <p><Link href="/contact">{c.contact}</Link> · <Link href="/privacy">{c.privacy}</Link> · <Link href="/cookies">{c.cookies}</Link> · <Link href="/terms">{c.terms}</Link> · <Link href="/disclaimer">{c.disclaimer}</Link></p>
  </article></div>;
}
