"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { registerAction } from "@/actions/auth"
import {
  isPhoneIdentifier,
  AppFormComplete,
  type FormField,
} from "@ecommerce/forms"
import type { RegisterInput } from "@/hooks/api/domain"
import { Button } from "@ecommerce/ui/components/button"

type RegisterFormValues = {
  name: string
  identifier: string
  phoneCode: string
}

function RegisterForm({ loginPath }: { loginPath: string }) {
  const t = useTranslations("Auth")
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      identifier: "",
      phoneCode: "966",
    },
    mode: "onChange",
  })
  const identifier = form.watch("identifier")
  const isPhone = isPhoneIdentifier(identifier)

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

  async function register(values: RegisterFormValues) {
    setPending(true)

    try {
      const result = await registerAction(registrationPayload(values))
      if (!result.ok) throw new Error(result.message)

      const trimmedIdentifier = values.identifier.trim()
      const search = new URLSearchParams({
        identifier: trimmedIdentifier,
        otpSent: "true",
        ...(isPhoneIdentifier(trimmedIdentifier)
          ? { phoneCode: values.phoneCode }
          : {}),
      })
      router.push(`${loginPath}?${search}`)
    } finally {
      setPending(false)
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
  )
}

export { RegisterForm }

