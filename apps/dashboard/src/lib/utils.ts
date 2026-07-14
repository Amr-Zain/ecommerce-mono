import { redirect } from '@tanstack/react-router'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import type { DashboardUser, PermissionAction } from '@/types/auth'
import { queryClient } from '@/components/providers/tabstackQueryProvider'
import { queryKeys } from '@/util/queryKeysFactory'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const userHasPermission = (
  user: DashboardUser | null | undefined,
  entity: string,
  action: PermissionAction,
) => {
  const actions = user?.permissions[entity]
  if (!actions) return false
  if (actions.includes(action)) return true

  const aliases: Partial<Record<PermissionAction, Array<PermissionAction>>> = {
    index: ['list'],
    list: ['index'],
    show: ['read'],
    read: ['show'],
    store: ['create'],
    create: ['store'],
    destroy: ['delete'],
    delete: ['destroy'],
  }
  return aliases[action]?.some((alias) => actions.includes(alias)) ?? false
}

export const hasPermission = (entity: string, action: PermissionAction) =>
  userHasPermission(
    queryClient.getQueryData<DashboardUser>(queryKeys.auth.profile()),
    entity,
    action,
  )

export const routePermission = (entity: string, action: PermissionAction) => {
  if (!hasPermission(entity, action)) {
    throw redirect({ to: '/unauthorized' })
  }
}
