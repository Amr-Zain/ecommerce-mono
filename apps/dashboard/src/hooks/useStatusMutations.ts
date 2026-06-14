import { useTranslation } from 'react-i18next'
import { useMutate } from './UseMutate'
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
  const { mutateAsync, isPending } = useMutate({
    mutationKey,
    endpoint: `${endpoint}/${id}`,
    method: type === 'delete' ? 'delete' : 'patch',
    invalidates,
    customBaseUrl: baseURL,
  })

  return { mutateAsync, isPending }
}
