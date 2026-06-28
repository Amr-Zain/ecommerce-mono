import type { NormalizedHttpError } from "./types"

/**
 * Normalize any thrown value into a consistent error shape.
 * Works with Axios errors, fetch Response errors, plain Error objects, etc.
 */
export function normalizeError(error: unknown): NormalizedHttpError {
  if (isNormalizedHttpError(error)) {
    return error
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
    return {
      name: (typeof errObj.name === "string" ? errObj.name : undefined) ?? "HttpError",
      message:
        (typeof errObj.message === "string" ? errObj.message : undefined) ??
        `Request failed with status ${(error as { status: number }).status}`,
      status: (error as { status: number }).status,
      statusText: typeof errObj.statusText === "string" ? errObj.statusText : undefined,
      body,
      errors: body && typeof body === "object" ? (body as Record<string, unknown>).errors : undefined,
    }
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
  if (typeof payload.message === "string") return payload.message
  if (typeof payload.error === "string") return payload.error
  return undefined
}
