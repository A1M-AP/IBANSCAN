import { googleCmpUrl } from "./lib/advertising";
import type { NextConfig } from "next";

/** First path segment of a page: not a language, API, build asset, OG image, or a file with an extension. */
const pageSegment = ":first((?!(?:en|it|de|fr|es|api|_next|opengraph-image)(?:/|$))[^/.]+)";
const otherLocales = ["it", "de", "fr", "es"];
const localeCookie = "ibanscan-locale";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      // English is canonical without a prefix.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
      // Retired AI / Business API pages.
      ...["/ai", "/api", "/api/docs", "/api/playground"].map((source) => ({ source, destination: "/tools", permanent: true })),
      // A saved language choice sends unprefixed (English) URLs to that language.
      ...otherLocales.flatMap((locale) => {
        const has = [{ type: "cookie" as const, key: localeCookie, value: locale }];
        return [
          { source: "/", has, destination: `/${locale}`, permanent: false },
          { source: `/${pageSegment}/:rest*`, has, destination: `/${locale}/:first/:rest*`, permanent: false },
        ];
      }),
    ];
  },
  async rewrites() {
    return {
      // Unprefixed URLs are served by the English edition of app/[lang].
      beforeFiles: [
        { source: "/", destination: "/en" },
        { source: `/${pageSegment}/:rest*`, destination: "/en/:first/:rest*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    const ads=!!googleCmpUrl(process.env.NEXT_PUBLIC_GOOGLE_CMP_URL)&&/^ca-pub-\d{16}$/.test(process.env.NEXT_PUBLIC_ADSENSE_CLIENT||'');
    const adOrigins=ads?' https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://fundingchoicesmessages.google.com':'';
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + adOrigins + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:" + adOrigins,
      "font-src 'self'",
      "connect-src 'self'" + adOrigins,
      ads ? "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com" : "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    ] }];
  },
};
export default nextConfig;
