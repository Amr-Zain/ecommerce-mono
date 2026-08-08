const SAFE_RETURN_PATH = /^\/(?!\/)/

function safeReturnPath(value: string | null | undefined, fallback = "/") {
  if (!value || !SAFE_RETURN_PATH.test(value)) return fallback

  try {
    const url = new URL(value, "http://localhost")
    return url.origin === "http://localhost"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback
  } catch {
    return fallback
  }
}

function stripLocalePrefix(value: string, locale?: string) {
  if (!locale) return value

  const prefix = `/${locale}`
  if (value === prefix) return "/"
  return value.startsWith(`${prefix}/`) ? value.slice(prefix.length) : value
}

function loginPath(returnTo: string, locale?: string) {
  const localeRelativeReturnTo = stripLocalePrefix(returnTo, locale)

  return `/auth/login?returnTo=${encodeURIComponent(
    safeReturnPath(localeRelativeReturnTo)
  )}`
}

export { loginPath, safeReturnPath, stripLocalePrefix }
