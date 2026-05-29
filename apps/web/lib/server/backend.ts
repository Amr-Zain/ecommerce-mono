import "server-only"

import { auth } from "@/auth"
import { api, type ServerFetchOptions } from "@/lib/server/fetch"

type BackendOptions = ServerFetchOptions & {
  requireAuth?: boolean
}

async function withAuthHeaders(options: BackendOptions = {}) {
  const headers = new Headers(options.headers)

  if (options.requireAuth) {
    const session = await auth()

    if (!session?.accessToken) {
      throw new Response("Unauthorized", { status: 401 })
    }

    headers.set("authorization", `Bearer ${session.accessToken}`)
  }

  return {
    ...options,
    headers,
  }
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

export { backendDelete, backendGet, backendPatch, backendPost, backendPut }
export type { BackendOptions }
