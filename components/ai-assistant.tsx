"use client";
import { useId, useState } from "react";
import { Icon } from "./icon";
import { useUi, useLocale } from "./locale-provider";
import { track } from "@/lib/analytics";
export function AiAssistant({ iban }: { iban: string }) {
  const ui = useUi();
  const { locale } = useLocale();
  const id = useId();
  const [question, setQuestion] = useState<string>(ui.ai.suggestions[0]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  async function ask(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!consent) { setError(ui.ai.consentError); return; }
    setLoading(true); setAnswer(""); track("ai_question");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iban, question, locale }), signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (!response.ok) setError(typeof data.error === "string" ? data.error : ui.ai.error);
      else setAnswer(data.answer);
    } catch { setError(ui.ai.error); }
    finally { setLoading(false); }
  }
  return <section className="ai-assistant card" aria-labelledby={id + "-title"}><div className="ai-heading"><div className="feature-icon"><Icon name="sparkles"/></div><div><span className="eyebrow">{ui.ai.label}</span><h3 id={id + "-title"}>{ui.ai.title}</h3></div><span className="tag">AI</span></div><p className="muted">{ui.ai.description}</p><div className="suggestions">{ui.ai.suggestions.map(q => <button key={q} type="button" onClick={() => setQuestion(q)} className={q === question ? "selected" : ""}>{q}</button>)}</div><form onSubmit={ask}><label htmlFor={id + "-question"} className="sr-only">{ui.ai.questionLabel}</label><div className="ai-input-row"><input id={id + "-question"} value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} required placeholder={ui.ai.placeholder}/><button className="button primary" type="submit" disabled={loading}>{loading ? <Icon name="loading" className="spin"/> : <Icon name="sparkles" size={17}/>}<span>{loading ? ui.ai.loading : ui.ai.submit}</span></button></div><label className="checkbox-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/><span>{ui.ai.consent}</span></label></form>{error && <p role="alert" className="alert error-alert">{error}</p>}{answer && <div className="ai-answer" role="status"><Icon name="sparkles"/><p>{answer}</p></div>}<p className="fine-print">{ui.ai.privacy}</p></section>;
}
