import Link from "next/link";
import { getLocale } from "@/lib/i18n-server";
import { productCopy } from "@/locales/product";
import { directoryStats } from "@/lib/bank-directory";
import currencies from "@/data/currencies.json";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  const t = productCopy[l];
  return pageMetadata(t.dataSources, t.dataIntro, "/data-sources", l);
}
export default async function Sources() {
  const t = productCopy[await getLocale()];
  const s = directoryStats;
  return (
    <div className="page-shell">
      <header className="page-heading">
        <span className="eyebrow">IBANScan</span>
        <h1>{t.dataSources}</h1>
        <p>{t.dataIntro}</p>
      </header>
      <article className="article">
        <p>{t.dataLimit}</p>
        <h2>Banca d’Italia</h2>
        <p>
          {s.italianBanks} · {t.legalOffice} / ABI
          <br />
          {s.branches.toLocaleString()} · {t.branchAddress} / CAB
        </p>
        <p>
          {t.updated}: {s.italianDate}
        </p>
        <p>
          <a
            href="https://infostat.bancaditalia.it/GIAVAInquiry-public/ng/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Albi ed elenchi di vigilanza ↗
          </a>
        </p>
        <h2>European Payments Council</h2>
        <p>
          {s.bics.toLocaleString()} BIC · SCT / SCT Inst / SDD Core / SDD B2B
        </p>
        <p>{t.schemeNote}</p>
        <p>
          {t.updated}: {s.epcDate}
        </p>
        <p>
          <a
            href="https://www.europeanpaymentscouncil.eu/what-we-do/be-involved/register-participants/registers-participants-sepa-payment-schemes"
            target="_blank"
            rel="noopener noreferrer"
          >
            EPC · Registers of participants ↗
          </a>
        </p>
        <p lang="en">
          EPC reference records are normalised and enriched with national
          identifiers and bank-published contact details. IBANScan is
          independent of the EPC. BICs identify scheme participants, not
          guaranteed routing destinations. Exact, unique institution-name
          matches link the Italian register to EPC records; ambiguous matches
          are left unresolved.
        </p>
        <h2>{t.pec}</h2>
        <p>
          {s.certifiedContacts} · {t.pecComplaint}
        </p>
        <p>{t.bankScope}</p>
        <h2>ECB / BCE</h2>
        <p>{t.fxNote}</p>
        <Link href="/tools/exchange-rates">{t.rates} →</Link>
        <h2>ISO 4217 · SIX</h2>
        <p>
          {currencies.records.length} · {t.codes} · {t.updated}:{" "}
          {currencies.retrievedAt}
        </p>
        <a href={currencies.source} target="_blank" rel="noopener noreferrer">
          {t.source} ↗
        </a>
      </article>
    </div>
  );
}
