"use client"

import { useState, type FormEvent } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Label } from "@ecommerce/ui/components/label"
import { sendOtpAction, verifyOtpAction } from "@/actions/auth"
import type { SendOtpInput, VerifyOtpInput } from "@/hooks/api/domain"
import { useCommerceSessionSync } from "@/hooks/api/use-commerce-session-sync"

function OtpLoginForm({
  defaultIdentifier = "",
  defaultOtpSent = false,
  defaultPhoneCode = "966",
  registerPath,
  redirectTo,
}: {
  defaultIdentifier?: string
  defaultOtpSent?: boolean
  defaultPhoneCode?: string
  registerPath: string
  redirectTo: string
}) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const syncCommerceSession = useCommerceSessionSync()
  const [identifier, setIdentifier] = useState(defaultIdentifier)
  const [phoneCode, setPhoneCode] = useState(defaultPhoneCode)
  const [code, setCode] = useState("")
  const [otpSent, setOtpSent] = useState(defaultOtpSent)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPhone = /^\d+$/.test(identifier.trim())

  function identifierPayload(): SendOtpInput {
    return isPhone
      ? { type: "phone", phone: identifier.trim(), phoneCode }
      : { type: "email", email: identifier.trim() }
  }

  async function sendOtp() {
    setPending(true)
    setError(null)
    try {
      const result = await sendOtpAction(identifierPayload())
      if (!result.ok) throw new Error(result.message)
      setOtpSent(true)
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("requestError")
      )
    } finally {
      setPending(false)
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!otpSent) {
      await sendOtp()
      return
    }

    setPending(true)
    setError(null)
    try {
      const result = await verifyOtpAction({
        ...identifierPayload(),
        code,
      } satisfies VerifyOtpInput)
      if (!result.ok) throw new Error(result.message)

      await syncCommerceSession()
      router.replace(redirectTo)
      router.refresh()
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("requestError")
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={login} className="grid gap-4">
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
              disabled={otpSent || pending}
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
            disabled={otpSent || pending}
            autoComplete={isPhone ? "tel-national" : "email"}
            inputMode={isPhone ? "numeric" : "email"}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isPhone ? t("detectedPhone") : t("detectedEmail")}
        </p>
      </div>

      {otpSent && (
        <div className="grid gap-2">
          <Label htmlFor="code">{t("otpCode")}</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={4}
            value={code}
            required
            autoComplete="one-time-code"
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? t("pleaseWait")
          : otpSent
            ? t("verifyAndSignIn")
            : t("sendOtp")}
      </Button>

      {otpSent && (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => setOtpSent(false)}
        >
          {t("changeIdentifier")}
        </Button>
      )}

      {!otpSent && (
        <Link
          href={registerPath}
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {t("createAccountLink")}
        </Link>
      )}
    </form>
  )
}

export { OtpLoginForm }
