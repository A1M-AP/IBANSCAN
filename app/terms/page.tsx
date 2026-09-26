import LegalContent from "@/app/resources/legal-content";
import { legalPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(legalPages.terms.title, legalPages.terms.description, "/terms");
export default function TermsPage() { return <LegalContent page="terms" />; }
