import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { routing } from "./routing"
import { arabicOverrides } from "./arabic-overrides"

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const messages = (await import(`../messages/${locale}.json`)).default

  return {
    locale,
    messages:
      locale === "ar"
        ? {
            ...messages,
            Header: { ...messages.Header, ...arabicOverrides.Header },
            Storefront: {
              ...messages.Storefront,
              ...arabicOverrides.Storefront,
            },
          }
        : messages,
  }
})
