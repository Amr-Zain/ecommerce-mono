"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { AppFormComplete, type FormField } from "@ecommerce/forms"

type ProfileFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthday: string
  gender: string
}

const defaultValues: ProfileFormValues = {
  firstName: "John",
  lastName: "Doe",
  email: "john@gmail.com",
  phone: "123-456-0789",
  birthday: "2002-06-11",
  gender: "male",
}

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const form = useForm<ProfileFormValues>({
    defaultValues,
    mode: "onChange",
  })

  const fields: FormField<ProfileFormValues>[] = [
    {
      type: "text",
      name: "firstName",
      label: t("firstName"),
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "text",
      name: "lastName",
      label: t("lastName"),
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "email",
      name: "email",
      label: t("emailAddress"),
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "tel",
      name: "phone",
      label: t("phone"),
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "date",
      name: "birthday",
      label: t("birthday"),
      inputProps: { className: "h-11" },
    },
    {
      type: "select",
      name: "gender",
      label: t("gender"),
      placeholder: t("selectGender"),
      options: [
        { value: "male", label: t("male") },
        { value: "female", label: t("female") },
        { value: "other", label: t("other") },
      ],
      inputProps: { className: "h-11" },
    },
  ]

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <AppFormComplete
          form={form}
          fields={fields}
          onSubmit={() => undefined}
          layout={{ columns: 2 }}
          submitButtonText={t("saveChanges")}
          submitButtonClassName="h-11 rounded-xl px-8 font-semibold sm:w-auto"
        />
      </section>
    </div>
  )
}
