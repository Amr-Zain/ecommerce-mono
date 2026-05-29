import {
  useQuery,
  useSuspenseQuery,
  UseQueryOptions,
  QueryKey,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import axiosInstance from '@/services/instance'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
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
  ...props
}: UseFetchProps<TResponse, TData, TError>) {
  const { t } = useTranslation()
  const isRTL = i18n.language.startsWith('ar')
  const router = useNavigate()
  const baseURL = customBaseUrl
    ? customBaseUrl
    : general
      ? import.meta.env.VITE_BASE_GENERAL_URL
      : import.meta.env.VITE_BASE_URL

  const paginationParams = {
    // page: params?.page || 1,
  } as AnyObj
  if (params?.page) paginationParams.page = params.page



  const queryFn = async (): Promise<TResponse> => {
    try {
      if (!endpoint) throw new Error('Endpoint is required')

      const res = await axiosInstance.get<TResponse>(`${baseURL}/${endpoint}`, {
        params: { ...params, ...paginationParams },
      })

      if ((res.data as AnyObj)?.error) {
        throw new Error((res.data as AnyObj).message || t('no_data'))
      }

      onSuccess?.(res.data)
      return res.data
    } catch (err: any) {
      originalOnError?.(err)

      if (!suspense) {
        toast.error(err?.response?.data?.message || err.message)
      }

      if (err?.response?.status === 401) {
        useAuthStore.getState().clearUser();
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

