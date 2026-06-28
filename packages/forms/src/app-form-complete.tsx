"use client"

import * as React from "react"
import type {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form"
import { useForm } from "react-hook-form"

import {
  AppForm,
  type AppFormProps,
  type AppFormPlatform,
} from "./app-form"
import type { FormField, FormLayoutConfig } from "./field-types"
import { FieldRenderer } from "./fields/field-renderer"

// ---------------------------------------------------------------------------
// AppFormComplete — the single form interface for both platforms
// ---------------------------------------------------------------------------

export interface AppFormCompleteProps<T extends FieldValues> {
  /** react-hook-form instance. If not provided, an internal form is created. */
  form?: UseFormReturn<T, unknown, T>
  /** Field definitions */
  fields: FormField<T>[]
  /** Submit handler */
  onSubmit: SubmitHandler<T>
  /** Error handler */
  onError?: (errors: unknown) => void
  /** Default values for the internal form (ignored if `form` is provided) */
  defaultValues?: DefaultValues<T>

  // --- Layout ---
  layout?: FormLayoutConfig
  platform?: AppFormPlatform

  // --- Buttons ---
  submitButtonText?: React.ReactNode
  loadingButtonText?: React.ReactNode
  resetButtonText?: React.ReactNode
  showResetButton?: boolean
  showSubmitButton?: boolean
  submitButtonClassName?: string
  resetButtonClassName?: string
  buttonContainerClassName?: string

  // --- State ---
  isLoading?: boolean
  submitDisabled?: boolean

  // --- Styling ---
  className?: string
  formClassName?: string
  containerClassName?: string
  fieldContainerClassName?: string
  dir?: "ltr" | "rtl"
  footer?: React.ReactNode

  /** Callback when reset button is clicked */
  onReset?: () => void

  // --- Custom field renderers (for platform-specific fields like map, editor, etc.) ---
  customRenderers?: Record<
    string,
    (props: {
      field: FormField<T>
      form: UseFormReturn<T, unknown, T>
      label: React.ReactNode
      required: boolean
    }) => React.ReactNode
  >
}

function AppFormComplete<T extends FieldValues>({
  form,
  fields,
  onSubmit,
  onError,
  defaultValues,
  layout,
  platform = "dashboard",
  submitButtonText,
  loadingButtonText,
  resetButtonText,
  showResetButton,
  showSubmitButton,
  submitButtonClassName,
  resetButtonClassName,
  buttonContainerClassName,
  isLoading,
  submitDisabled,
  className,
  formClassName,
  containerClassName,
  fieldContainerClassName,
  dir,
  footer,
  onReset,
  customRenderers,
}: AppFormCompleteProps<T>) {
  const internalForm = useForm<T, unknown, T>({
    defaultValues,
    mode: "onChange",
  })
  const currentForm = form || internalForm

  // Filter out hidden fields
  const visibleFields = fields.filter((f) => !f.hidden)

  return (
    <AppForm<T, FormField<T>>
      form={currentForm}
      fields={visibleFields}
      onSubmit={onSubmit}
      onError={onError}
      platform={platform}
      gridColumns={layout?.columns ?? 1}
      spacing={layout?.spacing ?? "md"}
      dir={dir ?? layout?.dir}
      className={className ?? layout?.className}
      formClassName={formClassName}
      containerClassName={containerClassName}
      fieldContainerClassName={fieldContainerClassName ?? layout?.fieldClassName}
      buttonContainerClassName={buttonContainerClassName ?? layout?.buttonClassName}
      submitButtonText={submitButtonText}
      loadingButtonText={loadingButtonText}
      resetButtonText={resetButtonText}
      showResetButton={showResetButton}
      showSubmitButton={showSubmitButton}
      submitButtonClassName={submitButtonClassName}
      resetButtonClassName={resetButtonClassName}
      isLoading={isLoading}
      submitDisabled={submitDisabled}
      resetValues={defaultValues}
      footer={footer}
      onReset={onReset}
      renderField={({ field, form: activeForm, label, required }) => (
        <FieldRenderer
          field={field}
          form={activeForm}
          label={label}
          required={required}
          customRenderers={customRenderers}
        />
      )}
    />
  )
}

export { AppFormComplete }
