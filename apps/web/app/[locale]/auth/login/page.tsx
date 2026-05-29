import { AuthError } from "next-auth"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { signIn } from "@/auth"
import { Button } from "@ecommerce/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ecommerce/ui/components/card"
import { Input } from "@ecommerce/ui/components/input"
import { Label } from "@ecommerce/ui/components/label"
import type { Locale } from "@/i18n/routing"

async function signInWithCredentials(formData: FormData) {
  "use server"

  try {
    const redirectTo = formData.get("redirectTo")

    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return
    }

    throw error
  }
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

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
          <form action={signInWithCredentials} className="grid gap-4">
            <input
              type="hidden"
              name="redirectTo"
              value={locale === "ar" ? "/ar" : "/"}
            />
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue="admin@example.com"
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue="password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>{t("adminHint")}</p>
              <p>{t("customerHint")}</p>
              <p>{t("passwordHint")}</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
