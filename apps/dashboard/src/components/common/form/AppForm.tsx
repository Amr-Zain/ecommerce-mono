'use client'

import React from 'react'
import {
  useForm
} from 'react-hook-form'
import { AppForm as SharedAppForm } from '@ecommerce/forms'
import { useTranslation } from 'react-i18next'
import Field from './Field'
import { FormErrorContext } from './FormErrorContext'
import type {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFormReturn} from 'react-hook-form';
import type { z } from 'zod/v4'
import type { FieldProp } from '@/types/components/form'
import type { FormErrors } from './FormErrorContext'
import { zodFormResolver } from '@/lib/schema/resolver'

interface GeneralFormConfig<T extends FieldValues> {
  schema: z.ZodType<unknown>
  fields: Array<FieldProp<T>>
  defaultValues?: DefaultValues<T>
  values?: T
  onSubmit: SubmitHandler<T>
  onError?: (errors: unknown) => void
  submitButtonText?: string
  loadingButtonText?: string
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
  containerClassName?: string
  fieldContainerClassName?: string
  buttonContainerClassName?: string
  submitButtonClassName?: string
  resetButtonClassName?: string
}

function AppForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  values,
  onSubmit,
  onError,
  submitButtonText = 'Submit',
  loadingButtonText,
  resetButtonText = 'Reset',
  showResetButton = false,
  showSubmitButton = true,
  isLoading = false,
  submitDisabled = false,
  className = '',
  formClassName = '',
  gridColumns = 1,
  spacing = 'md',
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

  const setFormErrors = React.useCallback(
    (errors: FormErrors) => {
      for (const [field, message] of Object.entries(errors)) {
        if (message && typeof message === 'string') {
          ;(form as UseFormReturn<T>).setError(field as any, {
            message,
          })
        }
      }
    },
    [form],
  )

  const ctxValue = React.useMemo(() => ({ setFormErrors }), [setFormErrors])

  const wrappedOnSubmit: SubmitHandler<T> = React.useCallback(
    async (data) => {
      await onSubmit(data)
    },
    [onSubmit],
  )

  return (
    <FormErrorContext.Provider value={ctxValue}>
      <SharedAppForm<T, FieldProp<T>>
        form={form}
        fields={fields}
        onSubmit={wrappedOnSubmit}
        onError={onError}
        submitButtonText={submitButtonText}
        loadingButtonText={loadingButtonText}
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
        dir={i18n.dir()}
        {...layoutConfig}
        renderField={({ field, form: currentForm, label }) => (
          <Field
            {...field}
            label={label}
            control={
              field.type === 'custom' ? field.control : currentForm.control
            }
          />
        )}
      />
    </FormErrorContext.Provider>
  )
}

export default AppForm
export type { GeneralFormConfig, FormLayoutConfig }
