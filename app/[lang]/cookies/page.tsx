import LegalContent, { legalMetadata } from "@/app/[lang]/resources/legal-content";
export function generateMetadata() { return legalMetadata("cookies"); }
export default function Page() { return <LegalContent page="cookies" />; }
