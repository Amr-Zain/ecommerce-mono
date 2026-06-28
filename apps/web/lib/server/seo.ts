import "server-only"

import type { Metadata } from "next"
import { routing } from "@/i18n/routing"

const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "http://localhost:3000"

export function siteUrl(): string {
  return DEFAULT_SITE_URL.replace(/\/$/, "")
}

/**
 * Returns the URL path for a given locale, honoring the `as-needed` locale prefix.
 * `en` (default locale) → no prefix; other locales → `/${locale}/...`.
 */
export function localizedPath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (locale === routing.defaultLocale) return normalized
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`
}

export function absoluteUrl(locale: string, path: string): string {
  return `${siteUrl()}${localizedPath(locale, path)}`
}

/**
 * Build canonical + hreflang alternates for a route path across all supported locales.
 */
export function localeAlternates(path: string, locale: string): Pick<Metadata, "alternates"> {
  const canonical = absoluteUrl(locale, path)
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(loc, path)
  }
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path)
  return { alternates: { canonical, languages } }
}

export const noindexMetadata: Metadata = {
  robots: { index: false, follow: false },
}