import Script from "next/script";
import { googleCmpUrl } from "@/lib/advertising";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLocale, getServerUi } from "@/lib/i18n-server";
import { isLocale, locales } from "@/lib/i18n";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/locale-provider";
import { CursorGlow } from "@/components/cursor-glow";
import "../globals.css";
import "@/styles/refinements.css";
import "@/styles/apple.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ibanscan.com",
  ),
  title: {
    default: "IBANScan — Scan. Verify. Understand.",
    template: "%s | IBANScan",
  },
  description:
    "Validate and understand IBANs with private, instant checks. Explore country formats, verified bank information, IBAN calculation and currency tools.",
  openGraph: {
    type: "website",
    siteName: "IBANScan",
    locale: "en_US",
    title: "IBANScan — Scan. Verify. Understand.",
    description: "A little clarity for every IBAN.",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
};
/** Every language is prerendered. Unknown pages inside a language reach [...missing] and its styled 404. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
const themeScript = `(function(){try{var t=localStorage.getItem('ibanscan-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})()`;
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Only file-like paths (e.g. /foo.php) reach this layout with a non-language segment.
  if (!isLocale(await lang())) notFound();
  const [locale, ui] = await Promise.all([getLocale(), getServerUi()]);
  const cmp = googleCmpUrl(process.env.NEXT_PUBLIC_GOOGLE_CMP_URL);
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <a className="skip-link" href="#main-content">
            {ui.shell.skip}
          </a>
          <Header />
          <CursorGlow />
          {cmp && <Script src={cmp} strategy="afterInteractive" />}
          <noscript>
            <p className="page-shell alert">{ui.shell.noScript}</p>
          </noscript>
          <main id="main-content">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
