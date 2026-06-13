"use client"

import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"

import { queryKeys } from "@/hooks/api/query-keys"
import type { LoginInput } from "@/hooks/api/domain"

function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    meta: {
      invalidates: [
        queryKeys.cart(),
        queryKeys.currentUser(),
        queryKeys.notifications(),
        queryKeys.notificationUnreadCount(),
        queryKeys.wishlist(),
      ],
    },
    mutationFn: (variables: LoginInput) =>
      signIn("credentials", {
        ...variables,
        redirect: false,
      }),
  })
}

export { useLoginMutation }
