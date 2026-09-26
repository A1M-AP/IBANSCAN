import type { MetadataRoute } from "next";
import { countries } from "@/lib/countries";
import { guides } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import { toolCatalog } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/tools", "/countries", "/resources", "/ai", "/api", "/api/docs", "/api/playground", "/about", "/contact", "/privacy", "/cookies", "/terms", "/disclaimer", ...toolCatalog.map((tool) => `/tools/${tool.slug}`), ...countries.flatMap((country) => [`/countries/${country.slug}`, `/iban/${country.slug}`]), ...guides.map((guide) => `/resources/${guide.slug}`)];
  return pages.map((path) => ({ url: `${siteUrl()}${path}`, changeFrequency: path.startsWith("/countries/") || path.startsWith("/iban/") ? "monthly" : "weekly", priority: path === "" ? 1 : path.startsWith("/tools/") ? 0.8 : 0.6 }));
}
