"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { Icon } from "./icon";
import { useLocale, useUi } from "./locale-provider";
import { isLocale, localeNames, locales } from "@/lib/i18n";

export function Header() {
  const ui = useUi();
  const { locale, setLocale, pending } = useLocale();
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const refresh = () => setDark(document.documentElement.dataset.theme === "dark");
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const frame = requestAnimationFrame(refresh);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, []);
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; try { localStorage.setItem("ibanscan-theme", next ? "dark" : "light"); } catch { /* Storage is optional. */ } };
  const links = [{ href: "/tools", label: ui.nav.tools }, { href: "/countries", label: ui.nav.countries }, { href: "/api", label: ui.nav.api }, { href: "/resources", label: ui.nav.resources }, { href: "/ai", label: ui.nav.ai }].map(link => ({ ...link, label: link.label.toUpperCase() }));
  return <header className="site-header"><div className="header-inner"><Link href="/" aria-label={ui.shell.homeLabel} onClick={() => setMenu(false)}><Logo /></Link><nav className="desktop-nav" aria-label={ui.shell.mainNavigation}>{links.map(l => <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "active" : ""}>{l.label}{l.href === "/ai" && <span className="nav-ai-dot" />}</Link>)}</nav><div className="header-actions"><label className="language-control"><span className="sr-only">{ui.nav.language}</span><select className="language-select" aria-label={ui.nav.language} value={locale} disabled={pending} onChange={event => { if (isLocale(event.target.value)) setLocale(event.target.value); }}>{locales.map(code => <option key={code} value={code} lang={code}>{localeNames[code]}</option>)}</select></label><button type="button" className="icon-button theme-toggle" aria-label={ui.nav.theme} onClick={toggleTheme}><Icon name={dark ? "sun" : "moon"} size={19}/></button><Link href="/#scanner" className="button button-small header-cta">{ui.nav.scan}<Icon name="arrow" size={16}/></Link><button type="button" className="icon-button mobile-menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu ? ui.nav.close : ui.nav.menu}><Icon name={menu ? "x" : "menu"}/></button></div></div>{menu && <nav id="mobile-navigation" className="mobile-nav" aria-label={ui.shell.mobileNavigation}>{links.map(l => <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}<Icon name="arrow" size={16}/></Link>)}</nav>}</header>;
}
