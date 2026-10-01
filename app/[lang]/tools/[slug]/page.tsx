import { IbanCalculator } from "@/components/iban-calculator";
import { CurrencyTools, CurrencyCodes } from "@/components/currency-tools";
import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { Scanner } from "@/components/scanner";
import { BulkValidator } from "@/components/bulk-validator";
import {
  Formatter,
  Generator,
  CountryChecker,
  BankFinder,
} from "@/components/utility-tools";
import { AdSlot } from "@/components/ad-slot";
import { Icon } from "@/components/icon";
import { toolCatalog as sourceTools } from "@/lib/tools";
import { getLocalizedTools, toolGroupName } from "@/lib/localized-tools";
import { pageMetadata } from "@/lib/seo";
import { getServerUi, getLocale } from "@/lib/i18n-server";
export async function generateStaticParams() {
  return sourceTools.map((t) => ({ slug: t.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const awaitedSlug = (await params).slug;
  const t = getLocalizedTools(await getLocale()).find(
    (t) => t.slug === awaitedSlug,
  );
  return t
    ? pageMetadata(t.name, t.detail, `/tools/${t.slug}`, await getLocale())
    : {};
}
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const ui = await getServerUi();
  const locale = await getLocale();
  const toolCatalog = getLocalizedTools(locale);
  const slug = (await params).slug;
  const tool = toolCatalog.find((t) => t.slug === slug);
  if (!tool) notFound();
  return (
    <div className="page-shell tool-page">
      <div className="page-heading centered">
        <Link href="/tools" className="eyebrow tool-breadcrumb">
          {ui.toolPage.breadcrumb} <span>/</span>{" "}
          {toolGroupName(tool.group, locale).toUpperCase()}
        </Link>
        <h1>{tool.name}</h1>
        <p>{tool.detail}</p>
      </div>
      {tool.kind === "scanner" ? (
        <Scanner
          onlyCountry={tool.slug === "abi-cab-checker" ? "IT" : undefined}
        />
      ) : tool.kind === "bulk" ? (
        <BulkValidator />
      ) : tool.kind === "formatter" ? (
        <Formatter />
      ) : tool.kind === "generator" ? (
        <Generator />
      ) : tool.kind === "country" ? (
        <CountryChecker />
      ) : tool.kind === "calculator" ? (
        <IbanCalculator />
      ) : tool.kind === "currencies" ? (
        <CurrencyCodes />
      ) : tool.kind === "rates" || tool.kind === "converter" ? (
        <CurrencyTools mode={tool.kind} />
      ) : (
        <BankFinder />
      )}
      <AdSlot placement="tool" />
      {tool.group !== "Currency tools" && (
        <section className="tool-about">
          <h2>{ui.toolPage.aboutTitle}</h2>
          <p>
            {tool.detail} {ui.toolPage.resultScope}
          </p>
          {tool.kind === "scanner" && <p>{ui.toolPage.scannerScope}</p>}
          <p>
            {ui.toolPage.sourceIntro}{" "}
            <a
              href="https://www.swift.com/standards/data-standards/iban-international-bank-account-number"
              target="_blank"
              rel="noopener noreferrer"
            >
              {ui.toolPage.sourceLabel}
            </a>
            {ui.toolPage.sourceScope}
          </p>
          <Link href="/resources/how-to-validate-an-iban" className="text-link">
            {ui.toolPage.guideLink}
            <Icon name="arrow" size={15} />
          </Link>
        </section>
      )}
      <section className="related-tools">
        <h2>{ui.tools.related}</h2>
        <div className="tools-grid">
          {toolCatalog
            .filter((t) => t.slug !== tool.slug && t.group === tool.group)
            .slice(0, 3)
            .map((t) => (
              <Link
                href={`/tools/${t.slug}`}
                className="tool-card"
                key={t.slug}
              >
                <Icon name={t.icon} />
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                </div>
                <Icon name="upRight" size={16} />
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
