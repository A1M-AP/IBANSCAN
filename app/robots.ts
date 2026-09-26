import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/v1/", "/api/ai", "/api/health", "/admin", "/dashboard"] }, sitemap: `${siteUrl()}/sitemap.xml`, host: siteUrl() };
}
