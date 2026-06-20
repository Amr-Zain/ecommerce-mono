import {
  useQuery,
  useSuspenseQuery,
  UseQueryOptions,
  QueryKey,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query'
import axiosInstance from '@/services/instance'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ADMIN_API_BASE_URL, API_BASE_URL } from '@/lib/env'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/authStore'

type AnyObj = Record<string, any>

interface UseFetchProps<
  TResponse = unknown,
  TData = TResponse,
  TError = unknown,
> extends Omit<
  UseQueryOptions<TResponse, TError, TData>,
  'queryKey' | 'queryFn' | 'select'
> {
  queryKey: QueryKey
  endpoint: string | null | undefined
  enabled?: boolean
  select?: (data: TResponse) => TData
  onError?: (err: TError) => void
  onSuccess?: (data: TResponse) => void
  general?: boolean
  params?: AnyObj
  suspense?: boolean
  customBaseUrl?: string
  /** Show an error toast automatically on fetch failure. Defaults to true. Has no effect when suspense=true (errors surface via ErrorBoundary). */
  showToast?: boolean
}

function useFetch<TResponse = unknown, TData = TResponse, TError = unknown>({
  queryKey,
  endpoint,
  enabled = true,
  select,
  onError: originalOnError,
  onSuccess,
  general = false,
  params,
  suspense = false,
  customBaseUrl,
  showToast = false,
  ...props
}: UseFetchProps<TResponse, TData, TError>) {
  const isRTL = i18n.language.startsWith('ar')
  const router = useNavigate()
  const baseURL = customBaseUrl
    ? customBaseUrl
    : general
      ? API_BASE_URL
      : ADMIN_API_BASE_URL

  const paginationParams = {} as AnyObj
  if (params?.page) paginationParams.page = params.page

  const queryFn = async (): Promise<TResponse> => {
    try {
      if (!endpoint) throw new Error('Endpoint is required')

      const res = await axiosInstance.get<TResponse>(`${baseURL}/${endpoint}`, {
        params: { ...params, ...paginationParams },
      })

      if ((res.data as AnyObj)?.error) {
        throw new Error((res.data as AnyObj).message || 'No data')
      }

      onSuccess?.(res.data)
      return res.data
    } catch (err: any) {
      // Call custom error handler first (without toasting — let it decide)
      originalOnError?.(err)

      // Auto-toast only if enabled and NOT in suspense mode
      // (suspense errors are caught by ErrorBoundary, not here)
      if (showToast && !suspense) {
        toast.error(err?.response?.data?.message || err.message)
      }

      if (err?.response?.status === 401) {
        useAuthStore.getState().clearUser()
        router({ to: '/auth/login' })
      }
      throw err
    }
  }

  const commonOptions = {
    staleTime: 60_000,
    ...props,
    queryKey: [...queryKey, isRTL],
    queryFn,
    enabled: !!endpoint && enabled,
    select,
  } as const

  if (suspense) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSuspenseQuery<TResponse, TError, TData>(
      commonOptions as UseSuspenseQueryOptions<TResponse, TError, TData>,
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<TResponse, TError, TData>(
    commonOptions as UseQueryOptions<TResponse, TError, TData>,
  )
}

export default useFetch
