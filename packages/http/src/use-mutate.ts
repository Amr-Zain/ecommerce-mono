"use client"

import { useMutation, type QueryKey } from "@tanstack/react-query"

import type { BaseMutateOptions, MutationMeta, NormalizedHttpError } from "./types"
import { normalizeError } from "./errors"
import { useHttpAdapter } from "./http-provider"

/**
 * Strip internal meta keys (e.g. `_optimistic`) from the mutation variables
 * before sending them as the request body.
 */
function stripMeta<TVariables>(variables: TVariables): TVariables {
  if (!variables || typeof variables !== "object") {
    return variables
  }

  const body = { ...(variables as Record<string, unknown>) }
  delete body._optimistic
  return body as TVariables
}

/**
 * Shared mutation hook powered by TanStack Query.
 *
 * Uses the platform `HttpAdapter` injected via `<HttpProvider>` to execute
 * requests — works in both dashboard and web.
 *
 * Features:
 * - `showToast` / `showSuccessToast` → calls adapter.onRequestError / onMutationSuccess
 * - `invalidates` → merged into mutationOptions.meta for QueryCache-level invalidation
 * - `redirectTo` → calls adapter.onRedirect after success
 * - `adapterOptions` → forwarded to adapter.request for platform-specific behavior
 */
export function useMutate<
  TResponse = unknown,
  TVariables = unknown,
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
  showToast = false,
  showSuccessToast,
  adapterOptions,
  invalidates,
  redirectTo,
  onError,
  onSuccess,
  onMutate,
  mutationOptions,
}: BaseMutateOptions<TResponse, TVariables, TError>) {
  const adapter = useHttpAdapter()

  // Merge top-level `invalidates` into mutationOptions.meta
  const mergedMeta: MutationMeta = {
    ...mutationOptions?.meta,
    disableErrorToast,
    ...(invalidates?.length
      ? {
          invalidates: [
            ...((mutationOptions?.meta?.invalidates as QueryKey[]) ?? []),
            ...invalidates,
          ],
        }
      : {}),
  }

  // Extract callbacks from mutationOptions so we can compose them
  const {
    onSuccess: moOnSuccess,
    onError: moOnError,
    onMutate: moOnMutate,
    ...restMutationOptions
  } = mutationOptions ?? {}

  return useMutation<TResponse, TError, TVariables>({
    ...restMutationOptions,
    mutationKey,
    meta: mergedMeta as Record<string, unknown>,
    onMutate: onMutate ?? moOnMutate,
    onSuccess: (...args) => {
      const [data] = args
      // Show success toast via adapter
      const shouldShowSuccess = showSuccessToast ?? showToast
      if (shouldShowSuccess && adapter.onMutationSuccess) {
        adapter.onMutationSuccess(data)
      }

      // Custom callback
      onSuccess?.(data)

      // Redirect
      if (redirectTo && adapter.onRedirect) {
        adapter.onRedirect(redirectTo)
      }

      // Forward to mutationOptions.onSuccess if provided
      moOnSuccess?.(...args)
    },
    onError: (...args) => {
      const [error] = args
      const normalized = normalizeError(error)

      // Show error toast via adapter
      if (showToast && adapter.onRequestError) {
        adapter.onRequestError(normalized)
      }

      // Custom callback
      onError?.(error, normalized)

      // 401 handling
      if (authRequired && normalized.status === 401) {
        adapter.onUnauthorized()
      }

      // Forward to mutationOptions.onError if provided
      moOnError?.(...args)
    },
    mutationFn: async (variables) => {
      if (!ready) {
        throw { name: "RequestNotReady", message: "Request is not ready" } as TError
      }

      const finalEndpoint =
        typeof endpoint === "function" ? endpoint(variables) : endpoint
      const finalParams =
        typeof params === "function" ? params(variables) : params
      const requestBody = body ? body(variables) : stripMeta(variables)

      const data = await adapter.request<TResponse>(finalEndpoint, {
        method: method.toUpperCase() as "POST" | "PUT" | "PATCH" | "DELETE",
        body: requestBody,
        params: finalParams,
        headers,
        formData,
        authRequired,
        ...adapterOptions,
      })

      return data
    },
  })
}
