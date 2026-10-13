import { formatIban } from "./iban";
import { scannerExamples } from "./scanner-examples";
import { productCopy } from "@/locales/product";
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
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}
/** English lives at unprefixed URLs; every other language under /<locale>. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (locale === defaultLocale || /^\/(api|_next)(\/|$)/.test(path)) return path;
  const cut = path.search(/[?#]/);
  const pathname = cut < 0 ? path : path.slice(0, cut);
  const suffix = cut < 0 ? "" : path.slice(cut);
  if (/\.[a-z0-9]+$/i.test(pathname)) return path;
  return `/${locale}${pathname === "/" ? "" : pathname}${suffix}`;
}
/** Removes a locale prefix: "/it/tools" -> "/tools", "/it" -> "/". */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
  if (!match || !isLocale(match[1])) return pathname || "/";
  return pathname.slice(3) || "/";
}
export const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};
const translations = { en, it, de, fr, es };
const uiTranslations: Record<Locale, Ui> = {
  en: uiEn,
  it: uiIt,
  de: uiDe,
  fr: uiFr,
  es: uiEs,
};
const uiCache: Partial<Record<Locale, Ui>> = {};
export function getUi(locale: string = defaultLocale): Ui {
  const selected = isLocale(locale) ? locale : defaultLocale;
  const ui = uiTranslations[selected];
  if (uiCache[selected]) return uiCache[selected];
  const notes = {
    en: "These checks cover national format and the international checksum. See the bank profile for separately sourced SEPA participation.",
    it: "Questi controlli verificano formato nazionale e checksum internazionale. Le adesioni SEPA sono documentate separatamente nel profilo bancario.",
    de: "Diese Prüfungen betreffen Länderformat und internationale Prüfziffern. Die separat belegte SEPA-Teilnahme steht im Bankprofil.",
    es: "Estos controles verifican el formato nacional y la suma de control internacional. La participación SEPA se documenta por separado en el perfil bancario.",
    fr: "Ces contrôles portent sur le format national et la clé internationale. La participation SEPA est documentée séparément dans le profil bancaire.",
  };
  return (uiCache[selected] = {
    ...ui,
    scanner: {
      ...ui.scanner,
      placeholder: formatIban(scannerExamples.IT),
      domestic: notes[selected],
      sepaNote: productCopy[selected].schemeNote,
    },
    bankDetails: { ...ui.bankDetails, scope: productCopy[selected].bankScope },
  });
}

type MessageShape<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly MessageShape<U>[]
    : T extends object
      ? { [K in keyof T]: MessageShape<T[K]> }
      : T;
export type Messages = MessageShape<typeof en>;

function mergeMessages(
  base: Record<string, unknown>,
  translated: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const [key, value] of Object.entries(translated)) {
    const fallback = result[key];
    result[key] =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      fallback &&
      typeof fallback === "object" &&
      !Array.isArray(fallback)
        ? mergeMessages(
            fallback as Record<string, unknown>,
            value as Record<string, unknown>,
          )
        : value;
  }
  return result;
}

/** Shared reference-page messages. Editorial guide articles have separate translations. */
export function getMessages(locale: string = defaultLocale): Messages {
  const selected = locales.includes(locale as Locale)
    ? translations[locale as Locale]
    : en;
  return mergeMessages(en, selected) as Messages;
}
