"use client"

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query"

import {
  clientJson,
  toNormalizedHttpError,
  type ClientRequestOptions,
  type NormalizedHttpError,
} from "@/lib/client/http"
import { toast } from "@ecommerce/ui/components/sonner"

type UseFetchOptions<
  TResponse = unknown,
  TData = TResponse,
  TError = NormalizedHttpError,
> = Omit<
  UseQueryOptions<TResponse, TError, TData>,
  "queryKey" | "queryFn" | "select"
> & {
  queryKey: QueryKey
  endpoint: string | null | undefined
  params?: ClientRequestOptions["params"]
  select?: (data: TResponse) => TData
  onError?: (error: TError) => void
  onSuccess?: (data: TResponse) => void
  customBaseUrl?: string
  disableErrorToast?: boolean
  headers?: HeadersInit
}

function useFetch<
  TResponse = unknown,
  TData = TResponse,
  TError = NormalizedHttpError,
>({
  queryKey,
  endpoint,
  enabled = true,
  params,
  select,
  onError,
  onSuccess,
  customBaseUrl,
  disableErrorToast = false,
  headers,
  ...options
}: UseFetchOptions<TResponse, TData, TError>) {
  return useQuery<TResponse, TError, TData>({
    ...options,
    queryKey,
    enabled: Boolean(endpoint) && enabled,
    select,
    queryFn: async () => {
      try {
        if (!endpoint) {
          throw new Error("Endpoint is required")
        }

        const data = await clientJson<TResponse>(endpoint, {
          customBaseUrl,
          headers,
          method: "GET",
          params,
        })

        onSuccess?.(data)

        return data
      } catch (error) {
        const normalized = toNormalizedHttpError(error)

        onError?.(normalized as TError)

        if (!disableErrorToast) {
          toast.error(normalized.message)
        }

        throw normalized as TError
      }
    },
  })
}

export { useFetch }
export type { UseFetchOptions }
