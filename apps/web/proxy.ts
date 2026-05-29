import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

import { localeCookieName, routing, type Locale } from "./i18n/routing"

const handleI18nRouting = createMiddleware(routing)

function getPathLocale(pathname: string) {
  const [, maybeLocale] = pathname.split("/")

  return routing.locales.find((locale) => locale === maybeLocale)
}

function getAcceptLanguageLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language") ?? ""

  if (/\bar\b/i.test(acceptLanguage)) {
    return "ar"
  }

  return routing.defaultLocale
}

function getRequestLocale(request: NextRequest): Locale {
  const pathLocale = getPathLocale(request.nextUrl.pathname)

  if (pathLocale) {
    return pathLocale
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value

  if (routing.locales.some((locale) => locale === cookieLocale)) {
    return cookieLocale as Locale
  }

  return getAcceptLanguageLocale(request)
}

export default function proxy(request: NextRequest) {
  const locale = getRequestLocale(request)
  const response = handleI18nRouting(request)

  response.cookies.set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  })

  return response
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
