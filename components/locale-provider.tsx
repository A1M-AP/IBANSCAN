"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, getUi, isLocale, localeCookie, localePath, stripLocale, type Locale } from "@/lib/i18n";
import { carriedScanHash } from "@/lib/scan-carry";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useCurrentLocale() {
  return useContext(LocaleContext);
}

export function useLocale() {
  const locale = useContext(LocaleContext);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function setLocale(next: Locale) {
    if (!isLocale(next) || next === locale) return;
    // Remembered so unprefixed URLs (e.g. the bare domain) open in the chosen language.
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    const target = localePath(next, stripLocale(location.pathname)) + location.search + carriedScanHash();
    startTransition(() => router.push(target, { scroll: false }));
  }
  return { locale, setLocale, pending };
}

export function useUi() { return getUi(useContext(LocaleContext)); }
