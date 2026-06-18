import { PermissionAction, useAuthStore } from "@/stores/authStore"
import { redirect } from "@tanstack/react-router"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const hasPermission = (entity: string, action: PermissionAction) => {
  const permissions = useAuthStore.getState().user?.permissions
  if (permissions && permissions[entity]) {
    const actions = permissions[entity]
    if (actions.includes(action)) return true
    const aliases: Partial<Record<PermissionAction, PermissionAction[]>> = {
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
  return false
}

export const routePermission = (entity: string, action: PermissionAction) => {
  if (!hasPermission(entity, action)) {
    throw redirect({
      to: '/unauthorized',
    })
  }
}
