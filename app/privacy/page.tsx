import LegalContent from "@/app/resources/legal-content";
import { legalPages } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(legalPages.privacy.title, legalPages.privacy.description, "/privacy");
export default function PrivacyPage() { return <LegalContent page="privacy" />; }
