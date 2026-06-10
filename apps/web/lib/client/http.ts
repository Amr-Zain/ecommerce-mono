"use client"

import { applyApiHeaders } from "@/lib/http-headers"

type QueryValue = string | number | boolean | null | undefined

type JsonBody =
  | string
  | number
  | boolean
  | null
  | JsonBody[]
  | { [key: string]: JsonBody }

type ClientRequestBody =
  | BodyInit
  | JsonBody
  | Record<string, unknown>
  | unknown[]
  | null

type ClientRequestOptions = Omit<RequestInit, "body"> & {
  body?: ClientRequestBody
  params?: Record<string, QueryValue | QueryValue[]>
  customBaseUrl?: string
  headers?: HeadersInit
}

type NormalizedHttpError = {
  name: string
  message: string
  status?: number
  statusText?: string
  body?: unknown
  errors?: unknown
}

function isBodyInit(body: ClientRequestBody): body is BodyInit {
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

function appendParams(url: URL, params?: ClientRequestOptions["params"]) {
  if (!params) {
    return url
  }

  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value]

    for (const item of values) {
      if (item !== null && item !== undefined) {
        url.searchParams.append(key, String(item))
      }
    }
  }

  return url
}

function resolveClientUrl(endpoint: string, customBaseUrl?: string) {
  if (/^https?:\/\//i.test(endpoint)) {
    return new URL(endpoint)
  }

  if (customBaseUrl) {
    return new URL(endpoint, customBaseUrl)
  }

  return new URL(endpoint, window.location.origin)
}

function hasFile(value: unknown): boolean {
  if (value instanceof File || value instanceof Blob) {
    return true
  }

  if (Array.isArray(value)) {
    return value.some(hasFile)
  }

  return false
}

function toFormData(body: Record<string, unknown>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) {
      continue
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined) {
          continue
        }

        formData.append(
          key,
          typeof item === "object" && !(item instanceof File)
            ? JSON.stringify(item)
            : String(item)
        )
      }
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  }

  return formData
}

function prepareRequestBody(
  body: ClientRequestBody | undefined,
  headers: Headers,
  forceFormData?: boolean
) {
  if (body === undefined || body === null || isBodyInit(body)) {
    return body
  }

  if (
    forceFormData ||
    (typeof body === "object" &&
      !Array.isArray(body) &&
      Object.values(body).some(hasFile))
  ) {
    headers.delete("content-type")
    return toFormData(body as Record<string, unknown>)
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  return JSON.stringify(body)
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => "")
}

function extractMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const payload = body as Record<string, unknown>
    const message = payload.message ?? payload.error

    if (typeof message === "string") {
      return message
    }
  }

  if (typeof body === "string" && body.trim()) {
    return body
  }

  return fallback
}

class ClientHttpError extends Error {
  readonly status?: number
  readonly statusText?: string
  readonly body?: unknown
  readonly errors?: unknown

  constructor(message: string, response?: Response, body?: unknown) {
    super(message)
    this.name = "ClientHttpError"
    this.status = response?.status
    this.statusText = response?.statusText
    this.body = body
    this.errors =
      body && typeof body === "object"
        ? (body as Record<string, unknown>).errors
        : undefined
  }
}

function toNormalizedHttpError(error: unknown): NormalizedHttpError {
  if (error instanceof ClientHttpError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      body: error.body,
      errors: error.errors,
    }
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  return {
    name: "UnknownError",
    message: "An error occurred",
  }
}

async function clientRequest(
  endpoint: string,
  options: ClientRequestOptions & { formData?: boolean } = {}
) {
  const {
    body,
    customBaseUrl,
    formData,
    headers: headersInput,
    params,
    ...init
  } = options
  const language = document.documentElement.lang || navigator.language || "en"
  const headers = applyApiHeaders(headersInput, language)
  const url = appendParams(resolveClientUrl(endpoint, customBaseUrl), params)
  const requestBody = prepareRequestBody(body, headers, formData)
  const response = await fetch(url, {
    ...init,
    body: requestBody,
    credentials: init.credentials ?? "include",
    headers,
  })

  if (!response.ok) {
    const responseBody = await readResponseBody(response)

    throw new ClientHttpError(
      extractMessage(
        responseBody,
        `Request failed with status ${response.status}`
      ),
      response,
      responseBody
    )
  }

  return response
}

async function clientJson<T>(
  endpoint: string,
  options?: ClientRequestOptions & { formData?: boolean }
) {
  const response = await clientRequest(endpoint, options)

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

export {
  ClientHttpError,
  clientJson,
  clientRequest,
  toFormData,
  toNormalizedHttpError,
}
export type { ClientRequestBody, ClientRequestOptions, NormalizedHttpError }
