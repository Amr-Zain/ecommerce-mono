import type { NormalizedHttpError } from "./types"

/**
 * Normalize any thrown value into a consistent error shape.
 * Works with Axios errors, fetch Response errors, plain Error objects, etc.
 */
export function normalizeError(error: unknown): NormalizedHttpError {
  if (isAxiosNetworkError(error)) {
    return {
      name: "NetworkError",
      message: extractMessage(error) ?? "Cannot connect to the server. Please check the API connection and try again.",
      status: undefined,
      statusText: undefined,
      body: undefined,
      errors: undefined,
    }
  }

  // Axios-style error (error.response.data)
  if (isAxiosLike(error)) {
    const response = error.response
    const data = response?.data as Record<string, unknown> | undefined
    return {
      name: "HttpError",
      message:
        extractMessage(data) ??
        extractMessage(error) ??
        `Request failed with status ${response?.status ?? "unknown"}`,
      status: response?.status,
      statusText: response?.statusText,
      body: data,
      errors: data?.errors,
    }
  }

  // ClientHttpError-style (error.status, error.body)
  if (hasStatus(error)) {
    const body = (error as Record<string, unknown>).body
    const errObj = error as Record<string, unknown>
    const bodyMessage = extractMessage(body)
    return {
      name: (typeof errObj.name === "string" ? errObj.name : undefined) ?? "HttpError",
      message:
        bodyMessage ??
        (typeof errObj.message === "string" ? errObj.message : undefined) ??
        `Request failed with status ${(error as { status: number }).status}`,
      status: (error as { status: number }).status,
      statusText: typeof errObj.statusText === "string" ? errObj.statusText : undefined,
      body,
      errors: body && typeof body === "object" ? (body as Record<string, unknown>).errors : undefined,
    }
  }

  if (isNormalizedHttpError(error)) {
    const bodyMessage = extractMessage(error.body)
    return bodyMessage ? { ...error, message: bodyMessage } : error
  }

  // Plain Error
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  // Unknown
  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "An error occurred",
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNormalizedHttpError(value: unknown): value is NormalizedHttpError {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "message" in value &&
    typeof (value as Record<string, unknown>).name === "string" &&
    typeof (value as Record<string, unknown>).message === "string"
  )
}

function isAxiosLike(
  error: unknown,
): error is { response: { status: number; statusText?: string; data?: unknown }; message?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as Record<string, unknown>).response === "object" &&
    (error as Record<string, unknown>).response !== null
  )
}

function isAxiosNetworkError(error: unknown): error is { message?: string; code?: string; request?: unknown } {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    !("response" in error && (error as Record<string, unknown>).response)
  )
}

function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as Record<string, unknown>).status === "number"
  )
}

function extractMessage(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined
  const payload = obj as Record<string, unknown>
  if (typeof payload.details === "string") return payload.details
  if (typeof payload.message === "string") return payload.message
  if (typeof payload.error === "string") return payload.error
  if (Array.isArray(payload.message)) return payload.message.join("; ")
  if (Array.isArray(payload.details)) return payload.details.join("; ")
  return undefined
}
