import { productCopy } from "@/locales/product";
import Link from "@/components/localized-link";
import { getLocale } from "@/lib/i18n-server";
import { getEditorialCopy } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";
import { contactEmail, operatorDetails } from "@/lib/operator";

export async function generateMetadata() {
  const c = getEditorialCopy(await getLocale());
  return pageMetadata(`${c.contact} · IBANScan`, c.contactIntro, "/contact", await getLocale());
}
export default async function ContactPage() {
  const t = productCopy[await getLocale()];
  const c = getEditorialCopy(await getLocale());
  const email = contactEmail();
  const operator = operatorDetails();
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">{c.contact}</p><h1>{c.contactTitle}</h1><p className="muted">{c.contactIntro}</p></header><div className="grid-2"><section className="card"><h2>{c.operator}</h2>{email ? <><p>{c.sendFeedback}</p><p><a className="text-link" href={`mailto:${email}`}>{email}</a></p></> : <p>{t.contactMissing}</p>}{operator && <address className="muted operator-address">{operator.name}<br />{operator.address}{operator.vatId && <><br />{t.vatId} {operator.vatId}</>}{operator.pec && <><br />PEC: <a className="text-link" href={`mailto:${operator.pec}`}>{operator.pec}</a></>}</address>}<p className="muted">{c.sensitive}</p></section><section className="card"><h2>{c.paymentHelp}</h2><p>{c.paymentBody}</p><Link className="text-link" href="/disclaimer">{c.scopeLink} →</Link></section></div><article className="article"><h2>{c.reportTitle}</h2><p>{c.reportBody}</p><p><Link href="/resources">{c.guidesLink}</Link> · <Link href="/countries">{c.countriesLink}</Link></p></article></div>;
}
