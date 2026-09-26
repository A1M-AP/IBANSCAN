import LegalContent from "@/app/resources/legal-content";
import { legalPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(legalPages.disclaimer.title, legalPages.disclaimer.description, "/disclaimer");
export default function DisclaimerPage() { return <LegalContent page="disclaimer" />; }
