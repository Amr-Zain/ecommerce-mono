"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "@ecommerce/ui/components/sonner"
import { FormLabel } from "@ecommerce/ui/components/form"

import { AppFormComplete, PhoneField, type FormField } from "@ecommerce/forms"
import {
  useCurrentUser,
  useUpdateCurrentUser,
} from "@/hooks/api/use-current-user"
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton"

type ProfileFormValues = {
  name: string
  email: string
  phoneCode: string
  phone: string
}

const defaultValues: ProfileFormValues = {
  name: "",
  email: "",
  phoneCode: "",
  phone: "",
}

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const { update: updateSession } = useSession()
  const { data: currentUser, isLoading } = useCurrentUser()
  const updateProfile = useUpdateCurrentUser()
  const profile = currentUser?.data
  const form = useForm<ProfileFormValues>({
    defaultValues,
    mode: "onChange",
  })

  React.useEffect(() => {
    if (!profile) return

    form.reset({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phoneCode: profile.phoneCode ?? profile.phone_code ?? "",
      phone: profile.phone ?? "",
    })
  }, [form, profile])

  const pending = isLoading || updateProfile.isPending

  if (isLoading) return <ProfilePageSkeleton variant="form" />

  const fields: FormField<ProfileFormValues>[] = [
    {
      type: "text",
      name: "name",
      label: t("name"),
      required: true,
      inputProps: {
        autoComplete: "name",
        className: "h-11",
        disabled: pending,
        required: true,
      },
    },
    {
      type: "email",
      name: "email",
      label: t("emailAddress"),
      inputProps: {
        autoComplete: "email",
        className: "h-11",
        disabled: true,
        readOnly: true,
      },
    },
    {
      type: "phone",
      name: "phone",
      label: t("phone"),
      phoneCodeName: "phoneCode",
      phoneNumberName: "phone",
      span: 2,
      disabled: pending,
    },
  ]

  function saveProfile(values: ProfileFormValues) {
    updateProfile.mutate(
      {
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        phoneCode: values.phoneCode.trim() || undefined,
      },
      {
        onSuccess: async (response) => {
          const updated = response.data
          await updateSession({
            user: {
              name: updated.name,
              phone: updated.phone,
              phone_code: updated.phoneCode ?? updated.phone_code,
            },
          })
          toast.success(t("profileUpdated"))
          form.reset({
            name: updated.name ?? "",
            email: updated.email ?? "",
            phoneCode: updated.phoneCode ?? updated.phone_code ?? "",
            phone: updated.phone ?? "",
          })
        },
      }
    )
  }

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <AppFormComplete
          form={form}
          fields={fields}
          onSubmit={saveProfile}
          layout={{ columns: 2 }}
          isLoading={pending}
          loadingButtonText={t("saving")}
          submitButtonText={t("saveChanges")}
          submitButtonClassName="h-11 rounded-xl px-8 font-semibold sm:w-auto"
          submitDisabled={pending || !form.formState.isDirty}
          customRenderers={{
            phone: ({ field, form: activeForm, label }) =>
              field.type === "phone" ? (
                <div className="space-y-2">
                  {label ? <FormLabel>{label}</FormLabel> : null}
                  <PhoneField
                    control={activeForm.control}
                    phoneCodeName={
                      (field.phoneCodeName ?? "phoneCode") as "phoneCode"
                    }
                    phoneNumberName={
                      (field.phoneNumberName ?? "phone") as "phone"
                    }
                    disabled={field.disabled}
                    codeClass="h-11"
                    phoneClass="h-11"
                    codePlaceholder="+"
                    phonePlaceholder={t("phone")}
                  />
                </div>
              ) : null,
          }}
        />
      </section>
    </div>
  )
}
