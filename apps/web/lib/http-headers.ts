const DEFAULT_LANGUAGE = "en"

function applyApiHeaders(
  headersInput?: HeadersInit,
  language = DEFAULT_LANGUAGE
) {
  const headers = new Headers(headersInput)

  if (!headers.has("accept")) {
    headers.set("accept", "application/json")
  }
  if (!headers.has("accept-language")) {
    headers.set("accept-language", language)
  }
  if (!headers.has("x-platform")) {
    headers.set("x-platform", "browser")
  }

  return headers
}

export { applyApiHeaders }
