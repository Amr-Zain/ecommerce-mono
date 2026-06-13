"use client"

import {
  useMutation,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { useRouter } from "@/i18n/navigation"
import { ROUTES } from "@/lib/routes"
import { signOut } from "next-auth/react"

import { toast } from "@ecommerce/ui/components/sonner"
import {
  clientJson,
  toNormalizedHttpError,
  type ClientRequestBody,
  type ClientRequestOptions,
  type NormalizedHttpError,
} from "@/lib/client/http"
import { withSessionRetry } from "@/lib/client/session-request"
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
  onError,
  onSuccess,
  mutationOptions,
}: UseMutateOptions<TResponse, TVariables, TError>) {
  const router = useRouter()

  return useMutation<TResponse, TError, TVariables>({
    ...mutationOptions,
    mutationKey,
    meta: mutationOptions?.meta,
    mutationFn: async (variables) => {
      if (!ready) {
        throw {
          name: "GuestSessionNotReady",
          message: "Session is still loading",
        } as TError
      }
      const finalEndpoint =
        typeof endpoint === "function" ? endpoint(variables) : endpoint
      const finalParams =
        typeof params === "function" ? params(variables) : params
      const requestBody = body ? body(variables) : stripMeta(variables)

      try {
        const data = await withSessionRetry(() =>
          clientJson<TResponse>(clientApiEndpoint(finalEndpoint), {
            body: requestBody as ClientRequestBody,
            formData,
            headers,
            method: method.toUpperCase(),
            params: finalParams,
          })
        )

        onSuccess?.(data)

        return data
      } catch (error) {
        const normalized = toNormalizedHttpError(error)

        onError?.(normalized as TError, normalized)

        if (!disableErrorToast) {
          toast.error(normalized.message)
        }

        if (normalized.status === 401) {
          void signOut({ redirect: false })
          router.replace(ROUTES.auth.login)
        }

        throw normalized as TError
      }
    },
  })
}

export { useMutate }
export type { MutationMeta, UseMutateOptions }
