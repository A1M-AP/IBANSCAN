import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { defaultLocale, getMessages, getUi, isLocale, localeCookie } from "./i18n";

export const getLocale = cache(async () => {
  const value = (await cookies()).get(localeCookie)?.value;
  return isLocale(value) ? value : defaultLocale;
});

export async function getServerUi() { return getUi(await getLocale()); }
export async function getServerMessages() { return getMessages(await getLocale()); }
