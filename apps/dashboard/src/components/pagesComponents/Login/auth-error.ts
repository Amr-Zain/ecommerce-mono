import type { NormalizedHttpError } from '@ecommerce/http'

const genericHttpMessages =
  /^(request failed|bad request|unauthorized|http error)/i

export function getUserFacingAuthError(
  error: NormalizedHttpError,
  fallback: string,
) {
  const message = error.message.trim()
  return message && !genericHttpMessages.test(message) ? message : fallback
}
