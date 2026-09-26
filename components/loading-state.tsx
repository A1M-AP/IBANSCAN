"use client";
import { useUi } from "@/components/locale-provider";
/** Opt-in skeleton for asynchronous panels; static pages remain visible without JavaScript. */
export function LoadingState() {
  const ui = useUi(); return <div className="page-shell loading-shell" role="status" aria-label={ui.shell.loadingLabel}><div className="skeleton skeleton-title"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-card"/><span className="sr-only">{ui.shell.loading}</span></div>; }
