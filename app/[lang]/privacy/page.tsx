import LegalContent, { legalMetadata } from "@/app/[lang]/resources/legal-content";
export function generateMetadata() { return legalMetadata("privacy"); }
export default function Page() { return <LegalContent page="privacy" />; }
