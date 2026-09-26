import { googleCmpUrl } from "./lib/advertising";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  reactStrictMode: true,
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
