"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Label } from "@ecommerce/ui/components/label"
import { registerAction } from "@/actions/auth"
import type { RegisterInput } from "@/hooks/api/domain"

function RegisterForm({ loginPath }: { loginPath: string }) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [phoneCode, setPhoneCode] = useState("966")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPhone = /^\d+$/.test(identifier.trim())

  function registrationPayload(): RegisterInput {
    const identity = isPhone
      ? { type: "phone" as const, phone: identifier.trim(), phoneCode }
      : { type: "email" as const, email: identifier.trim() }

    return { ...identity, name: name.trim() }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const result = await registerAction(registrationPayload())
      if (!result.ok) throw new Error(result.message)

      const search = new URLSearchParams({
        identifier: identifier.trim(),
        otpSent: "true",
        ...(isPhone ? { phoneCode } : {}),
      })
      router.push(`${loginPath}?${search}`)
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("requestError")
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={register} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          value={name}
          required
          disabled={pending}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="identifier">{t("emailOrPhone")}</Label>
        <div className={isPhone ? "flex gap-2" : undefined}>
          {isPhone && (
            <Input
              aria-label={t("phoneCode")}
              className="w-24"
              type="number"
              inputMode="numeric"
              value={phoneCode}
              disabled={pending}
              onChange={(event) =>
                setPhoneCode(event.target.value.replace(/\D/g, ""))
              }
            />
          )}
          <Input
            id="identifier"
            type={isPhone ? "number" : "email"}
            value={identifier}
            required
            disabled={pending}
            autoComplete={isPhone ? "tel-national" : "email"}
            inputMode={isPhone ? "numeric" : "email"}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isPhone ? t("detectedPhone") : t("detectedEmail")}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("pleaseWait") : t("registerSubmit")}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push(loginPath)}
      >
        {t("alreadyRegistered")}
      </Button>
    </form>
  )
}

export { RegisterForm }
