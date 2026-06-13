"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import * as React from "react"

import { queryKeys } from "@/hooks/api/query-keys"

function useCommerceSessionSync() {
  const queryClient = useQueryClient()
  const { update: updateSession } = useSession()

  return React.useCallback(async () => {
    await updateSession()
    await Promise.all([
      queryClient.resetQueries({
        exact: true,
        queryKey: queryKeys.cart(),
      }),
      queryClient.resetQueries({
        exact: true,
        queryKey: queryKeys.notifications(),
      }),
      queryClient.resetQueries({
        exact: true,
        queryKey: queryKeys.notificationUnreadCount(),
      }),
      queryClient.resetQueries({
        exact: true,
        queryKey: queryKeys.wishlist(),
      }),
    ])
  }, [queryClient, updateSession])
}

export { useCommerceSessionSync }
