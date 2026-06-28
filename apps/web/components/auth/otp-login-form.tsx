"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { sendOtpAction, verifyOtpAction } from "@/actions/auth"
import type { SendOtpInput, VerifyOtpInput } from "@/hooks/api/domain"
import { useCommerceSessionSync } from "@/hooks/api/use-commerce-session-sync"
import {
  isPhoneIdentifier,
  AppFormComplete,
  type FormField,
} from "@ecommerce/forms"
import { Button } from "@ecommerce/ui/components/button"

type OtpLoginFormValues = {
  identifier: string
  phoneCode: string
  code: string
}

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
  const [otpSent, setOtpSent] = useState(defaultOtpSent)
  const [pending, setPending] = useState(false)
  const form = useForm<OtpLoginFormValues>({
    defaultValues: {
      identifier: defaultIdentifier,
      phoneCode: defaultPhoneCode,
      code: "",
    },
    mode: "onChange",
  })

  function identifierPayload(values: OtpLoginFormValues): SendOtpInput {
    const trimmedIdentifier = values.identifier.trim()
    return isPhoneIdentifier(trimmedIdentifier)
      ? {
          type: "phone",
          phone: trimmedIdentifier,
          phoneCode: values.phoneCode,
        }
      : { type: "email", email: trimmedIdentifier }
  }

  async function submit(values: OtpLoginFormValues) {
    setPending(true)
    try {
      if (!otpSent) {
        const result = await sendOtpAction(identifierPayload(values))
        if (!result.ok) throw new Error(result.message)
        setOtpSent(true)
        return
      }

      const result = await verifyOtpAction({
        ...identifierPayload(values),
        code: values.code,
      } satisfies VerifyOtpInput)
      if (!result.ok) throw new Error(result.message)

      await syncCommerceSession()
      router.replace(redirectTo)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const fields: FormField<OtpLoginFormValues>[] = [
    {
      type: "identifier",
      name: "identifier",
      phoneCodeName: "phoneCode",
      phoneCodeLabel: t("phoneCode"),
      label: t("emailOrPhone"),
      required: true,
      disabled: otpSent || pending,
      detectedPhoneText: t("detectedPhone"),
      detectedEmailText: t("detectedEmail"),
      inputProps: {
        required: true,
      },
    },
    ...(otpSent
      ? [
          {
            type: "otp" as const,
            name: "code" as const,
            label: t("otpCode"),
            required: true,
            length: 4,
            inputProps: {
              required: true,
              disabled: pending,
            },
          },
        ]
      : []),
  ]

  return (
    <AppFormComplete
      form={form}
      fields={fields}
      onSubmit={submit}
      isLoading={pending}
      submitButtonText={otpSent ? t("verifyAndSignIn") : t("sendOtp")}
      loadingButtonText={t("pleaseWait")}
      submitButtonClassName="w-full"
      footer={
        <>
          {otpSent ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                form.setValue("code", "")
                setOtpSent(false)
              }}
            >
              {t("changeIdentifier")}
            </Button>
          ) : (
            <Link
              href={registerPath}
              className="text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("createAccountLink")}
            </Link>
          )}
        </>
      }
    />
  )
}

export { OtpLoginForm }

