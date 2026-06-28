"use client"

import type { QueryKey, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query"

// ---------------------------------------------------------------------------
// HTTP Adapter — each app provides its own implementation via React context
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface HttpRequestOptions {
  method?: HttpMethod
  body?: unknown
  params?: Record<string, unknown>
  headers?: HeadersInit
  formData?: boolean
  /** Hint that the request requires an authenticated session */
  authRequired?: boolean
}

/**
 * Platform adapter injected via `<HttpProvider>`.
 * Dashboard uses Axios + Zustand token.
 * Web uses native fetch + BFF proxy + session cookies.
 */
export interface HttpAdapter {
  /** Execute an HTTP request and return parsed JSON */
  request<T>(endpoint: string, options?: HttpRequestOptions): Promise<T>
  /** Called when a request fails with 401 after auth recovery has failed */
  onUnauthorized(): void
  /** Optional: called to show an error toast/notification. */
  onRequestError?: (error: NormalizedHttpError) => void
  /** Optional: called to show a success toast/notification after mutations. */
  onMutationSuccess?: (data: unknown) => void
  /** Optional: called to navigate after a successful mutation with redirectTo. */
  onRedirect?: (path: string) => void
}

// ---------------------------------------------------------------------------
// Normalized error shape shared between both platforms
// ---------------------------------------------------------------------------

export interface NormalizedHttpError {
  name: string
  message: string
  status?: number
  statusText?: string
  body?: unknown
  errors?: unknown
}

// ---------------------------------------------------------------------------
// useFetch options
// ---------------------------------------------------------------------------

export type BaseFetchOptions<
  TResponse = unknown,
  TData = TResponse,
  TError = NormalizedHttpError,
> = Omit<
  UseQueryOptions<TResponse, TError, TData>,
  "queryKey" | "queryFn" | "select"
> & {
  queryKey: QueryKey
  endpoint: string | null | undefined
  enabled?: boolean
  params?: Record<string, any>
  headers?: HeadersInit
  select?: (data: TResponse) => TData
  onError?: (error: TError) => void
  onSuccess?: (data: TResponse) => void
  /** Show an error toast automatically on fetch failure (app-specific behavior) */
  disableErrorToast?: boolean
  /** Mark request as requiring authentication — triggers 401 recovery */
  authRequired?: boolean
  /** Use useSuspenseQuery instead of useQuery. Errors surface via ErrorBoundary. */
  suspense?: boolean
  /** Show an error toast on failure. Has no effect when suspense=true. */
  showToast?: boolean
  /** Extra options forwarded to the HttpAdapter (e.g. general, customBaseUrl) */
  adapterOptions?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// useMutate options
// ---------------------------------------------------------------------------

export type MutationMethod = "POST" | "PUT" | "PATCH" | "DELETE"

export interface MutationMeta {
  disableErrorToast?: boolean
  invalidates?: QueryKey[]
}

export type BaseMutateOptions<
  TResponse = unknown,
  TVariables = unknown,
  TError = NormalizedHttpError,
> = {
  endpoint: string | ((variables: TVariables) => string)
  mutationKey: QueryKey
  method?: MutationMethod
  ready?: boolean
  headers?: HeadersInit
  formData?: boolean
  body?: (variables: TVariables) => unknown | undefined
  params?:
    | Record<string, any>
    | ((variables: TVariables) => Record<string, any>)
  disableErrorToast?: boolean
  authRequired?: boolean
  /** Custom redirect path for 401 responses (web-specific, used to set return-to path) */
  unauthorizedReturnTo?: string
  /** Show error toast on failure via adapter.onRequestError */
  showToast?: boolean
  /** Show success toast via adapter.onMutationSuccess */
  showSuccessToast?: boolean
  /** Extra options forwarded to the HttpAdapter (e.g. general) */
  adapterOptions?: Record<string, unknown>
  /** Keys to invalidate after successful mutation (merged into mutationOptions.meta) */
  invalidates?: QueryKey[]
  /** Redirect path after successful mutation */
  redirectTo?: string
  onError?: (error: TError, normalized: NormalizedHttpError) => void
  onSuccess?: (data: TResponse) => void
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown
  mutationOptions?: Omit<
    UseMutationOptions<TResponse, TError, TVariables, unknown>,
    "mutationFn" | "mutationKey"
  > & {
    meta?: MutationMeta
  }
}
