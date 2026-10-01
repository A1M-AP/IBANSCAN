import Link from "@/components/localized-link";
import { Scanner } from "@/components/scanner";
import { ToolVisual } from "@/components/tool-visual";
import { Icon } from "@/components/icon";
import { AdSlot } from "@/components/ad-slot";
import { countries, getCountry } from "@/lib/countries";
import { getLocalizedTools } from "@/lib/localized-tools";
import { countryName } from "@/lib/iban-display";
import { getServerUi, getLocale } from "@/lib/i18n-server";
import { pageMetadata } from "@/lib/seo";
import { productCopy } from "@/locales/product";
export async function generateMetadata() {
  const l = await getLocale();
  const t = productCopy[l];
  return pageMetadata("IBANScan — " + t.title, t.intro, "/", l);
}
export default async function Home() {
  const locale = await getLocale();
  const ui = await getServerUi();
  const t = productCopy[locale];
  const tools = getLocalizedTools(locale);
  const featured = [
    "iban-validator",
    "iban-calculator",
    "bic-swift-finder",
    "exchange-rates",
    "currency-converter",
    "currency-codes",
  ].map((s) => tools.find((t) => t.slug === s)!);
  return (
    <>
      <section className="hero-wrap">
        <div className="abstract-background" aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
        <div className="hero page-shell">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>
            {t.title}
            <br />
            <span>{t.accent}</span>
          </h1>
          <p className="hero-description">{t.intro}</p>
          <Scanner />
          <div className="hero-footnote">
            <Icon name="shield" size={18} />
            <span>{ui.hero.privacy}</span>
            <Link href="/about">{ui.homeDetails.verifyLink} ↗</Link>
          </div>
        </div>
      </section>
      <section className="stats-section">
        <div className="page-shell stats-grid">
          <div>
            <strong>{countries.length}</strong>
            <span>{ui.home.statCountries}</span>
          </div>
          <div>
            <strong>ISO 13616</strong>
            <span>{ui.home.statStandard}</span>
          </div>
          <div>
            <strong>{ui.homeDetails.zero}</strong>
            <span>{ui.home.statPrivacy}</span>
          </div>
          <div>
            <strong>{ui.homeDetails.free}</strong>
            <span>{ui.home.statCost}</span>
          </div>
        </div>
      </section>
      <section className="page-shell section">
        <div className="section-heading centered">
          <h2>{t.process}</h2>
        </div>
        <div className="process-grid">
          {t.steps.map((step, i) => (
            <article key={step}>
              <span className="step-number">0{i + 1}</span>
              <h3>{step}</h3>
              <p>{t.stepTexts[i]}</p>
            </article>
          ))}
        </div>
        <div className="honesty-note">
          <Icon name="shield" />
          <p>{ui.scanner.disclaimer}</p>
        </div>
      </section>
      <section className="soft-section">
        <div className="page-shell section">
          <div className="section-heading split-heading">
            <div>
              <h2>{t.tools}</h2>
              <p>{t.toolsIntro}</p>
            </div>
            <Link href="/tools" className="text-link">
              {t.explore} ↗
            </Link>
          </div>
          <div className="premium-tools-grid">
            {featured.map((tool) => (
              <Link
                className="premium-tool"
                href={"/tools/" + tool.slug}
                key={tool.slug}
              >
                <ToolVisual slug={tool.slug} />
                <div className="premium-tool-copy">
                  <h3>
                    {tool.name}
                    <Icon name="upRight" size={20} />
                  </h3>
                  <p>{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <AdSlot placement="home" />
      <section className="page-shell section">
        <div className="section-heading centered">
          <h2>{ui.home.countryTitle}</h2>
          <p>{ui.home.countryDescription}</p>
        </div>
        <div className="country-preview-grid">
          {["IT", "DE", "FR", "ES", "NL", "GB"].map((code) => {
            const c = getCountry(code)!;
            return (
              <Link
                className="country-preview-card"
                key={code}
                href={"/iban/" + c.slug}
              >
                <span className="country-flag" aria-hidden="true">
                  {c.flag}
                </span>
                <h3>{countryName(code, locale, c.name)}</h3>
                <span>
                  {c.code} · {c.length} {ui.common.characters}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="page-shell section contact-band">
        <div>
          <span className="eyebrow">{t.contact}</span>
          <h2>{t.contactTitle}</h2>
          <p>{t.contactIntro}</p>
        </div>
        <Link href="/contact" className="button primary">
          {t.contactCta}
          <Icon name="arrow" size={18} />
        </Link>
      </section>
      <section className="final-cta">
        <div className="page-shell">
          <h2>{ui.home.finalTitle}</h2>
          <p>{ui.scanner.disclaimer}</p>
          <Link href="/#scanner" className="button primary">
            {ui.nav.scan}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
