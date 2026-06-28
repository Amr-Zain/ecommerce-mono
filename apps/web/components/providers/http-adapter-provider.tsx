"use client"

import * as React from "react"
import { HttpProvider } from "@ecommerce/http"
import { signOut } from "next-auth/react"
import { useRouter } from "@/i18n/navigation"
import { loginPath } from "@/lib/return-path"
import { createWebHttpAdapter } from "@/lib/client/http-adapter"

/**
 * Web-specific HttpProvider.
 * Creates the adapter that uses the BFF proxy pattern,
 * and handles 401 by signing out and redirecting to login.
 */
export function WebHttpProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const adapter = React.useMemo(
    () =>
      createWebHttpAdapter({
        onUnauthorized: () => {
          void signOut({ redirect: false })
          const returnTo = `${window.location.pathname}${window.location.search}`
          router.replace(loginPath(returnTo, document.documentElement.lang))
        },
      }),
    [router],
  )

  return <HttpProvider adapter={adapter}>{children}</HttpProvider>
}
