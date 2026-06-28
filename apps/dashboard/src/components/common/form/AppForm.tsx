"use client";

import React from "react";
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { AppForm as SharedAppForm } from "@ecommerce/forms";
import { z } from "zod/v4";
import { zodFormResolver } from "@/lib/schema/resolver";
import Field from "./Field";
import { FieldProp } from "@/types/components/form";
import { useTranslation } from "react-i18next";

interface GeneralFormConfig<T extends FieldValues> {
  schema: z.ZodType<unknown>
  fields: FieldProp<T>[]
  defaultValues?: DefaultValues<T>
  values?: T
  onSubmit: SubmitHandler<T>
  onError?: (errors: unknown) => void
  submitButtonText?: string
  resetButtonText?: string
  showResetButton?: boolean
  showSubmitButton?: boolean
  isLoading?: boolean
  submitDisabled?: boolean
  className?: string
  formClassName?: string
  gridColumns?: number
  spacing?: 'sm' | 'md' | 'lg'
  providedForm?: UseFormReturn<T, unknown, T>
}

interface FormLayoutConfig {
  containerClassName?: string;
  fieldContainerClassName?: string;
  buttonContainerClassName?: string;
  submitButtonClassName?: string;
  resetButtonClassName?: string;
}

function AppForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  values,
  onSubmit,
  onError,
  submitButtonText = "Submit",
  resetButtonText = "Reset",
  showResetButton = false,
  showSubmitButton = true,
  isLoading = false,
  submitDisabled = false,
  className = "",
  formClassName = "",
  gridColumns = 1,
  spacing = "md",
  providedForm,
  ...layoutConfig
}: GeneralFormConfig<T> & FormLayoutConfig) {
  const { i18n } = useTranslation()
  const schemaRef = React.useRef<z.ZodType<unknown>>(schema)
  schemaRef.current = schema

  const internalForm = useForm<T, unknown, T>({
    resolver: zodFormResolver(schemaRef.current),
    defaultValues,
    ...(values ? { values } : {}),
    mode: 'onChange',
  })
  const form = providedForm || internalForm

  return (
    <SharedAppForm<T, FieldProp<T>>
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onError={onError}
      submitButtonText={submitButtonText}
      resetButtonText={resetButtonText}
      showResetButton={showResetButton}
      showSubmitButton={showSubmitButton}
      isLoading={isLoading}
      submitDisabled={submitDisabled}
      className={className}
      formClassName={formClassName}
      gridColumns={gridColumns}
      spacing={spacing}
      platform="dashboard"
      resetValues={defaultValues}
      dir={i18n.dir() as "ltr" | "rtl"}
      {...layoutConfig}
      renderField={({ field, form: currentForm, label }) => (
        <Field
          {...field}
          label={label}
          control={field.type === "custom" ? field.control : currentForm.control}
        />
      )}
    />
  )
}

export default AppForm;
export type { GeneralFormConfig, FormLayoutConfig };
