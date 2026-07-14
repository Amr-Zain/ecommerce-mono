import type { HttpAdapter, HttpRequestOptions } from "@ecommerce/http"
import type { NormalizedHttpError } from "@ecommerce/http"
import axiosInstance from "@/services/instance"
import { ADMIN_API_BASE_URL, API_BASE_URL } from "@/lib/env"

/**
 * Extended request options for the dashboard adapter.
 * Supports `general` flag to switch between admin and public API base URLs.
 */
export interface DashboardRequestOptions extends HttpRequestOptions {
  /** Use the general (public) base URL instead of the admin base URL */
  general?: boolean
}

/**
 * Dashboard HTTP adapter.
 * Uses the existing Axios instance which already handles:
 * - Bearer token injection from the in-memory dashboard session
 * - 401 → refresh token rotation
 * - Accept-Language header
 */
export function createDashboardHttpAdapter(options: {
  onUnauthorized: () => void
  onRequestError?: (error: NormalizedHttpError) => void
  onMutationSuccess?: (data: unknown) => void
  onRedirect?: (path: string) => void
}): HttpAdapter {
  return {
    async request<T>(endpoint: string, reqOptions?: HttpRequestOptions): Promise<T> {
      const dashOptions = reqOptions as DashboardRequestOptions | undefined
      const baseURL = dashOptions?.general ? API_BASE_URL : ADMIN_API_BASE_URL

      if (reqOptions?.method === "GET" || !reqOptions?.method) {
        const res = await axiosInstance.get<T>(`${baseURL}/${endpoint}`, {
          params: reqOptions?.params,
          headers: reqOptions?.headers as Record<string, string> | undefined,
        })
        return res.data
      }

      const method = reqOptions.method.toLowerCase() as "post" | "put" | "patch" | "delete"

      if (method === "delete") {
        const res = await axiosInstance.delete<T>(`${baseURL}/${endpoint}`, {
          params: reqOptions.params,
          headers: reqOptions.headers as Record<string, string> | undefined,
        })
        return res.data
      }

      // Handle formData
      const requestHeaders: Record<string, string> = {
        ...(reqOptions.headers as Record<string, string> | undefined),
      }
      if (reqOptions.formData) {
        requestHeaders["Content-Type"] = "multipart/form-data"
      }

      const res = await axiosInstance[method]<T>(
        `${baseURL}/${endpoint}`,
        reqOptions.body,
        {
          params: reqOptions.params,
          headers: Object.keys(requestHeaders).length ? requestHeaders : undefined,
        },
      )
      return res.data
    },

    onUnauthorized() {
      options.onUnauthorized()
    },

    onRequestError(error) {
      options.onRequestError?.(error)
    },

    onMutationSuccess(data) {
      options.onMutationSuccess?.(data)
    },

    onRedirect(path) {
      options.onRedirect?.(path)
    },
  }
}
