/**
 * Dashboard useFetch — thin wrapper around the shared hook that maps
 * dashboard-specific option (general) into adapterOptions.
 */
import { useFetch as sharedUseFetch } from '@ecommerce/http'
import type { BaseFetchOptions, NormalizedHttpError } from '@ecommerce/http'
import type { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query'

interface UseFetchProps<
  TResponse = unknown,
  TData = TResponse,
  TError = NormalizedHttpError,
> extends Omit<BaseFetchOptions<TResponse, TData, TError>, 'adapterOptions'> {
  /** Use the public API base URL instead of admin */
  general?: boolean
}

function useFetch<TResponse = unknown, TData = TResponse, TError = NormalizedHttpError>({
  general = false,
  ...options
}: UseFetchProps<TResponse, TData, TError>): UseQueryResult<TData, TError> & UseSuspenseQueryResult<TData, TError> {
  return sharedUseFetch<TResponse, TData, TError>({
    ...options,
    adapterOptions: { general },
  }) as unknown as UseQueryResult<TData, TError> & UseSuspenseQueryResult<TData, TError>
}

export default useFetch
export type { UseFetchProps }
