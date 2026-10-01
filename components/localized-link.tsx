"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localePath } from "@/lib/i18n";
import { useCurrentLocale } from "./locale-provider";

/** next/link that keeps visitors in their language: "/tools" becomes "/it/tools" on Italian pages. */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useCurrentLocale();
  return <NextLink href={typeof href === "string" ? localePath(locale, href) : href} {...props} />;
}
