import en from "@/locales/en";
import it from "@/locales/it";
import de from "@/locales/de";
import fr from "@/locales/fr";
import es from "@/locales/es";
import { ui as uiEn } from "@/locales/ui.en";
import { ui as uiIt } from "@/locales/ui.it";
import { ui as uiDe } from "@/locales/ui.de";
import { ui as uiFr } from "@/locales/ui.fr";
import { ui as uiEs } from "@/locales/ui.es";
import type { Ui } from "@/locales/types";

export const locales = ["en", "it", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "ibanscan-locale";
export function isLocale(value: unknown): value is Locale { return typeof value === "string" && locales.includes(value as Locale); }
export const localeNames: Record<Locale, string> = { en: "English", it: "Italiano", de: "Deutsch", fr: "Français", es: "Español" };
const translations = { en, it, de, fr, es };
const uiTranslations: Record<Locale, Ui> = { en: uiEn, it: uiIt, de: uiDe, fr: uiFr, es: uiEs };
export function getUi(locale: string = defaultLocale): Ui { return uiTranslations[isLocale(locale) ? locale : defaultLocale]; }

type MessageShape<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly MessageShape<U>[] : T extends object ? { [K in keyof T]: MessageShape<T[K]> } : T;
export type Messages = MessageShape<typeof en>;

function mergeMessages(base: Record<string, unknown>, translated: Record<string, unknown>): Record<string, unknown> {
  const result = { ...base };
  for (const [key, value] of Object.entries(translated)) {
    const fallback = result[key];
    result[key] = value && typeof value === "object" && !Array.isArray(value) && fallback && typeof fallback === "object" && !Array.isArray(fallback)
      ? mergeMessages(fallback as Record<string, unknown>, value as Record<string, unknown>)
      : value;
  }
  return result;
}

/** Shared reference-page messages. Editorial guide articles have separate translations. */
export function getMessages(locale: string = defaultLocale): Messages {
  const selected = locales.includes(locale as Locale) ? translations[locale as Locale] : en;
  return mergeMessages(en, selected) as Messages;
}
