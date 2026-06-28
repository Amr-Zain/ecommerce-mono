"use client"

import * as React from "react"
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type {
  DefaultValues,
  FieldPath,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form"

import { Alert, AlertDescription } from "@ecommerce/ui/components/alert"
import { Button } from "@ecommerce/ui/components/button"
import { Form } from "@ecommerce/ui/components/form"
import { cn } from "@ecommerce/ui/lib/utils"

export type AppFormPlatform = "dashboard" | "shop"
export type AppFormSpacing = "sm" | "md" | "lg"
export type AppFormGridColumns = 1 | 2 | 3 | 4

export interface SharedFormField<T extends FieldValues = FieldValues> {
  name?: FieldPath<T> | string
  label?: React.ReactNode
  required?: boolean
  span?: number
  inputProps?: {
    required?: boolean
    [key: string]: unknown
  }
  type?: string
}

export interface RequiredLabelProps {
  children: React.ReactNode
  required?: boolean
  className?: string
  markerClassName?: string
}

export function RequiredLabel({
  children,
  required = false,
  className,
  markerClassName,
}: RequiredLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{children}</span>
      {required ? (
        <span
          aria-hidden="true"
          className={cn("text-destructive", markerClassName)}
        >
          *
        </span>
      ) : null}
    </span>
  )
}

export const isFieldRequired = (field: SharedFormField) =>
  Boolean(field.required || field.inputProps?.required)

export const renderRequiredLabel = (
  label: React.ReactNode,
  required?: boolean,
) => {
  if (!label) return label
  return <RequiredLabel required={required}>{label}</RequiredLabel>
}

export interface AppFormRenderFieldArgs<
  T extends FieldValues,
  TField extends SharedFormField<T>,
> {
  field: TField
  form: UseFormReturn<T, unknown, T>
  index: number
  required: boolean
  label: React.ReactNode
}

export interface AppFormProps<
  T extends FieldValues,
  TField extends SharedFormField<T> = SharedFormField<T>,
> {
  form: UseFormReturn<T, unknown, T>
  fields: TField[]
  onSubmit: SubmitHandler<T>
  renderField: (args: AppFormRenderFieldArgs<T, TField>) => React.ReactNode
  onError?: (errors: unknown) => void
  submitButtonText?: React.ReactNode
  loadingButtonText?: React.ReactNode
  resetButtonText?: React.ReactNode
  showResetButton?: boolean
  showSubmitButton?: boolean
  isLoading?: boolean
  submitDisabled?: boolean
  className?: string
  formClassName?: string
  gridColumns?: AppFormGridColumns | number
  spacing?: AppFormSpacing
  platform?: AppFormPlatform
  resetValues?: DefaultValues<T>
  dir?: React.HTMLAttributes<HTMLDivElement>["dir"]
  containerClassName?: string
  fieldContainerClassName?: string
  buttonContainerClassName?: string
  submitButtonClassName?: string
  resetButtonClassName?: string
  footer?: React.ReactNode
  onReset?: () => void
}

const spacingClasses: Record<AppFormSpacing, string> = {
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
}

const gridClasses: Record<AppFormGridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}

const spanClasses: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-full md:col-span-2",
  3: "col-span-full md:col-span-3",
  4: "col-span-full md:col-span-4",
}

const platformClasses = {
  dashboard: {
    submitButton:
      "min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90",
    resetButton:
      "border-border text-foreground hover:bg-muted hover:text-foreground",
    buttonContainer: "",
    loadingIcon: "me-2 h-4 w-4 animate-spin",
  },
  shop: {
    submitButton:
      "h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90",
    resetButton: "h-11 rounded-xl",
    buttonContainer: "flex-col sm:flex-row",
    loadingIcon: "me-2 h-4 w-4 animate-spin",
  },
} satisfies Record<
  AppFormPlatform,
  {
    submitButton: string
    resetButton: string
    buttonContainer: string
    loadingIcon: string
  }
>

const getGridClass = (gridColumns: number) =>
  gridClasses[gridColumns as AppFormGridColumns] || gridClasses[1]

const getSpanClass = (span?: number) =>
  span ? spanClasses[span] || "col-span-full" : "col-span-1"

function AppForm<
  T extends FieldValues,
  TField extends SharedFormField<T> = SharedFormField<T>,
>({
  form,
  fields,
  onSubmit,
  renderField,
  onError,
  submitButtonText = "Submit",
  loadingButtonText,
  resetButtonText = "Reset",
  showResetButton = false,
  showSubmitButton = true,
  isLoading = false,
  submitDisabled = false,
  className,
  formClassName,
  gridColumns = 1,
  spacing = "md",
  platform = "dashboard",
  resetValues,
  dir,
  containerClassName,
  fieldContainerClassName,
  buttonContainerClassName,
  submitButtonClassName,
  resetButtonClassName,
  footer,
  onReset,
}: AppFormProps<T, TField>) {
  const [globalError, setGlobalError] = React.useState<string | null>(null)
  const platformClass = platformClasses[platform]

  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      setGlobalError(null)
      await onSubmit(data)
    } catch (error) {
      console.error("Form submission error:", error)
      setGlobalError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      )
      onError?.(error)
    }
  }

  const handleReset = () => {
    setGlobalError(null)
    form.reset(resetValues)
    onReset?.()
  }

  return (
    <div className={cn("w-full", className, containerClassName)} dir={dir}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={cn(spacingClasses[spacing], formClassName)}
        >
          {globalError ? (
            <Alert variant="destructive" className="mb-4">
              <HugeiconsIcon
                icon={Alert02Icon}
                strokeWidth={2}
                className="h-4 w-4"
              />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          ) : null}

          <div
            className={cn(
              "grid gap-4",
              getGridClass(Number(gridColumns)),
              fieldContainerClassName,
            )}
          >
            {fields.map((field, index) => {
              const required = isFieldRequired(field)
              const label = renderRequiredLabel(field.label, required)

              return (
                <div
                  key={String(field.name ?? `custom-${index}`)}
                  className={getSpanClass(field.span)}
                >
                  {renderField({ field, form, index, required, label })}
                </div>
              )
            })}
          </div>

          {showSubmitButton ? (
            <div
              className={cn(
                "flex gap-3 pt-4",
                platformClass.buttonContainer,
                showResetButton ? "justify-between" : "justify-end",
                buttonContainerClassName,
              )}
            >
              {showResetButton ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className={cn(platformClass.resetButton, resetButtonClassName)}
                >
                  {resetButtonText}
                </Button>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading || submitDisabled}
                className={cn(platformClass.submitButton, submitButtonClassName)}
              >
                {isLoading ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      strokeWidth={2}
                      className={platformClass.loadingIcon}
                    />
                    {loadingButtonText}
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>
          ) : null}

          {footer ? (
            <div className="flex justify-center pt-2">{footer}</div>
          ) : null}
        </form>
      </Form>
    </div>
  )
}

export { AppForm, platformClasses }
