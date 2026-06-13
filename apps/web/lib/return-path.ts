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

function loginPath(returnTo: string, locale?: string) {
  const prefix = locale === "ar" ? "/ar" : ""
  return `${prefix}/auth/login?returnTo=${encodeURIComponent(
    safeReturnPath(returnTo, prefix || "/")
  )}`
}

export { loginPath, safeReturnPath }
