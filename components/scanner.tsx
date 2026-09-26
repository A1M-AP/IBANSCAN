"use client";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { analyzeIban, formatIban, normalizeIban, type IbanResult } from "@/lib/iban";
import { getCountry } from "@/lib/countries";
import { track } from "@/lib/analytics";
import { Icon } from "./icon";
import { useUi, useLocale } from "./locale-provider";
import { countryName } from "@/lib/iban-display";
const examples = ["IT", "DE", "GB"].map(code => { const country = getCountry(code)!; return { code, name: country.name, iban: country.example }; });
const ScanResult = dynamic(() => import("./scan-result").then(module => module.ScanResult));
const subscribe = () => () => {};
export function Scanner({ readHash = false, showExamples = true, initialValue = "", onlyCountry }: { readHash?: boolean; showExamples?: boolean; initialValue?: string; onlyCountry?: string }) {
  const ui = useUi();
  const { locale } = useLocale();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [value, setValue] = useState(formatIban(initialValue));
  const [result, setResult] = useState<IbanResult | null>(null);
  const [error, setError] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const country = getCountry(normalizeIban(value).slice(0,2));
  useEffect(() => {
    if (!readHash) return;
    const processHash = () => { const params = new URLSearchParams(location.hash.slice(1)); const raw = params.get("iban"); if (raw && raw.length <= 256) { setValue(formatIban(raw)); setResult(analyzeIban(raw)); history.replaceState(null, "", location.pathname); } };
    processHash(); window.addEventListener("hashchange", processHash); return () => window.removeEventListener("hashchange", processHash);
  }, [readHash]);
  function change(raw: string, caret?: number) {
    const next = formatIban(raw); setValue(next); setError(""); setResult(null);
    if (caret !== undefined) { const lettersBefore = normalizeIban(raw.slice(0, caret)).length; const nextCaret = lettersBefore + Math.floor(Math.max(lettersBefore - 1, 0) / 4); requestAnimationFrame(() => field.current?.setSelectionRange(nextCaret, nextCaret)); }
  }
  function scan(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) { setError(ui.scanner.empty); field.current?.focus(); return; }
    if (onlyCountry && !normalizeIban(value).startsWith(onlyCountry)) { setError(ui.scannerDetails.italianOnly); return; }
    const analysis = analyzeIban(value); setResult(analysis); setError(""); track("iban_scan"); track(analysis.valid ? "iban_valid" : "iban_invalid");
    setTimeout(() => { resultRef.current?.focus({ preventScroll: true }); resultRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }, 40);
  }
  async function paste() { try { const raw = await navigator.clipboard.readText(); if(raw.length > 256) { setError(ui.scannerDetails.oversized); return; } change(raw); field.current?.focus(); } catch { setError(ui.scanner.pasteError); } }
  return <div className="scanner-area"><div className="scanner-card" id="scanner"><div className="scanner-card-top"><span><Icon name="scan" size={18}/>{ui.scanner.validation}</span><span className="local-label"><span className="status-dot"/>{ui.scanner.local}</span></div><form onSubmit={scan} noValidate><label htmlFor={id}>{ui.scanner.label}</label><div className={`scan-input-row ${error ? "input-error" : ""}`}><div className="input-wrap"><input id={id} ref={field} value={value} onChange={e => change(e.target.value, e.target.selectionStart ?? undefined)} placeholder={ui.scanner.placeholder} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={256} aria-invalid={!!error} aria-describedby={error ? id + "-error" : id + "-privacy"}/>{value ? <button type="button" className="icon-button clear-input" aria-label={ui.scanner.reset} onClick={() => { setValue(""); setResult(null); setError(""); field.current?.focus(); }}><Icon name="x" size={17}/></button> : <button type="button" className="icon-button clear-input" aria-label={ui.scanner.paste} title={ui.scanner.paste} onClick={paste}><Icon name="clipboard" size={18}/></button>}</div><button type="submit" disabled={!ready} className="button primary scan-button">{ui.scanner.submit}<Icon name="arrow" size={19}/></button></div>{error && <p className="field-error" id={id + "-error"} role="alert">{error}</p>}<div className="scanner-under-input"><span id={id + "-privacy"}><Icon name="lock" size={13}/>{ui.hero.privacyDetail}</span>{country && <span className="detected-country">{country.flag} {countryName(country.code, locale, country.name)}</span>}</div></form>{showExamples && <div className="example-row"><span>{ui.hero.example}</span>{examples.filter(ex=>!onlyCountry||ex.code===onlyCountry).map(ex => <button type="button" key={ex.code} onClick={() => { change(ex.iban); field.current?.focus(); }}><span className={`country-mini country-${ex.code.toLowerCase()}`}>{ex.code}</span>{countryName(ex.code, locale, ex.name)}<Icon name="upRight" size={12}/></button>)}</div>}</div>{result && <div ref={resultRef} tabIndex={-1} className="result-anchor" aria-label={result.valid ? ui.scanner.success : ui.scanner.failure}><ScanResult result={result}/></div>}</div>;
}
