import Link from "@/components/localized-link";
import { Logo } from "./logo";
import { productCopy } from "@/locales/product";
import { getLocale, getServerUi } from "@/lib/i18n-server";
import { operatorDetails } from "@/lib/operator";
export async function Footer() {
  const ui = await getServerUi(); const t=productCopy[await getLocale()]; const operator = operatorDetails();
  const groups = [ { title: ui.footer.tools, links: [[ui.footerLinks.validator, "/tools/iban-validator"], [ui.footerLinks.analyzer, "/tools/iban-analyzer"], [ui.footerLinks.bic, "/tools/bic-swift-finder"], [ui.footerLinks.bulk, "/tools/bulk-iban-validator"]] }, { title: ui.footer.explore, links: [[ui.nav.countries, "/countries"], [ui.nav.resources, "/resources"], [t.converter, "/tools/currency-converter"], [t.dataSources, "/data-sources"]] }, { title: ui.footer.company, links: [[ui.footer.about, "/about"], [ui.footer.contact, "/contact"], [ui.footer.privacy, "/privacy"], [ui.footer.terms, "/terms"], [ui.footer.cookies, "/cookies"], [ui.footer.disclaimer, "/disclaimer"]] } ];
  return <footer className="site-footer"><div className="page-shell footer-grid"><div className="footer-brand"><Link href="/" aria-label={ui.shell.homeLabel}><Logo /></Link><p>{ui.footer.description}</p><span className="footer-status"><span className="status-dot"/>{ui.hero.privacy}</span></div>{groups.map(g => <div key={g.title}><h2>{g.title}</h2><ul>{g.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></div>)}</div><div className="page-shell footer-bottom"><span>© {new Date().getFullYear()} {operator ? <>{operator.name}{operator.vatId && <> · {t.vatId} {operator.vatId}</>}</> : ui.footer.copyright}</span><span>{t.credit}</span></div></footer>;
}
