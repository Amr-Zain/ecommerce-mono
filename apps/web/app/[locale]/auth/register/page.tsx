import { getTranslations, setRequestLocale } from "next-intl/server"

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

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("Auth")
  const loginPath = locale === "ar" ? `/ar${ROUTES.auth.login}` : ROUTES.auth.login

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm loginPath={loginPath} />
        </CardContent>
      </Card>
    </main>
  )
}
