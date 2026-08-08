import { getTranslations, setRequestLocale } from "next-intl/server"
import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import { RegisterForm } from "@/components/auth/register-form"
import type { Locale } from "@/i18n/routing"
import { ROUTES } from "@/lib/routes"
import { safeReturnPath, stripLocalePrefix } from "@/lib/return-path"
import { localeAlternates, noindexMetadata } from "@/lib/server/seo"

export const metadata: Metadata = {
  ...noindexMetadata,
  ...localeAlternates(ROUTES.auth.register, "en"),
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { locale } = await params
  const query = await searchParams
  setRequestLocale(locale)

  const t = await getTranslations("Auth")
  const loginPath = ROUTES.auth.login
  const redirectTo = safeReturnPath(
    stripLocalePrefix(query.returnTo ?? ROUTES.home, locale),
    ROUTES.home
  )

  return (
    <main className="flex min-h-[70svh] items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm loginPath={loginPath} redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </main>
  )
}
