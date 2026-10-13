import type { MetadataRoute } from "next";
import { countries } from "@/lib/countries";
import { guides } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { languageAlternates, localizedUrl } from "@/lib/seo";
import { toolCatalog } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/tools", "/countries", "/resources", "/data-sources", "/about", "/contact", "/privacy", "/cookies", "/terms", "/disclaimer", ...toolCatalog.map((tool) => `/tools/${tool.slug}`), ...countries.flatMap((country) => [`/countries/${country.slug}`, `/iban/${country.slug}`]), ...guides.map((guide) => `/resources/${guide.slug}`)];
  // Every language edition is listed, each with hreflang links to the others.
  return pages.flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(path, locale),
      alternates: { languages: languageAlternates(path) },
      changeFrequency: path.startsWith("/countries/") || path.startsWith("/iban/") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.startsWith("/tools/") ? 0.8 : 0.6,
    })),
  );
}
