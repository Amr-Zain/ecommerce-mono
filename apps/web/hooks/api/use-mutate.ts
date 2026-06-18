"use client"

import {
  useMutation,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { signOut } from "next-auth/react"
import { loginPath } from "@/lib/return-path"
import { withSessionRetry } from "@/lib/client/session-request"

import {
  clientJson,
  toNormalizedHttpError,
  type ClientRequestBody,
  type ClientRequestOptions,
  type NormalizedHttpError,
} from "@/lib/client/http"
import { clientApiEndpoint } from "@/lib/client/client-api"

type MutationMethod =
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "post"
  | "put"
  | "patch"
  | "delete"

type MutationMeta = {
  disableErrorToast?: boolean
  invalidates?: QueryKey[]
}

type UseMutateOptions<
  TResponse = unknown,
  TVariables = ClientRequestBody,
  TError = NormalizedHttpError,
> = {
  endpoint: string | ((variables: TVariables) => string)
  mutationKey: QueryKey
  method?: MutationMethod
  ready?: boolean
  headers?: HeadersInit
  formData?: boolean
  body?: (variables: TVariables) => ClientRequestBody | undefined
  params?:
    | ClientRequestOptions["params"]
    | ((variables: TVariables) => ClientRequestOptions["params"])
  disableErrorToast?: boolean
  authRequired?: boolean
  unauthorizedReturnTo?: string
  onError?: (error: TError, normalized: NormalizedHttpError) => void
  onSuccess?: (data: TResponse) => void
  mutationOptions?: Omit<
    UseMutationOptions<TResponse, TError, TVariables, unknown>,
    "mutationFn" | "mutationKey"
  > & {
    meta?: MutationMeta
  }
}

function stripMeta<TVariables>(variables: TVariables) {
  if (!variables || typeof variables !== "object") {
    return variables as TVariables
  }

  const body = { ...(variables as Record<string, unknown>) }
  delete body._optimistic

  return body as TVariables
}

function useMutate<
  TResponse = unknown,
  TVariables = ClientRequestBody,
  TError = NormalizedHttpError,
>({
  endpoint,
  mutationKey,
  method = "POST",
  ready = true,
  headers,
  formData,
  body,
  params,
  disableErrorToast = false,
  authRequired = false,
  unauthorizedReturnTo,
  onError,
  onSuccess,
  mutationOptions,
}: UseMutateOptions<TResponse, TVariables, TError>) {
  const router = useRouter()

  return useMutation<TResponse, TError, TVariables>({
    ...mutationOptions,
    mutationKey,
    meta: {
      ...mutationOptions?.meta,
      disableErrorToast,
    },
    mutationFn: async (variables) => {
      if (!ready) {
        throw {
          name: "RequestNotReady",
          message: "Request is not ready",
        } as TError
      }
      const finalEndpoint =
        typeof endpoint === "function" ? endpoint(variables) : endpoint
      const finalParams =
        typeof params === "function" ? params(variables) : params
      const requestBody = body ? body(variables) : stripMeta(variables)

      try {
        const data = await withSessionRetry(
          () =>
            clientJson<TResponse>(clientApiEndpoint(finalEndpoint), {
              body: requestBody as ClientRequestBody,
              formData,
              headers,
              method: method.toUpperCase(),
              params: finalParams,
            }),
          authRequired
        )

        onSuccess?.(data)

        return data
      } catch (error) {
        const normalized = toNormalizedHttpError(error)

        onError?.(normalized as TError, normalized)

        if (authRequired && normalized.status === 401) {
          void signOut({ redirect: false })
          const returnTo =
            unauthorizedReturnTo ??
            `${window.location.pathname}${window.location.search}`
          router.replace(loginPath(returnTo, document.documentElement.lang))
        }

        throw normalized as TError
      }
    },
  })
}

export { useMutate }
export type { MutationMeta, UseMutateOptions }
