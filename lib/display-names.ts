import names from "@/data/display-names.json";
import type { Locale } from "./i18n";
/** Checked-in localized labels prevent Node/Workers/browser ICU hydration differences. */
export function displayName(
  code: string,
  locale: Locale,
  type: "region" | "currency",
  fallback = code,
): string {
  return (names[locale][type] as Record<string, string>)[code] || fallback;
}
