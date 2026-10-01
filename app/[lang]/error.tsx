"use client";
import { useUi } from "@/components/locale-provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const ui = useUi(); return <div className="page-shell page-heading"><span className="eyebrow">IBANSCAN</span><h1>{ui.error.title}</h1><p>{ui.error.description}</p><button className="button primary" onClick={reset}>{ui.error.retry}</button></div>; }
