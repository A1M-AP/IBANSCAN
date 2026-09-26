"use client";
import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { productCopy } from "@/locales/product";
import currencies from "@/data/currencies.json";
import {
  convertCurrency,
  parseAmount,
  type ExchangeRates,
} from "@/lib/exchange-rates";
function currencyName(code: string, locale: string) {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "currency" }).of(code) || code
    );
  } catch {
    return code;
  }
}
export function CurrencyTools({ mode }: { mode: "rates" | "converter" }) {
  const { locale } = useLocale();
  const t = productCopy[locale];
  const [data, setData] = useState<ExchangeRates | null>(null),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0),
    [amount, setAmount] = useState("100"),
    [from, setFrom] = useState("EUR"),
    [to, setTo] = useState("USD");
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/rates", { signal: c.signal })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setData)
      .catch(() => {
        if (!c.signal.aborted) setFailed(true);
      });
    return () => c.abort();
  }, [retry]);
  const names = data ? Object.keys(data.rates).sort() : [];
  let value: number | undefined;
  try {
    if (data)
      value = convertCurrency(parseAmount(amount), from, to, data.rates);
  } catch {}
  return (
    <section className="card utility-card currency-tool">
      {!data ? (
        <div role="status">
          <p>{failed ? t.loadError : t.loading}</p>
          {failed && (
            <button
              className="button"
              onClick={() => {
                setFailed(false);
                setRetry((r) => r + 1);
              }}
            >
              {t.retry}
            </button>
          )}
        </div>
      ) : (
        <>
          {mode === "converter" && (
            <>
              <label htmlFor="fx-amount">{t.amount}</label>
              <input
                id="fx-amount"
                inputMode="decimal"
                value={amount}
                maxLength={22}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={value === undefined}
              />
            </>
          )}
          <div className="currency-fields">
            <div>
              <label htmlFor="fx-from">{t.from}</label>
              <select
                id="fx-from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {names.map((c) => (
                  <option key={c} value={c}>
                    {c} · {currencyName(c, locale)}
                  </option>
                ))}
              </select>
            </div>
            {mode === "converter" && (
              <>
                <button
                  className="icon-button"
                  aria-label={t.swap}
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                  }}
                >
                  ⇄
                </button>
                <div>
                  <label htmlFor="fx-to">{t.to}</label>
                  <select
                    id="fx-to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  >
                    {names.map((c) => (
                      <option key={c} value={c}>
                        {c} · {currencyName(c, locale)}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          {mode === "converter" ? (
            <div className="fx-output" aria-live="polite">
              <span>{t.converted}</span>
              <strong>
                {value === undefined
                  ? "—"
                  : new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: to,
                    }).format(value)}
              </strong>
              <span>
                1 {from} ={" "}
                {new Intl.NumberFormat(locale, {
                  maximumFractionDigits: 6,
                }).format(convertCurrency(1, from, to, data.rates))}{" "}
                {to}
              </span>
            </div>
          ) : (
            <table className="reference-table">
              <caption>
                {t.asOf}: {data.date} · 1 {from}
              </caption>
              <thead>
                <tr>
                  <th>{t.code}</th>
                  <th>{t.currency}</th>
                  <th>{t.rates}</th>
                </tr>
              </thead>
              <tbody>
                {names
                  .filter((c) => c !== from)
                  .map((c) => (
                    <tr key={c}>
                      <td>{c}</td>
                      <td>{currencyName(c, locale)}</td>
                      <td>
                        {new Intl.NumberFormat(locale, {
                          maximumFractionDigits: 6,
                        }).format(convertCurrency(1, from, c, data.rates))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          <p className="source-note">
            {t.asOf}: <time dateTime={data.date}>{data.date}</time> ·{" "}
            <a href={data.source} target="_blank" rel="noopener noreferrer">
              {t.source}: ECB / BCE ↗
            </a>
          </p>
          <p className="fine-print">{t.fxNote}</p>
        </>
      )}
    </section>
  );
}
export function CurrencyCodes() {
  const { locale } = useLocale();
  const t = productCopy[locale];
  const [query, setQuery] = useState("");
  const records = currencies.records.filter((r) =>
    (
      r.code +
      " " +
      r.numeric +
      " " +
      r.name +
      " " +
      currencyName(r.code, locale)
    )
      .toLocaleLowerCase(locale)
      .includes(query.toLocaleLowerCase(locale)),
  );
  return (
    <section className="card currency-directory">
      <label htmlFor="currency-search">{t.searchCurrency}</label>
      <input
        id="currency-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="search"
        maxLength={80}
      />
      <table className="reference-table">
        <caption>
          ISO 4217 · {t.updated}: {currencies.retrievedAt}
        </caption>
        <thead>
          <tr>
            <th>{t.code}</th>
            <th>{t.currency}</th>
            <th>{t.numeric}</th>
            <th>{t.digits}</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.code}>
              <td>{r.code}</td>
              <td>{currencyName(r.code, locale)}</td>
              <td>{r.numeric}</td>
              <td>{r.digits === "N.A." ? "—" : r.digits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length && <p role="status">{t.noResults}</p>}
      <p className="source-note">
        <a href={currencies.source} target="_blank" rel="noopener noreferrer">
          {t.source}: SIX · ISO 4217 ↗
        </a>
      </p>
    </section>
  );
}
