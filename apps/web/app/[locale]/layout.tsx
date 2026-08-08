import { Geist, JetBrains_Mono, Noto_Kufi_Arabic } from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import "../globals.css"
import { SessionProvider } from "@/components/auth/session-provider"
import { Footer } from "@/components/layout/footer"
import { StorefrontHeader } from "@/components/layout/storefront-header"
import { TanstackQueryProvider } from "@/components/providers/tanstack-query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@ecommerce/ui/components/direction"
import { Toaster } from "@ecommerce/ui/components/sonner"
import { TooltipProvider } from "@ecommerce/ui/components/tooltip"
import { routing, type Locale } from "@/i18n/routing"
import { siteUrl } from "@/lib/server/seo"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

function getTextDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr"
}

async function LocaleIntlProvider({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) {
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("Seo")
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("defaultDescription"),
    applicationName: t("siteName"),
    keywords: t("keywords").split(",").map((s) => s.trim()),
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
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

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-sans",
        jetbrainsMono.variable,
        notoKufiArabic.variable,
        direction === "rtl" && "font-arabic"
      )}
    >
      <body>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <LocaleIntlProvider locale={locale}>
          <SessionProvider>
            <TanstackQueryProvider>
                <DirectionProvider direction={direction}>
                  <ThemeProvider>
                    <TooltipProvider>
                      <div className="min-h-screen bg-background text-foreground">
                        <Suspense fallback={<div className="h-32 border-b bg-background" />}>
                          <StorefrontHeader />
                        </Suspense>
                        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                          <Suspense fallback={<div className="min-h-[60vh]" />}>
                            {children}
                          </Suspense>
                          <Suspense fallback={<div className="h-48" />}>
                            <Footer />
                          </Suspense>
                        </main>
                      </div>
                    </TooltipProvider>
                    <Toaster position="top-center" />
                  </ThemeProvider>
                </DirectionProvider>
            </TanstackQueryProvider>
          </SessionProvider>
          </LocaleIntlProvider>
        </Suspense>
      </body>
    </html>
  )
}
