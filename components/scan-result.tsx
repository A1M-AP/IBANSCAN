"use client";
import { useEffect, useRef, useState } from "react";
import type { DirectoryBank } from "@/lib/bank-directory-types";
import Link from "next/link";
import { bankLookupCopy } from "@/locales/bank-lookup";
import { BankProfile } from "./bank-profile";
import { localizeResult } from "@/lib/iban-display";
import { type IbanResult } from "@/lib/iban";
import { Icon } from "./icon";
import { CopyButton } from "./copy-button";

import { formatMessage } from "@/locales/ui.en";
import { useUi, useLocale } from "./locale-provider";
export function ScanResult({ result: originalResult }: { result: IbanResult }) {
  const ui = useUi();
  const { locale } = useLocale();
  const copy = bankLookupCopy[locale];
  const [attempt, setAttempt] = useState(0);
  const [resolved, setResolved] = useState<{
    key: string;
    attempt: number;
    error: boolean;
    bank: DirectoryBank | null;
  } | null>(null);
  const bankKey = originalResult.valid
    ? [
        originalResult.country?.code,
        originalResult.bankIdentifier,
        originalResult.branchIdentifier,
      ].join(":")
    : "";
  useEffect(() => {
    if (!bankKey || !originalResult.bankIdentifier) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;
    const p = new URLSearchParams({
      country: originalResult.country!.code,
      code: originalResult.bankIdentifier,
    });
    if (originalResult.branchIdentifier)
      p.set("branch", originalResult.branchIdentifier);
    fetch("/api/banks?" + p, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (
          !Object.hasOwn(data, "bank") ||
          (data.bank !== null && typeof data.bank?.name !== "string")
        )
          throw Error("Invalid directory response");
        if (active)
          setResolved({ key: bankKey, bank: data.bank, error: false, attempt });
      })
      .catch(() => {
        if (active)
          setResolved({ key: bankKey, bank: null, error: true, attempt });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    attempt,
    bankKey,
    originalResult.bankIdentifier,
    originalResult.branchIdentifier,
    originalResult.country,
  ]);
  const result = {
    ...localizeResult(originalResult, locale),
    bank:
      resolved?.key === bankKey
        ? resolved.bank || originalResult.bank
        : originalResult.bank,
  };
  const lookupPending =
    !!bankKey &&
    !!originalResult.bankIdentifier &&
    (resolved?.key !== bankKey || resolved?.attempt !== attempt);
  const lookupFailed =
    !lookupPending && resolved?.key === bankKey && resolved.error;
  const lookupMessage = !originalResult.valid
    ? copy.invalid
    : lookupPending
      ? copy.loading
      : lookupFailed
        ? copy.error
        : !result.bank
          ? copy.missing
          : "";
  const dialog = useRef<HTMLDialogElement>(null);
  const [shareStatus, setShareStatus] = useState("");
  const fields = [
    [ui.scanner.bankId, result.bankIdentifier],
    [ui.scanner.branch, result.branchIdentifier],
    [ui.scanner.account, result.accountIdentifier],
    [ui.scanner.bban, result.bban || null],
  ];
  async function share() {
    const link = `${location.origin}/results#iban=${encodeURIComponent(result.normalized)}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareStatus(ui.scanner.copied);
      dialog.current?.close();
    } catch {
      setShareStatus(ui.scanner.copyError);
    }
  }
  return (
    <div className="scan-result">
      <div className="result-title">
        <div>
          <span className="eyebrow">{ui.result.eyebrow}</span>
          <h2>{ui.scanner.result}</h2>
          <p className="muted">{ui.scanner.caption}</p>
        </div>
        <button
          type="button"
          className="button button-small"
          onClick={() => {
            setShareStatus("");
            dialog.current?.showModal();
          }}
        >
          <Icon name="share" size={16} />
          {ui.scanner.share}
        </button>
      </div>
      {shareStatus && (
        <p className="fine-print" role="status">
          {shareStatus}
        </p>
      )}
      <section
        className={`result-summary card ${result.valid ? "is-valid" : "is-invalid"}`}
        aria-label={ui.result.accessibleLabel}
      >
        <div className="result-status-row">
          <div className="result-status">
            <span className="result-check">
              <Icon name={result.valid ? "check" : "x"} size={21} />
            </span>
            <h3>{result.valid ? ui.scanner.success : ui.scanner.failure}</h3>
          </div>
          <span className={`tag ${result.valid ? "tag-green" : "tag-red"}`}>
            {result.valid ? ui.result.checksumPassed : ui.result.checkRequired}
          </span>
        </div>
        <div className="result-iban">
          <code>{result.formatted || "—"}</code>
          <CopyButton value={result.normalized} />
        </div>
        {!result.valid && (
          <ul className="result-errors">
            {result.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <div className="result-highlights">
          <div>
            <span>{ui.scanner.country}</span>
            <strong>
              {result.country ? (
                <>
                  <span className="flag">{result.country.flag}</span>{" "}
                  {result.country.name}
                </>
              ) : (
                ui.scanner.notAvailable
              )}
            </strong>
          </div>
          <div>
            <span>{ui.scanner.bank}</span>
            <strong>
              {result.bank?.name ||
                (lookupPending
                  ? copy.loading
                  : lookupFailed
                    ? ui.scanner.notAvailable
                    : ui.scanner.unavailable)}
            </strong>
          </div>
          <div>
            <span>{ui.scanner.bic}</span>
            <strong className="mono">{result.bank?.bic || "—"}</strong>
          </div>
          <div>
            <span>{ui.scanner.sepa}</span>
            <strong>
              {result.sepa === null
                ? ui.scanner.notAvailable
                : result.sepa
                  ? ui.scanner.sepaYes
                  : ui.scanner.sepaNo}
            </strong>
          </div>
        </div>
      </section>
      <div className="grid-2 result-details">
        <section className="card">
          <h3>
            <Icon name="list" />
            {ui.scanner.checks}
          </h3>
          <ul className="check-list">
            {result.checks.map((check) => (
              <li key={check.id}>
                <span
                  className={`check-indicator ${check.passed ? "passed" : "failed"}`}
                >
                  <Icon name={check.passed ? "check" : "x"} size={13} />
                </span>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.message}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="fine-print">{ui.scanner.domestic}</p>
        </section>
        <section className="card">
          <h3>
            <Icon name="building" />
            {ui.scanner.bankInfo}
          </h3>
          {lookupMessage && (
            <div
              className="bank-lookup-status"
              role="status"
              aria-live="polite"
            >
              <p>{lookupMessage}</p>
              {lookupFailed && (
                <button
                  type="button"
                  className="button button-small"
                  onClick={() => setAttempt((value) => value + 1)}
                >
                  {copy.retry}
                </button>
              )}
              {!lookupPending && originalResult.valid && !result.bank && (
                <>
                  <p className="mono">
                    {originalResult.country?.code} ·{" "}
                    {originalResult.bankIdentifier || "—"}
                  </p>
                  <Link className="text-link" href="/data-sources">
                    {copy.coverage} →
                  </Link>
                </>
              )}
            </div>
          )}
          {result.bank && <BankProfile bank={result.bank} />}
          <dl className="detail-list">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  {value ? (
                    <>
                      <code>{value}</code>
                      <CopyButton
                        value={value}
                        label={formatMessage(ui.common.copyField, {
                          label: label?.toLowerCase() ?? "",
                        })}
                      />
                    </>
                  ) : (
                    <span className="muted">{ui.scanner.notAvailable}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {result.bank && (
            <p className="fine-print">
              {ui.scanner.source}:{" "}
              <a
                href={result.bank.source}
                rel="noopener noreferrer"
                target="_blank"
              >
                {result.bank.name} <Icon name="external" size={12} />
              </a>{" "}
              · {result.bank.verifiedAt}
            </p>
          )}
          <p className="fine-print">
            {!result.valid ? ui.scanner.invalidFields : ui.scanner.sepaNote}
          </p>
        </section>
      </div>
      <div className="trust-note">
        <Icon name="shield" size={19} />
        <p>{ui.scanner.disclaimer}</p>
      </div>
      <dialog
        ref={dialog}
        className="share-dialog"
        aria-labelledby="share-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-top">
          <span className="feature-icon">
            <Icon name="share" />
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={ui.common.closeDialog}
            onClick={() => dialog.current?.close()}
          >
            <Icon name="x" />
          </button>
        </div>
        <h2 id="share-title">{ui.scanner.shareTitle}</h2>
        <p>{ui.scanner.shareBody}</p>
        <div className="dialog-actions">
          <button className="button" onClick={() => dialog.current?.close()}>
            {ui.scanner.cancel}
          </button>
          <button className="button primary" onClick={share}>
            {ui.scanner.shareConfirm}
          </button>
        </div>
      </dialog>
    </div>
  );
}
