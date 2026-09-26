import Link from "next/link";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const c = getEditorialCopy(await getLocale());
  return pageMetadata(`${c.contact} · IBANScan`, c.contactIntro, "/contact", await getLocale());
}
export default async function ContactPage() {
  const t = await getServerMessages();
  const c = getEditorialCopy(await getLocale());
  const configured = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const email = configured && /^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(configured) ? configured : null;
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">{c.contact}</p><h1>{c.contactTitle}</h1><p className="muted">{c.contactIntro}</p></header><div className="grid-2"><section className="card"><h2>{c.operator}</h2>{email ? <><p>{c.sendFeedback}</p><p><a className="text-link" href={`mailto:${email}`}>{email}</a></p></> : <p>{t.legal.contact}</p>}<p className="muted">{c.sensitive}</p></section><section className="card"><h2>{c.paymentHelp}</h2><p>{c.paymentBody}</p><Link className="text-link" href="/disclaimer">{c.scopeLink} →</Link></section></div><article className="article"><h2>{c.reportTitle}</h2><p>{c.reportBody}</p><p><Link href="/resources">{c.guidesLink}</Link> · <Link href="/countries">{c.countriesLink}</Link></p></article></div>;
}
