"use client"

import type { HttpAdapter, HttpRequestOptions } from "@ecommerce/http"
import {
  clientJson,
  type ClientRequestBody,
} from "@/lib/client/http"
import { clientApiEndpoint } from "@/lib/client/client-api"
import { withSessionRetry } from "@/lib/client/session-request"

/**
 * Web/shop HTTP adapter.
 * Uses the existing BFF proxy pattern:
 * - Client-side requests go to /api/client/* (Next.js route handler)
 * - The route handler attaches the session token and proxies to the backend
 * - Credentials are included automatically (httpOnly cookies)
 * - 401 recovery uses withSessionRetry → server action refresh
 */
export function createWebHttpAdapter(options: {
  onUnauthorized: () => void
}): HttpAdapter {
  return {
    async request<T>(endpoint: string, reqOptions?: HttpRequestOptions): Promise<T> {
      const method = reqOptions?.method?.toUpperCase() ?? "GET"
      const authRequired = reqOptions?.authRequired ?? false

      let body: ClientRequestBody | undefined
      if (reqOptions?.body !== undefined) {
        body = reqOptions.body as ClientRequestBody
      }

      const data = await withSessionRetry(
        () =>
          clientJson<T>(clientApiEndpoint(endpoint), {
            body,
            formData: reqOptions?.formData,
            headers: reqOptions?.headers,
            method,
            params: reqOptions?.params as Record<string, string | number | boolean | null | undefined> | undefined,
          }),
        authRequired,
      )

      return data
    },

    onUnauthorized() {
      options.onUnauthorized()
    },
  }
}
