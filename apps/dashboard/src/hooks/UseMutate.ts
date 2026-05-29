// hooks/useMutate.ts
import {
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
import { Router } from 'lucide-react'

type UseMutateProps_TP<Response_T, Request_T = unknown> = {
  endpoint: string
  mutationKey: readonly unknown[] | readonly [string]
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
  const mutation = useMutation<
    AxiosResponse<Response_T>,
    AxiosError<Response_T>,
    Request_T
  >({
    ...mutationOptions,
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
      onSuccess?.(res.data)
      mutationOptions?.onSuccess?.(
        res,
        undefined as any,
        undefined as any,
        undefined as any,
      )
    },
    onError: (err) => {
      const normalized = toNormalizedHttpError(err)
      originalOnError?.(err as unknown as ApiAxiosError, normalized)
      mutationOptions?.onError?.(
        err,
        undefined as any,
        undefined as any,
        undefined as any,
      )
      if (normalized?.status === 401) {
        useAuthStore.getState().clearUser()
        Router({ to: '/auth/login' })
      }
    },
    onMutate,
  })

  return mutation
}
