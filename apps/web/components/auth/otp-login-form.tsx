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
import { OtpDialog } from "./otp-dialog"

type OtpLoginFormValues = {
  identifier: string
  phoneCode: string
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
  const [otpOpen, setOtpOpen] = useState(defaultOtpSent)
  const [pending, setPending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<OtpLoginFormValues>({
    defaultValues: {
      identifier: defaultIdentifier,
      phoneCode: defaultPhoneCode,
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
    setError(null)
    try {
      const result = await sendOtpAction(identifierPayload(values))
      if (!result.ok) throw new Error(result.message)
      setOtpOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestError"))
    } finally {
      setPending(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const result = await sendOtpAction(identifierPayload(form.getValues()))
      if (!result.ok) throw new Error(result.message)
    } finally {
      setResending(false)
    }
  }

  async function handleVerify(code: string) {
    setVerifying(true)
    try {
      const result = await verifyOtpAction({
        ...identifierPayload(form.getValues()),
        code,
      } satisfies VerifyOtpInput)
      if (!result.ok) throw new Error(result.message)

      await syncCommerceSession()
      router.replace(redirectTo)
      router.refresh()
    } finally {
      setVerifying(false)
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
      {error && !otpOpen && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <AppFormComplete
        form={form}
        fields={fields}
        onSubmit={submit}
        isLoading={pending}
        submitButtonText={t("sendOtp")}
        loadingButtonText={t("pleaseWait")}
        submitButtonClassName="w-full"
        footer={
          <Link
            href={registerPath}
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {t("createAccountLink")}
          </Link>
        }
      />

      <OtpDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        description={t("loginDescription")}
        onResend={handleResend}
        onVerify={handleVerify}
        resending={resending}
        verifying={verifying}
      />
    </>
  )
}

export { OtpLoginForm }