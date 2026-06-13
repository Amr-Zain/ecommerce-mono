import { getTranslations, setRequestLocale } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import type { Locale } from "@/i18n/routing"
import { ROUTES } from "@/lib/routes"
import { OtpLoginForm } from "@/components/auth/otp-login-form"
import { safeReturnPath } from "@/lib/return-path"

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    identifier?: string
    otpSent?: string
    phoneCode?: string
    returnTo?: string
  }>
}) {
  const { locale } = await params
  const query = await searchParams

  setRequestLocale(locale)

  const t = await getTranslations("Auth")

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <OtpLoginForm
            defaultIdentifier={query.identifier}
            defaultOtpSent={query.otpSent === "true"}
            defaultPhoneCode={query.phoneCode}
            registerPath={
              locale === "ar" ? `/ar${ROUTES.auth.register}` : ROUTES.auth.register
            }
            redirectTo={safeReturnPath(
              query.returnTo,
              locale === "ar" ? "/ar" : ROUTES.home
            )}
          />
        </CardContent>
      </Card>
    </main>
  )
}
