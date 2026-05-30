import { Geist, JetBrains_Mono } from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import "../globals.css"
import { SessionProvider } from "@/components/auth/session-provider"
import { Footer } from "@/components/home/footer"
import { StorefrontHeader } from "@/components/home/storefront-header"
import { TanstackQueryProvider } from "@/components/providers/tanstack-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@ecommerce/ui/components/direction"
import { Toaster } from "@ecommerce/ui/components/sonner"
import { TooltipProvider } from "@ecommerce/ui/components/tooltip"
import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

function getTextDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr"
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const direction = getTextDirection(locale)
  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <TanstackQueryProvider>
              <DirectionProvider direction={direction}>
                <ThemeProvider>
                  <TooltipProvider>
                    <div className="min-h-screen bg-background text-foreground">
                      <StorefrontHeader />
                      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                        {children}
                        <Footer />
                      </main>
                    </div>
                  </TooltipProvider>
                  <Toaster position="top-center" />
                </ThemeProvider>
              </DirectionProvider>
            </TanstackQueryProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
