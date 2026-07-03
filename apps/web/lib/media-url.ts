const UPLOADS_PREFIX = "/uploads/"
const UPLOADS_PROXY_PREFIX = "/api/uploads/"

function normalizeUploadUrl(url?: string | null) {
  if (!url) return null

  if (url.startsWith(UPLOADS_PROXY_PREFIX)) {
    return url
  }

  if (url.startsWith(UPLOADS_PREFIX)) {
    return `${UPLOADS_PROXY_PREFIX}${url.slice(UPLOADS_PREFIX.length)}`
  }

  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith(UPLOADS_PREFIX)) {
      return `${UPLOADS_PROXY_PREFIX}${parsed.pathname.slice(UPLOADS_PREFIX.length)}${parsed.search}`
    }
  } catch {
    return url
  }

  return url
}

export { normalizeUploadUrl }
