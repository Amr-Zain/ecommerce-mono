import { PermissionAction, useAuthStore } from "@/stores/authStore"
import { redirect } from "@tanstack/react-router"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const hasPermission = (entity: string, action: PermissionAction) => {
  const permissions = useAuthStore.getState().user?.permissions
  if (permissions && permissions[entity])
    return permissions[entity].includes(action)
  return false
}

export const routePermission = (entity: string, action: PermissionAction) => {
  if (!hasPermission(entity, action)) {
    throw redirect({
      to: '/unauthorized',
    })
  }
}