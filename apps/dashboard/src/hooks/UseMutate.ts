import { useMutate as sharedUseMutate } from '@ecommerce/http'
import type { BaseMutateOptions, NormalizedHttpError } from '@ecommerce/http'
import type { QueryKey } from '@tanstack/react-query'
import { useFormErrorContext } from '@/components/common/form/FormErrorContext'

type MutationMethod = 'post' | 'put' | 'patch' | 'delete' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface UseMutateProps<TResponse = unknown, TVariables = unknown> extends
  Omit<BaseMutateOptions<TResponse, TVariables, NormalizedHttpError>, 'adapterOptions' | 'method'> {
  general?: boolean
  method?: MutationMethod
}

export function useMutate<TResponse = unknown, TVariables = unknown>({
  general = false,
  showToast = true,
  method = 'post',
  onError,
  ...options
}: UseMutateProps<TResponse, TVariables>) {
  const formErrorCtx = useFormErrorContext()

  return sharedUseMutate<TResponse, TVariables, NormalizedHttpError>({
    ...options,
    method: method.toUpperCase() as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    showToast,
    showSuccessToast: showToast,
    adapterOptions: { general },
    onError: (error, normalized) => {
      if (formErrorCtx && normalized.errors && typeof normalized.errors === 'object') {
        formErrorCtx.setFormErrors(normalized.errors as Record<string, string>)
      }
      onError?.(error, normalized)
    },
  })
}
