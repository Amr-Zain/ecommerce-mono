import "server-only"

import { cookies, headers as requestHeaders } from "next/headers"
import { auth } from "@/auth"
import { api, type ServerFetchOptions } from "@/lib/server/fetch"
import { applyApiHeaders } from "@/lib/http-headers"

type BackendOptions = ServerFetchOptions & {
  accessToken?: string
  includeCookies?: boolean
  requireAuth?: boolean
}

async function withAuthHeaders(options: BackendOptions = {}) {
  const { accessToken, includeCookies, requireAuth, ...requestOptions } =
    options
  const incomingHeaders = await requestHeaders()
  const headers = applyApiHeaders(
    requestOptions.headers,
    incomingHeaders.get("accept-language") ?? "en"
  )

  if (includeCookies && !headers.has("cookie")) {
    const cookieHeader = (await cookies()).toString()
    if (cookieHeader) headers.set("cookie", cookieHeader)
  }

  if (!headers.has("authorization") && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`)
  } else if (!headers.has("authorization")) {
    const session = await auth()

    if (session?.accessToken) {
      headers.set("authorization", `Bearer ${session.accessToken}`)
    } else if (requireAuth) {
      throw new Response("Unauthorized", { status: 401 })
    }
  }

  return {
    ...requestOptions,
    headers,
  }
}

async function backendRequest(url: string | URL, options?: BackendOptions) {
  return api.request(url, await withAuthHeaders(options))
}

async function backendGet<T>(url: string | URL, options?: BackendOptions) {
  return api.get<T>(url, await withAuthHeaders(options))
}

async function backendPost<T>(
  url: string | URL,
  body?: ServerFetchOptions["body"],
  options?: BackendOptions
) {
  return api.post<T>(url, body, await withAuthHeaders(options))
}

async function backendPut<T>(
  url: string | URL,
  body?: ServerFetchOptions["body"],
  options?: BackendOptions
) {
  return api.put<T>(url, body, await withAuthHeaders(options))
}

async function backendPatch<T>(
  url: string | URL,
  body?: ServerFetchOptions["body"],
  options?: BackendOptions
) {
  return api.patch<T>(url, body, await withAuthHeaders(options))
}

async function backendDelete<T>(url: string | URL, options?: BackendOptions) {
  return api.delete<T>(url, await withAuthHeaders(options))
}

export {
  backendDelete,
  backendGet,
  backendPatch,
  backendPost,
  backendPut,
  backendRequest,
  withAuthHeaders,
}
export type { BackendOptions }
