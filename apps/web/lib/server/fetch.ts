import "server-only"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

type QueryValue = string | number | boolean | null | undefined

type RequestBody =
  | BodyInit
  | JsonValue
  | Record<string, unknown>
  | unknown[]
  | null

type NextFetchOptions = NonNullable<RequestInit["next"]>

type ServerFetchOptions = Omit<RequestInit, "body" | "cache" | "next"> & {
  body?: RequestBody
  baseUrl?: string
  cache?: RequestCache
  query?: Record<string, QueryValue | QueryValue[]>
  timeoutMs?: number
  retries?: number
  retryDelayMs?: number
  retryOn?: number[]
  next?: NextFetchOptions
  tags?: string[]
  revalidate?: false | 0 | number
}

type ApiErrorPayload = {
  message?: string
  error?: string
  errors?: unknown
  [key: string]: unknown
}

const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 300
const DEFAULT_RETRY_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isBodyInit(body: RequestBody): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  )
}

function withQuery(url: URL, query?: ServerFetchOptions["query"]) {
  if (!query) {
    return url
  }

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value]

    for (const item of values) {
      if (item !== undefined && item !== null) {
        url.searchParams.append(key, String(item))
      }
    }
  }

  return url
}

function resolveUrl(input: string | URL, baseUrl?: string) {
  if (input instanceof URL) {
    return new URL(input)
  }

  const resolvedBaseUrl = baseUrl ?? process.env.API_BASE_URL
  
  if (!resolvedBaseUrl && input.startsWith("/")) {
    throw new Error("API_BASE_URL is required for relative server fetch URLs")
  }
  const url = new URL(input, resolvedBaseUrl)
  if (!url.pathname.startsWith("/api/v1")) {
    url.pathname = `/api/v1${url.pathname}`
  }

  return url
}

function toHeaders(headers?: HeadersInit) {
  return new Headers(headers)
}

function prepareBody(body: RequestBody | undefined, headers: Headers) {
  if (body === undefined || body === null || isBodyInit(body)) {
    return body
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  return JSON.stringify(body)
}

function createTimeoutSignal(timeoutMs: number, signal?: AbortSignal) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener("abort", () => controller.abort(), { once: true })
    }
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  }
}

async function readErrorPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return (await response.json().catch(() => null)) as ApiErrorPayload | null
  }

  const text = await response.text().catch(() => "")

  return text ? { message: text } : null
}

function getErrorMessage(response: Response, payload: ApiErrorPayload | null) {
  return (
    payload?.message ??
    payload?.error ??
    `Request failed with status ${response.status}`
  )
}

function getRetryDelay(attempt: number, retryDelayMs: number) {
  return retryDelayMs * 2 ** attempt
}

export class HttpError extends Error {
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly payload: ApiErrorPayload | null

  constructor(response: Response, payload: ApiErrorPayload | null) {
    super(getErrorMessage(response, payload))
    this.name = "HttpError"
    this.status = response.status
    this.statusText = response.statusText
    this.url = response.url
    this.payload = payload
  }
}

export function cacheTag(...parts: Array<string | number | null | undefined>) {
  return parts.filter(Boolean).join(":")
}

export function cacheTags(
  namespace: string,
  parts: Array<string | number | null | undefined> = []
) {
  return [cacheTag(namespace, ...parts)]
}

export async function serverFetch(
  input: string | URL,
  options: ServerFetchOptions = {}
) {
  const {
    baseUrl,
    body,
    cache,
    headers: headersInput,
    next,
    query,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    retryOn = DEFAULT_RETRY_STATUS_CODES,
    signal,
    tags,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    revalidate,
    ...init
  } = options

  const url = withQuery(resolveUrl(input, baseUrl), query)
  const headers = toHeaders(headersInput)
  const requestBody = prepareBody(body, headers)
  const requestNext = {
    ...next,
    ...(tags ? { tags } : {}),
    ...(revalidate !== undefined ? { revalidate } : {}),
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeout = createTimeoutSignal(timeoutMs, signal ?? undefined)

    try {
      const response = await fetch(url, {
        ...init,
        body: requestBody,
        cache,
        headers,
        signal: timeout.signal,
        next: Object.keys(requestNext).length ? requestNext : undefined,
      })

      if (response.ok) {
        return response
      }

      if (attempt < retries && retryOn.includes(response.status)) {
        await sleep(getRetryDelay(attempt, retryDelayMs))
        continue
      }

      throw new HttpError(response, await readErrorPayload(response))
    } catch (error) {
      if (attempt < retries && error instanceof TypeError) {
        await sleep(getRetryDelay(attempt, retryDelayMs))
        continue
      }

      throw error
    } finally {
      timeout.clear()
    }
  }

  throw new Error("Request failed after retries")
}

export async function serverJson<T>(
  input: string | URL,
  options?: ServerFetchOptions
) {
  const response = await serverFetch(input, options)

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export const api = {
  request: serverFetch,
  get: <T>(url: string | URL, options?: ServerFetchOptions) =>
    serverJson<T>(url, { ...options, method: "GET" }),
  post: <T>(
    url: string | URL,
    body?: RequestBody,
    options?: ServerFetchOptions
  ) => serverJson<T>(url, { ...options, body, method: "POST" }),
  put: <T>(
    url: string | URL,
    body?: RequestBody,
    options?: ServerFetchOptions
  ) => serverJson<T>(url, { ...options, body, method: "PUT" }),
  patch: <T>(
    url: string | URL,
    body?: RequestBody,
    options?: ServerFetchOptions
  ) => serverJson<T>(url, { ...options, body, method: "PATCH" }),
  delete: <T>(url: string | URL, options?: ServerFetchOptions) =>
    serverJson<T>(url, { ...options, method: "DELETE" }),
}

export type { RequestBody, ServerFetchOptions }
