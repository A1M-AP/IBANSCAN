"use client";
import { useState } from "react";
import { calculateItalianIban } from "@/lib/iban-calculator";
import { analyzeIban } from "@/lib/iban";
import { useLocale } from "./locale-provider";
import { productCopy } from "@/locales/product";
import { ScanResult } from "./scan-result";
import { Generator } from "./utility-tools";
export function IbanCalculator() {
  const { locale } = useLocale();
  const t = productCopy[locale];
  const [abi, setAbi] = useState(""),
    [cab, setCab] = useState(""),
    [account, setAccount] = useState(""),
    [iban, setIban] = useState(""),
    [error, setError] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIban(calculateItalianIban(abi, cab, account));
      setError(false);
    } catch {
      setIban("");
      setError(true);
    }
  }
  const clear = () => {
    setIban("");
    setError(false);
  };
  return (
    <>
      <section className="card utility-card">
        <form onSubmit={submit}>
          <div className="calculator-grid">
            <div>
              <label htmlFor="calc-abi">{t.abi}</label>
              <input
                id="calc-abi"
                inputMode="numeric"
                maxLength={5}
                placeholder="02008"
                value={abi}
                onChange={(e) => {
                  setAbi(e.target.value);
                  clear();
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="calc-cab">{t.cab}</label>
              <input
                id="calc-cab"
                inputMode="numeric"
                maxLength={5}
                placeholder="00000"
                value={cab}
                onChange={(e) => {
                  setCab(e.target.value);
                  clear();
                }}
                required
              />
            </div>
          </div>
          <label htmlFor="calc-account">{t.account}</label>
          <input
            id="calc-account"
            value={account}
            maxLength={12}
            onChange={(e) => {
              setAccount(e.target.value.toUpperCase());
              clear();
            }}
            autoComplete="off"
            spellCheck={false}
            required
          />
          <p className="fine-print">{t.calculateNote}</p>
          <button className="button primary" type="submit">
            {t.calculateButton}
            <span aria-hidden="true"> →</span>
          </button>
          {error && (
            <p role="alert" className="alert error-alert">
              {t.inputError}
            </p>
          )}
        </form>
      </section>
      {iban && <ScanResult result={analyzeIban(iban)} />}
      <details className="calculator-more">
        <summary>{t.otherCountries}</summary>
        <Generator />
      </details>
    </>
  );
}
