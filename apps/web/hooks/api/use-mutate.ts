"use client"

import {
  useMutation,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

import { toast } from "@ecommerce/ui/components/sonner"
import {
  clientJson,
  toNormalizedHttpError,
  type ClientRequestBody,
  type ClientRequestOptions,
  type NormalizedHttpError,
} from "@/lib/client/http"

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

type MutationVariables<TVariables> = TVariables & {
  _endpoint?: string
  _params?: ClientRequestOptions["params"]
}

type UseMutateOptions<
  TResponse = unknown,
  TVariables = ClientRequestBody,
  TError = NormalizedHttpError,
> = {
  endpoint: string
  mutationKey: QueryKey
  method?: MutationMethod
  headers?: HeadersInit
  formData?: boolean
  customBaseUrl?: string
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

function stripMeta<TVariables>(variables: MutationVariables<TVariables>) {
  if (!variables || typeof variables !== "object") {
    return variables as TVariables
  }

  const body = { ...(variables as Record<string, unknown>) }
  delete body._endpoint
  delete body._params

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
  headers,
  formData,
  customBaseUrl,
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
      const payload = variables as MutationVariables<TVariables>
      const finalEndpoint =
        payload && typeof payload === "object" && payload._endpoint
          ? payload._endpoint
          : endpoint
      const params =
        payload && typeof payload === "object" ? payload._params : undefined

      try {
        const data = await clientJson<TResponse>(finalEndpoint, {
          body: stripMeta(payload) as ClientRequestBody,
          customBaseUrl,
          formData,
          headers,
          method: method.toUpperCase(),
          params,
        })

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
          router.replace("/auth/login")
        }

        throw normalized as TError
      }
    },
  })
}

export { useMutate }
export type { MutationMeta, UseMutateOptions }
