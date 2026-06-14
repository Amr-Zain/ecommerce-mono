import {
  QueryKey,
  UseMutateAsyncFunction,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import axiosInstance from '@/services/instance'
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios'
import {
  type ApiAxiosError,
  type NormalizedHttpError,
  toNormalizedHttpError,
} from '@/types/api/http'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UseMutateProps_TP<Response_T, Request_T = unknown> = {
  endpoint: string
  mutationKey: readonly unknown[] | readonly [string]
  /** Keys to invalidate after a successful mutation. Replaces mutationOptions.meta.invalidates */
  invalidates?: QueryKey[]
  /** Redirect to this path after a successful mutation (runs after toast if enabled) */
  redirectTo?: string
  /** Show success / error toasts automatically. Defaults to true */
  showToast?: boolean
  onSuccess?: (data: Response_T) => void
  onError?: (
    err: ApiAxiosError | AxiosError<Response_T>,
    normalized: NormalizedHttpError,
  ) => void
  formData?: boolean
  onMutate?: (variables: Request_T) => Promise<unknown> | unknown
  method?: Lowercase<Method> | Method
  headers?: Record<string, string>
  general?: boolean
  mutationOptions?: Omit<
    UseMutationOptions<
      AxiosResponse<Response_T>,
      AxiosError<Response_T>,
      Request_T
    >,
    'mutationKey' | 'mutationFn'
  >
  customBaseUrl?: string
}

export function useMutate<Response_T = unknown, Request_T = unknown>({
  endpoint,
  mutationKey,
  invalidates,
  redirectTo,
  showToast = true,
  onSuccess,
  onError: originalOnError,
  formData,
  onMutate,
  method = 'post',
  headers = {},
  general = false,
  mutationOptions,
  customBaseUrl,
}: UseMutateProps_TP<Response_T, Request_T>): {
  data: AxiosResponse<Response_T> | undefined
  isPending: boolean
  isSuccess: boolean
  mutate: (variables: Request_T) => void
  mutateAsync: UseMutateAsyncFunction<
    AxiosResponse<Response_T>,
    AxiosError<Response_T>,
    Request_T,
    unknown
  >
  failureReason: unknown
  isError: boolean
} {
  const baseURL = customBaseUrl
    ? customBaseUrl
    : general
      ? import.meta.env.VITE_BASE_GENERAL_URL
      : import.meta.env.VITE_BASE_URL

  const navigate = useNavigate()

  // Merge top-level `invalidates` into mutationOptions.meta so the
  // MutationCache in tabstackQueryProvider handles the invalidation centrally.
  const mergedMeta = {
    ...mutationOptions?.meta,
    ...(invalidates?.length
      ? { invalidates: [...(((mutationOptions?.meta as any)?.invalidates as QueryKey[]) ?? []), ...invalidates] }
      : {}),
  }

  const mutation = useMutation<
    AxiosResponse<Response_T>,
    AxiosError<Response_T>,
    Request_T
  >({
    ...mutationOptions,
    meta: mergedMeta,
    mutationKey,
    mutationFn: (values: Request_T) => {
      const requestConfig: AxiosRequestConfig<Request_T> = {
        method: (method as Method).toUpperCase() as Method,
        url: `${baseURL}/${endpoint}`,
        data: values,
        headers: formData
          ? {
              ...headers,
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            }
          : {
              ...headers,
              'Content-Type': 'application/json; charset=utf-8',
              Accept: 'application/json',
            },
      }
      return axiosInstance.request<Response_T>(requestConfig)
    },
    onSuccess: (res) => {
      // 1. Auto-toast success
      if (showToast) {
        const msg = (res.data as any)?.message
        if (msg) toast.success(msg)
      }

      // 2. Custom side-effect callback
      onSuccess?.(res.data)

      // 3. Redirect
      if (redirectTo) {
        navigate({ to: redirectTo } as any)
      }

      mutationOptions?.onSuccess?.(
        res,
        undefined as any,
        undefined as any,
        undefined as any,
      )
    },
    onError: (err) => {
      const normalized = toNormalizedHttpError(err)

      // 1. Auto-toast error
      if (showToast) {
        toast.error(normalized.message)
      }

      // 2. Custom error handler
      originalOnError?.(err as unknown as ApiAxiosError, normalized)

      mutationOptions?.onError?.(
        err,
        undefined as any,
        undefined as any,
        undefined as any,
      )

      // 3. 401 — clear session and redirect to login
      if (normalized?.status === 401) {
        useAuthStore.getState().clearUser()
        navigate({ to: '/auth/login' })
      }
    },
    onMutate,
  })

  return mutation
}
