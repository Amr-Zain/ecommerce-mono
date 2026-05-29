import { ApiResponse } from '@/types/api/http'
import { useTranslation } from 'react-i18next'
import { useMutate } from './UseMutate'
import { toast } from 'sonner'
import { QueryKey } from '@tanstack/react-query'
export type PickedAction =
  | 'active'
  | 'delete'
  | 'verify'
  | 'ban'
  | 'suspend'
  | 'allow_notifications'
  | 'read_note'

export const useStatusMutation = (
  id: string,
  type: PickedAction,
  endpoint: string,
  mutationKey: QueryKey,
  invalidates: QueryKey[],
  baseURL?: string,
) => {
  const { t } = useTranslation()
  const toggleMutation = {
    mutationKey,
    endpoint: `${endpoint}/${id}`,
    method: type === 'delete' ? 'delete' : 'patch',
    successMessage: type==='delete'? t('deleted_successfully'):t('status_changed_successfully'),
  } as const
 
  const { mutateAsync, isPending } = useMutate<ApiResponse>({
    mutationKey: toggleMutation.mutationKey,
    endpoint: toggleMutation.endpoint,
    method: toggleMutation.method,
    mutationOptions: {
      meta: { invalidates: invalidates },
    },
    onSuccess: (data) => {
      toast.success(data.message || toggleMutation.successMessage)
    },
    onError: (_err, normalized) => {
      toast.error(normalized.message)
    },
    customBaseUrl: baseURL,
  })

  return { mutateAsync, isPending }
}
