"use client"

import React from "react"
import { HttpProvider } from "@ecommerce/http"
import { createDashboardHttpAdapter } from "@/lib/http-adapter"
import { useAuthStore } from "@/stores/authStore"
import { router } from "@/main"
import { toast } from "sonner"

/**
 * Dashboard-specific HttpProvider.
 * Creates the adapter that uses the dashboard Axios instance,
 * and handles 401, toasts, and redirects.
 *
 * Uses the router instance directly (not useNavigate) so it can
 * be placed outside of RouterProvider in the tree.
 */
export function DashboardHttpProvider({ children }: { children: React.ReactNode }) {
  const adapter = React.useMemo(
    () =>
      createDashboardHttpAdapter({
        onUnauthorized: () => {
          useAuthStore.getState().clearUser()
          router.navigate({ to: "/auth/login" })
        },
        onRequestError: (error) => {
          toast.error(error.message)
        },
        onMutationSuccess: (data) => {
          const msg = (data as Record<string, unknown>)?.message
          if (typeof msg === "string" && msg) {
            toast.success(msg)
          }
        },
        onRedirect: (path) => {
          router.navigate({ to: path } as any)
        },
      }),
    [],
  )

  return <HttpProvider adapter={adapter}>{children}</HttpProvider>
}
