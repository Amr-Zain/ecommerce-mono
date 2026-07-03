'use client'

import React from 'react'
import { HttpProvider } from '@ecommerce/http'
import { toast } from 'sonner'
import { createDashboardHttpAdapter } from '@/lib/http-adapter'
import { useAuthStore } from '@/stores/authStore'
import { router } from '@/main'

/**
 * Dashboard-specific HttpProvider.
 * Creates the adapter that uses the dashboard Axios instance,
 * and handles 401, toasts, and redirects.
 *
 * Uses the router instance directly (not useNavigate) so it can
 * be placed outside of RouterProvider in the tree.
 */
export function DashboardHttpProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const adapter = React.useMemo(
    () =>
      createDashboardHttpAdapter({
        onUnauthorized: () => {
          useAuthStore.getState().clearUser()
          router.navigate({ to: '/auth/login' })
        },
        onRequestError: (error) => {
          toast.error(getErrorToastMessage(error))
        },
        onMutationSuccess: (data) => {
          const msg = (data as Record<string, unknown>).message
          if (typeof msg === 'string' && msg) {
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

function getErrorToastMessage(error: { message?: string; body?: unknown }) {
  const body = error.body
  if (body && typeof body === 'object') {
    const payload = body as Record<string, unknown>
    if (typeof payload.details === 'string') return payload.details
    if (Array.isArray(payload.details)) return payload.details.join('; ')
    if (typeof payload.message === 'string') return payload.message
    if (Array.isArray(payload.message)) return payload.message.join('; ')
    if (typeof payload.error === 'string') return payload.error
  }
  return error.message || 'Something went wrong'
}
