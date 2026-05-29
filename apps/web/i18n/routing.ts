import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  },
})

export type Locale = (typeof routing.locales)[number]

export const localeCookieName = "NEXT_LOCALE"
