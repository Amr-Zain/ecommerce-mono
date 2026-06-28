"use client"

/**
 * Backward-compatible exports.
 * ShopAppForm → AppFormComplete with platform="shop"
 * ShopFormField → FormField
 */
import * as React from "react"
import type { FieldValues } from "react-hook-form"
import { AppFormComplete, type AppFormCompleteProps } from "./app-form-complete"
import type { FormField, FormLayoutConfig } from "./field-types"
import type { AppFormGridColumns, AppFormSpacing } from "./app-form"

// Re-export FormField as ShopFormField for backward compat
export type ShopFormField<T extends FieldValues> = FormField<T>

export interface ShopAppFormProps<T extends FieldValues>
  extends Omit<AppFormCompleteProps<T>, "platform" | "layout"> {
  /** Grid columns (shorthand for layout.columns) */
  gridColumns?: AppFormGridColumns | number
  /** Spacing (shorthand for layout.spacing) */
  spacing?: AppFormSpacing
  /** Layout config (takes precedence over shorthand props) */
  layout?: FormLayoutConfig
}

/**
 * @deprecated Use `AppFormComplete` with `platform="shop"` instead.
 */
function ShopAppForm<T extends FieldValues>({
  gridColumns,
  spacing,
  layout,
  ...props
}: ShopAppFormProps<T>) {
  const resolvedLayout: FormLayoutConfig = {
    ...layout,
    ...(gridColumns !== undefined ? { columns: gridColumns as any } : {}),
    ...(spacing !== undefined ? { spacing } : {}),
  }

  return <AppFormComplete<T> {...props} layout={resolvedLayout} platform="shop" />
}

export { ShopAppForm }
