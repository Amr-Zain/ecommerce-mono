"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { registerAction, verifyOtpAction } from "@/actions/auth"
import type { RegisterInput, VerifyOtpInput } from "@/hooks/api/domain"
import { useCommerceSessionSync } from "@/hooks/api/use-commerce-session-sync"
import {
  isPhoneIdentifier,
  AppFormComplete,
  OTPField,
  type FormField,
} from "@ecommerce/forms"
import { Button } from "@ecommerce/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ecommerce/ui/components/dialog"

type RegisterFormValues = {
  name: string
  identifier: string
  phoneCode: string
}

function RegisterForm({
  loginPath,
  redirectTo,
}: {
  loginPath: string
  redirectTo: string
}) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const syncCommerceSession = useCommerceSessionSync()
  const [otpOpen, setOtpOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      identifier: "",
      phoneCode: "966",
    },
    mode: "onChange",
  })

  function registrationPayload(values: RegisterFormValues): RegisterInput {
    const trimmedIdentifier = values.identifier.trim()
    const identity = isPhoneIdentifier(trimmedIdentifier)
      ? {
          type: "phone" as const,
          phone: trimmedIdentifier,
          phoneCode: values.phoneCode,
        }
      : { type: "email" as const, email: trimmedIdentifier }

    return { ...identity, name: values.name.trim() }
  }

  function otpPayload(): VerifyOtpInput {
    const values = form.getValues()
    const trimmedIdentifier = values.identifier.trim()
    return isPhoneIdentifier(trimmedIdentifier)
      ? {
          type: "phone",
          phone: trimmedIdentifier,
          phoneCode: values.phoneCode,
          code: otpCode,
        }
      : { type: "email", email: trimmedIdentifier, code: otpCode }
  }

  async function register(values: RegisterFormValues) {
    setPending(true)
    setError(null)
    try {
      const result = await registerAction(registrationPayload(values))
      if (!result.ok) throw new Error(result.message)

      setOtpCode("")
      setOtpOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestError"))
    } finally {
      setPending(false)
    }
  }

  async function verifyOtp() {
    if (!otpCode) return
    setVerifying(true)
    setError(null)
    try {
      const result = await verifyOtpAction(otpPayload())
      if (!result.ok) throw new Error(result.message)

      await syncCommerceSession()
      router.replace(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestError"))
    } finally {
      setVerifying(false)
    }
  }

  const fields: FormField<RegisterFormValues>[] = [
    {
      type: "text",
      name: "name",
      label: t("name"),
      required: true,
      inputProps: {
        required: true,
        disabled: pending,
        autoComplete: "name",
      },
    },
    {
      type: "identifier",
      name: "identifier",
      phoneCodeName: "phoneCode",
      phoneCodeLabel: t("phoneCode"),
      countrySearchPlaceholder: t("searchCountry"),
      noCountryText: t("noCountryFound"),
      phoneMustStartWithText: t("phoneMustStartWith"),
      label: t("emailOrPhone"),
      required: true,
      disabled: pending,
      detectedPhoneText: t("detectedPhone"),
      detectedEmailText: t("detectedEmail"),
      inputProps: {
        required: true,
      },
    },
  ]

  return (
    <>
      {error && !otpOpen && <p className="text-sm text-destructive">{error}</p>}
      <AppFormComplete
        form={form}
        fields={fields}
        onSubmit={register}
        isLoading={pending}
        submitButtonText={t("registerSubmit")}
        loadingButtonText={t("pleaseWait")}
        submitButtonClassName="w-full"
        footer={
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(loginPath)}
          >
            {t("alreadyRegistered")}
          </Button>
        }
      />

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("otpCode")}</DialogTitle>
            <DialogDescription>{t("registerDescription")}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-2">
            <OTPField
              value={otpCode}
              onChange={(value) => setOtpCode(value)}
              length={4}
              disabled={verifying}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={verifying}
              onClick={() => {
                setOtpOpen(false)
                setError(null)
                setOtpCode("")
              }}
            >
              {t("changeIdentifier")}
            </Button>
            <Button
              type="button"
              onClick={verifyOtp}
              disabled={verifying || otpCode.length < 4}
            >
              {verifying ? t("pleaseWait") : t("verifyAndSignIn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { RegisterForm }
