import { notFound } from "next/navigation";
/** Unknown paths inside a language render that language's not-found page (never cached). */
export const dynamic = "force-dynamic";
export default function Missing() {
  notFound();
}
