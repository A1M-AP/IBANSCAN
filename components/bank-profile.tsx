"use client";
import type { DirectoryBank } from "@/lib/bank-directory-types";
import { schemeState } from "@/lib/bank-directory-types";
import { useUi, useLocale } from "./locale-provider";
import { productCopy } from "@/locales/product";
import { CopyButton } from "./copy-button";
export function BankProfile({ bank }: { bank: DirectoryBank | null }) {
  const ui = useUi();
  const { locale } = useLocale();
  const t = productCopy[locale];
  const b = ui.bankDetails;
  if (!bank) return <p className="alert">{b.unavailable}</p>;
  return (
    <div className="bank-profile">
      <span className="eyebrow">{b.title}</span>
      <h4>{bank.name}</h4>
      <div className="bank-profile-links">
        {bank.website && (
          <a
            className="text-link"
            href={bank.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {b.website} ↗
          </a>
        )}
        {bank.contact && (
          <a
            className="text-link"
            href={bank.contact.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {b.contact} ↗
          </a>
        )}
      </div>
      <span className="bank-profile-label">BIC / SWIFT</span>
      {bank.bic ? (
        <p className="mono">
          {bank.bic} <CopyButton value={bank.bic} />
        </p>
      ) : (
        <p className="fine-print">{t.unknown}</p>
      )}
      {bank.contact?.phone && (
        <>
          <span className="bank-profile-label">{b.phone}</span>
          <a
            className="text-link"
            href={"tel:" + bank.contact.phone.replace(/[^+\d]/g, "")}
          >
            {bank.contact.phone}
          </a>
        </>
      )}
      {bank.office ? (
        <>
          <span className="bank-profile-label">
            {bank.office.kind === "headquarters"
              ? b.headquarters
              : t.legalOffice}
          </span>
          <address>{bank.office.address}</address>
          <p className="fine-print">
            <a
              href={bank.office.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.source} ↗
            </a>{" "}
            · {bank.office.verifiedAt}
          </p>
        </>
      ) : (
        <>
          <span className="bank-profile-label">{t.legalOffice}</span>
          <p className="fine-print">{t.unknown}</p>
        </>
      )}
      {bank.headquartersAddress && (
        <>
          <span className="bank-profile-label">{b.headquarters}</span>
          <address>{bank.headquartersAddress}</address>
          <p className="fine-print">
            <a
              href={bank.headquartersSource}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.source} ↗
            </a>{" "}
            · {bank.headquartersDate}
          </p>
        </>
      )}
      {!bank.office && bank.registryAddress && (
        <>
          <span className="bank-profile-label">{t.registryAddress}</span>
          <address>{bank.registryAddress}</address>
          <p className="fine-print">
            <a
              href={bank.registrySource}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.source} ↗
            </a>{" "}
            · {bank.registryDate}
          </p>
        </>
      )}
      <span className="bank-profile-label">
        {bank.pec?.purpose === "complaints" ? t.pecComplaint : t.pec}
      </span>
      {bank.pec ? (
        <>
          <a className="text-link" href={"mailto:" + bank.pec.email}>
            {bank.pec.email}
          </a>
          <p className="fine-print">
            <a href={bank.pec.source} target="_blank" rel="noopener noreferrer">
              {t.source} ↗
            </a>{" "}
            · {bank.pec.verifiedAt}
          </p>
        </>
      ) : (
        <p className="fine-print">{t.unknown}</p>
      )}
      {bank.branches && (
        <>
          <span className="bank-profile-label">{t.branchAddress}</span>
          {bank.branches.length ? (
            bank.branches.map((branch) => (
              <address key={branch.id}>{branch.address}</address>
            ))
          ) : (
            <p className="fine-print">{t.branchUnknown}</p>
          )}
          <p className="fine-print">
            <a
              href={bank.branchSource}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.source}: Banca d’Italia ↗
            </a>{" "}
            · {bank.branchDate}
            {(bank.branchCount || 0) > 20 ? " · 20 / " + bank.branchCount : ""}
          </p>
        </>
      )}
      <div className="bank-sepa">
        <h4>{t.schemes}</h4>
        <ul className="scheme-list">
          {(["sct", "sdd_core", "sdd_b2b", "sct_inst"] as const).map(
            (key, i) => {
              const scheme = bank.schemes?.[key];
              const state = schemeState(scheme);
              return (
                <li key={key}>
                  <strong>
                    {
                      [
                        "SEPA Credit Transfer",
                        "SEPA Direct Debit Core",
                        "SEPA Direct Debit B2B",
                        "SEPA Instant Credit Transfer",
                      ][i]
                    }
                  </strong>
                  <span>
                    {state === "active"
                      ? "✓ " + t.schemeYes
                      : state === "future"
                        ? t.schemeFuture + " " + scheme?.ready
                        : state === "ended"
                          ? t.schemeLeft + " " + scheme?.leaving
                          : t.schemeUnknown}
                  </span>
                </li>
              );
            },
          )}
        </ul>
        {bank.schemeDate && (
          <p className="fine-print">
            <a
              href="https://www.europeanpaymentscouncil.eu/what-we-do/be-involved/register-participants/registers-participants-sepa-payment-schemes"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.source}: European Payments Council ↗
            </a>{" "}
            · {t.updated} {bank.schemeDate}
          </p>
        )}
        <p className="fine-print">{t.schemeNote}</p>
      </div>
      <p className="fine-print">{b.scope}</p>
    </div>
  );
}
