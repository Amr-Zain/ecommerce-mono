"use client";

import React, { useState } from "react";
import {
  useForm,
  SubmitHandler,
  DefaultValues,
  UseFormReturn,
  FieldValues,
  FieldErrors,
} from "react-hook-form";
import { z } from "zod/v4";
import { zodFormResolver } from "@/lib/schema/resolver";
import { Form } from "@ecommerce/ui/components/form";
import { Button } from "@ecommerce/ui/components/button";
import { Alert, AlertDescription } from "@ecommerce/ui/components/alert";
import { Loader2, AlertCircle } from "lucide-react";
import Field from "./Field";
import { FieldProp } from "@/types/components/form";
import { cn } from "@/lib/utils";
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

// Form layout configuration
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
  showResetButton = false, // Default to false to make it optional
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
  // Added global error state for form-level errors
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Use a ref to keep the latest schema without re-triggering useForm
  const schemaRef = React.useRef<z.ZodType<unknown>>(schema);
  schemaRef.current = schema;

  const form = providedForm || useForm<T, unknown, T>({
    resolver: zodFormResolver(schemaRef.current),
    defaultValues,
    ...(values ? { values } : {}),
    mode: 'onChange',
  })
  const handleSubmit: SubmitHandler<T> = async (data) => {
    try {
      // Clear any previous global errors
      setGlobalError(null);
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);

      // Set global error message
      if (error instanceof Error) {
        setGlobalError(error.message);
      } else {
        setGlobalError("An unexpected error occurred. Please try again.");
      }

      // Call custom error handler if provided
      if (onError) {
        onError(error);
      }
    }
  };

  const handleReset = () => {
    // Clear global error when resetting
    setGlobalError(null);
    form.reset(defaultValues);
  };
  const spacingClasses = {
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
  };

  // Dynamic grid classes
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  console.log("Form Rendered with errors:", form.getValues(), form.formState.errors as FieldErrors<T>);
  return (
    <div
      className={`w-full ${className} ${layoutConfig.containerClassName || ""}`}
      dir={i18n.dir()}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className={`${spacingClasses[spacing]} ${formClassName}`}
        >
          {/* Global Error Display - Added to show form-level errors */}
          {globalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {/* Fields Container */}
          <div
            className={`grid gap-4 ${gridClasses[gridColumns as keyof typeof gridClasses] ||
              "grid-cols-1"
              } ${layoutConfig.fieldContainerClassName || ""}`}
          >
            {fields.map((fieldConfig, index) => {
              // Handle custom fields without name/control
              if (fieldConfig.type === "custom") {
                return (
                  <div
                    key={`custom-${index}`}
                    className={`col-span-1 md:col-span-${fieldConfig?.span || 1}`}
                  >
                    <Field {...fieldConfig} />
                  </div>
                );
              }
              return (
                <div
                  key={String(fieldConfig.name)}
                  className={
                    fieldConfig?.span
                      ? `col-span-full md:col-span-${fieldConfig.span || 1}`
                      : 'col-span-1 '
                  }
                >
                  <Field
                    key={String(fieldConfig.name)}
                    {...fieldConfig}
                    control={form.control}
                  />
                </div>
              )
            })}
          </div>

          {/* Buttons Container */}
          {showSubmitButton && (
            <div
              className={`flex gap-3 pt-4 ${showResetButton ? "justify-between" : "justify-end"
                } ${layoutConfig.buttonContainerClassName || ""}`}
            >
              {/* Only show reset button if showResetButton is true */}
              {showResetButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                  className={`${layoutConfig.resetButtonClassName || ""} border-border text-foreground hover:bg-muted hover:text-foreground`}
                >
                  {resetButtonText}
                </Button>
              )}

              <Button
                type="submit"
                disabled={isLoading || submitDisabled /* || !form.formState.isValid */}
                className={`min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90 ${layoutConfig.submitButtonClassName || ""
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

export default AppForm;
export type { GeneralFormConfig, FormLayoutConfig };
