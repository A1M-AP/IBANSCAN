"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, getUi, isLocale, localeCookie, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const locale = useContext(LocaleContext);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function setLocale(next: Locale) {
    if (!isLocale(next) || next === locale) return;
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    startTransition(() => router.refresh());
  }
  return { locale, setLocale, pending };
}

export function useUi() { return getUi(useContext(LocaleContext)); }
