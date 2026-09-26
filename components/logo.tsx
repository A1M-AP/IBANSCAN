export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="logo"><svg width="31" height="31" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="9" fill="currentColor"/><path d="M11 8H8v5m13-5h3v5M8 19v5h3m13-5v5h-3M12 12v8m4-10v12m4-10v8" stroke="var(--logo-ink)" strokeWidth="1.7" strokeLinecap="round"/></svg>{!compact && <span>IBAN<span className="logo-light">Scan</span><span className="logo-dot">.</span></span>}</span>;
}
