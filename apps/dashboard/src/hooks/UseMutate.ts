/**
 * Dashboard useMutate — thin wrapper around the shared hook.
 *
 * Adds dashboard-specific defaults:
 * - showToast defaults to true (success + error toasts)
 * - general flag maps to adapterOptions
 * - Preserves the same public API for existing consumers
 */
import { useMutate as sharedUseMutate } from '@ecommerce/http'
import type { BaseMutateOptions, NormalizedHttpError } from '@ecommerce/http'
import type { QueryKey } from '@tanstack/react-query'

type MutationMethod = 'post' | 'put' | 'patch' | 'delete' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface UseMutateProps<TResponse = unknown, TVariables = unknown> extends
  Omit<BaseMutateOptions<TResponse, TVariables, NormalizedHttpError>, 'adapterOptions' | 'method'> {
  /** Use the public API base URL instead of admin */
  general?: boolean
  /** HTTP method. Defaults to 'post' */
  method?: MutationMethod
}

export function useMutate<TResponse = unknown, TVariables = unknown>({
  general = false,
  showToast = true,
  method = 'post',
  ...options
}: UseMutateProps<TResponse, TVariables>) {
  return sharedUseMutate<TResponse, TVariables, NormalizedHttpError>({
    ...options,
    method: method.toUpperCase() as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    showToast,
    showSuccessToast: showToast,
    adapterOptions: { general },
  })
}
