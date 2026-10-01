import LegalContent, { legalMetadata } from "@/app/[lang]/resources/legal-content";
export function generateMetadata() { return legalMetadata("terms"); }
export default function Page() { return <LegalContent page="terms" />; }
