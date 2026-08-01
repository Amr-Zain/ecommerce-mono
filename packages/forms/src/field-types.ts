"use client";

import type * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

// ---------------------------------------------------------------------------
// Shared field option (select, radio, combobox)
// ---------------------------------------------------------------------------

export interface FieldOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Base field props shared by all field types
// ---------------------------------------------------------------------------

export interface BaseFormField<T extends FieldValues> {
  name: FieldPath<T>;
  label?: React.ReactNode;
  required?: boolean;
  span?: number;
  placeholder?: string;
  description?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Render args passed to custom field render functions
// ---------------------------------------------------------------------------

export interface FieldRenderArgs<T extends FieldValues> {
  form: UseFormReturn<T, unknown, T>;
  label: React.ReactNode;
  required: boolean;
}

// ---------------------------------------------------------------------------
// Unified FormField discriminated union
// All fields shared between dashboard and web
// ---------------------------------------------------------------------------

export type FormField<T extends FieldValues> =
  // Text-like inputs
  | (BaseFormField<T> & {
      type: "text" | "email" | "number" | "password" | "tel" | "date";
      inputProps?: Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "value" | "defaultValue" | "type"
      >;
    })
  // Textarea
  | (BaseFormField<T> & {
      type: "textarea";
      rows?: number;
      inputProps?: Omit<
        React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        "name" | "value" | "defaultValue"
      >;
    })
  // Select
  | (BaseFormField<T> & {
      type: "select";
      options: FieldOption[];
      multiple?: boolean;
      inputProps?: Omit<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        "name" | "value" | "defaultValue"
      > &
        Record<string, unknown>;
    })
  // Radio
  | (BaseFormField<T> & {
      type: "radio";
      options: FieldOption[];
      orientation?: "horizontal" | "vertical";
      inputProps?: Record<string, unknown>;
    })
  // Checkbox
  | (BaseFormField<T> & {
      type: "checkbox";
      inputProps?: Record<string, unknown>;
    })
  // Switch
  | (BaseFormField<T> & {
      type: "switch";
      inputProps?: Record<string, unknown>;
    })
  // OTP
  | (BaseFormField<T> & {
      type: "otp";
      length?: number;
      otpType?: "numeric" | "alphanumeric";
      inputProps?: Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "value" | "defaultValue" | "type" | "maxLength"
      >;
    })
  // Phone / Email identifier (auto-detect)
  | (BaseFormField<T> & {
      type: "identifier";
      phoneCodeName: FieldPath<T>;
      phoneCodeLabel?: string;
      countrySearchPlaceholder?: string;
      noCountryText?: string;
      phoneMustStartWithText?: string;
      detectedPhoneText?: React.ReactNode;
      detectedEmailText?: React.ReactNode;
      phoneCodeClassName?: string;
      inputProps?: Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "value" | "defaultValue" | "type"
      >;
      phoneCodeInputProps?: Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "value" | "defaultValue" | "type"
      >;
    })
  // Phone (with country code)
  | (BaseFormField<T> & {
      type: "phone";
      phoneCodeName?: string;
      phoneNumberName?: string;
      inputProps?: Record<string, unknown>;
    })
  // Date picker (advanced)
  | (BaseFormField<T> & {
      type: "datePicker";
      mode?: "single" | "range" | "multiple";
      disabledDates?: { from?: Date; to?: Date };
      inputProps?: Record<string, unknown>;
    })
  // File upload (basic)
  | (BaseFormField<T> & {
      type: "file";
      multiple?: boolean;
      accept?: string;
      inputProps?: Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "value" | "defaultValue" | "onChange" | "type"
      >;
    })
  // Color picker
  | (BaseFormField<T> & {
      type: "color";
      inputProps?: Record<string, unknown>;
    })
  // Custom — escape hatch for platform-specific fields
  | {
      type: "custom";
      name?: FieldPath<T>;
      label?: React.ReactNode;
      required?: boolean;
      span?: number;
      hidden?: boolean;
      className?: string;
      render: (args: FieldRenderArgs<T>) => React.ReactNode;
      /** For dashboard compatibility — raw ReactNode instead of render function */
      customItem?: React.ReactNode;
      inputProps?: Record<string, unknown>;
    };

// ---------------------------------------------------------------------------
// Layout configuration — control form shape from one interface
// ---------------------------------------------------------------------------

export type FormDirection = "ltr" | "rtl";
export type FormSpacing = "sm" | "md" | "lg";
export type FormColumns = 1 | 2 | 3 | 4;

export interface FormLayoutConfig {
  /** Number of grid columns */
  columns?: FormColumns | number;
  /** Vertical spacing between rows */
  spacing?: FormSpacing;
  /** Text direction */
  dir?: FormDirection;
  /** Container class name */
  className?: string;
  /** Field grid class name */
  fieldClassName?: string;
  /** Button container class name */
  buttonClassName?: string;
}

// ---------------------------------------------------------------------------
// Utility: check if a value looks like a phone number (digits only)
// ---------------------------------------------------------------------------

export const isPhoneIdentifier = (value: string) => /^\d+$/.test(value.trim());
