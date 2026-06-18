"use client"

import { useEffect } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { GlobalFallback } from "@/components/shared/global-fallback"
import "./globals.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <GlobalFallback kind="error" onRetry={unstable_retry} />
        </ThemeProvider>
      </body>
    </html>
  )
}
