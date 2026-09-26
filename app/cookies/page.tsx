import LegalContent from "@/app/resources/legal-content";
import { legalPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(legalPages.cookies.title, legalPages.cookies.description, "/cookies");
export default function CookiesPage() { return <LegalContent page="cookies" />; }
