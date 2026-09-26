import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getLocale, getServerUi } from "@/lib/i18n-server";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";
import "@/styles/refinements.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ibanscan.com"),
  title: { default: "IBANScan — Scan. Verify. Understand.", template: "%s | IBANScan" },
  description: "Validate and understand IBANs with private, instant checks. Explore country formats, verified bank information, bulk tools and AI explanations.",
  openGraph: { type: "website", siteName: "IBANScan", locale: "en_US", title: "IBANScan — Scan. Verify. Understand.", description: "A little clarity for every IBAN.", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#111113" }] };
const themeScript = `(function(){try{var t=localStorage.getItem('ibanscan-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})()`;
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, ui] = await Promise.all([getLocale(), getServerUi()]);
  return <html lang={locale} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body><LocaleProvider locale={locale}><a className="skip-link" href="#main-content">{ui.shell.skip}</a><Header/><noscript><p className="page-shell alert">{ui.shell.noScript}</p></noscript><main id="main-content">{children}</main><Footer/></LocaleProvider></body></html>;
}
