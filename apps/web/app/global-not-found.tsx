import { ThemeProvider } from "@/components/theme-provider"
import { GlobalFallback } from "@/components/shared/global-fallback"
import "./globals.css"

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <GlobalFallback kind="not-found" />
        </ThemeProvider>
      </body>
    </html>
  )
}
