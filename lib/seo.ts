import type { Metadata } from "next";
import { defaultLocale, isLocale, localePath, locales, type Locale } from "./i18n";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibanscan.com";
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "https://ibanscan.com";
    return url.origin;
  } catch {
    return "https://ibanscan.com";
  }
}

/** Absolute URL of a path in a given language. */
export function localizedUrl(path: string, locale: Locale = defaultLocale): string {
  const localized = localePath(locale, path);
  return `${siteUrl()}${localized === "/" ? "" : localized}`;
}

/** hreflang alternates for every language, with English as x-default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((l) => [l, localizedUrl(path, l)])),
    "x-default": localizedUrl(path, defaultLocale),
  };
}

export function pageMetadata(title: string, description: string, path: string, locale: string = defaultLocale): Metadata {
  const url = localizedUrl(path, isLocale(locale) ? locale : defaultLocale);
  // Titles that already carry the brand (the homepage) must not get the " | IBANScan" suffix twice.
  const branded = title.startsWith("IBANScan");
  const fullTitle = branded ? title : `${title} | IBANScan`;
  return {
    title: branded ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title: fullTitle, description, url, siteName: "IBANScan", locale: ({ en: "en_US", it: "it_IT", de: "de_DE", fr: "fr_FR", es: "es_ES" } as Record<string, string>)[locale] || "en_US", type: "website", images: [{ url: `${siteUrl()}/opengraph-image`, width: 1200, height: 630, alt: "IBANScan — Scan. Verify. Understand." }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [`${siteUrl()}/opengraph-image`] },
  };
}

/** Escape script delimiters even when future content comes from an editorial CMS. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function faqSchema(items: ReadonlyArray<{ question: string; answer: string }>) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}

export function breadcrumbSchema(items: ReadonlyArray<{ name: string; path: string }>, locale: Locale = defaultLocale) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: localizedUrl(item.path, locale) })) };
}
