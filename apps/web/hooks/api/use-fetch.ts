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
import { withSessionRetry } from "@/lib/client/session-request"
import { clientApiEndpoint } from "@/lib/client/client-api"
import { signOut } from "next-auth/react"
import { useRouter } from "@/i18n/navigation"
import { loginPath } from "@/lib/return-path"

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
  disableErrorToast?: boolean
  authRequired?: boolean
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
  disableErrorToast = false,
  authRequired = false,
  headers,
  ...options
}: UseFetchOptions<TResponse, TData, TError>) {
  const router = useRouter()

  return useQuery<TResponse, TError, TData>({
    ...options,
    meta: {
      ...options.meta,
      disableErrorToast,
    },
    queryKey,
    enabled: Boolean(endpoint) && enabled,
    select,
    queryFn: async () => {
      try {
        if (!endpoint) {
          throw new Error("Endpoint is required")
        }

        const data = await withSessionRetry(() =>
          clientJson<TResponse>(clientApiEndpoint(endpoint), {
            headers,
            method: "GET",
            params,
          }),
          authRequired
        )

        onSuccess?.(data)

        return data
      } catch (error) {
        const normalized = toNormalizedHttpError(error)

        onError?.(normalized as TError)

        if (authRequired && normalized.status === 401) {
          void signOut({ redirect: false })
          const returnTo = `${window.location.pathname}${window.location.search}`
          router.replace(loginPath(returnTo, document.documentElement.lang))
        }

        throw normalized as TError
      }
    },
  })
}

export { useFetch }
export type { UseFetchOptions }
