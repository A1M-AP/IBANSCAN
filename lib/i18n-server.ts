import "server-only";
import { lang } from "next/root-params";
import { cache } from "react";
import { defaultLocale, getMessages, getUi, isLocale } from "./i18n";

/** The language comes from the URL (/it/..., /de/...); unprefixed URLs are English. */
export const getLocale = cache(async () => {
  const value = await lang();
  return isLocale(value) ? value : defaultLocale;
});

export async function getServerUi() { return getUi(await getLocale()); }
export async function getServerMessages() { return getMessages(await getLocale()); }
