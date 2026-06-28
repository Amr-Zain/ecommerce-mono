"use client"

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
  const form = useForm<ProfileFormValues>({
    defaultValues,
    mode: "onChange",
  })

  const fields: FormField<ProfileFormValues>[] = [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "email",
      name: "email",
      label: "Email Address",
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "tel",
      name: "phone",
      label: "Phone",
      required: true,
      inputProps: { required: true, className: "h-11" },
    },
    {
      type: "date",
      name: "birthday",
      label: "Birthday",
      inputProps: { className: "h-11" },
    },
    {
      type: "select",
      name: "gender",
      label: "Gender",
      placeholder: "Select Gender",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ],
      inputProps: { className: "h-11" },
    },
  ]

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Personal Information
        </h2>
        <AppFormComplete
          form={form}
          fields={fields}
          onSubmit={() => undefined}
          layout={{ columns: 2 }}
          submitButtonText="Save changes"
          submitButtonClassName="h-11 rounded-xl px-8 font-semibold sm:w-auto"
        />
      </section>
    </div>
  )
}
