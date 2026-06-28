"use client"

import { useQuery, useSuspenseQuery, type UseQueryOptions, type UseSuspenseQueryOptions } from "@tanstack/react-query"

import type { BaseFetchOptions, NormalizedHttpError } from "./types"
import { normalizeError } from "./errors"
import { useHttpAdapter } from "./http-provider"

/**
 * Shared data-fetching hook powered by TanStack Query.
 *
 * Uses the platform `HttpAdapter` injected via `<HttpProvider>` to execute
 * requests — so it works identically in both dashboard (Axios) and web (BFF fetch).
 *
 * Features:
 * - `suspense: true` → uses `useSuspenseQuery`
 * - `showToast: true` → calls `adapter.onError` toast (if wired)
 * - `adapterOptions` → forwarded to adapter for platform-specific behavior
 *   (e.g. `{ general: true, customBaseUrl: '...' }` for dashboard)
 */
export function useFetch<
  TResponse = unknown,
  TData = TResponse,
  TError = NormalizedHttpError,
>({
  queryKey,
  endpoint,
  enabled = true,
  params,
  headers,
  select,
  onError,
  onSuccess,
  disableErrorToast = false,
  authRequired = false,
  suspense = false,
  showToast = false,
  adapterOptions,
  ...options
}: BaseFetchOptions<TResponse, TData, TError>) {
  const adapter = useHttpAdapter()

  const queryFn = async (): Promise<TResponse> => {
    if (!endpoint) {
      throw new Error("Endpoint is required")
    }

    try {
      const data = await adapter.request<TResponse>(endpoint, {
        method: "GET",
        params,
        headers,
        authRequired,
        ...adapterOptions,
      })

      onSuccess?.(data)
      return data
    } catch (error) {
      const normalized = normalizeError(error)

      if (authRequired && normalized.status === 401) {
        adapter.onUnauthorized()
      }

      onError?.(normalized as TError)

      if (showToast && !suspense && adapter.onRequestError) {
        adapter.onRequestError(normalized)
      }

      throw normalized as TError
    }
  }

  const commonOptions = {
    staleTime: 60_000,
    ...options,
    meta: {
      ...((options as Record<string, unknown>)?.meta as Record<string, unknown> | undefined),
      disableErrorToast,
    },
    queryKey,
    queryFn,
    enabled: Boolean(endpoint) && enabled,
    select,
  } as const

  if (suspense) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSuspenseQuery<TResponse, TError, TData>(
      commonOptions as unknown as UseSuspenseQueryOptions<TResponse, TError, TData>,
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<TResponse, TError, TData>(
    commonOptions as unknown as UseQueryOptions<TResponse, TError, TData>,
  )
}
