"use client";

import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ecommerce/ui/components/form";
import type { FormField as FormFieldConfig } from "../field-types";
import { TextField, TextareaField } from "./text-field";
import { PasswordField } from "./password-field";
import { OTPField } from "./otp-field";
import { SelectField } from "./select-field";
import { FileField } from "./file-field";
import { RadioField } from "./radio-field";
import { CheckboxField, SwitchField } from "./checkbox-field";
import { IdentifierField } from "./identifier-field";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export interface FieldRendererProps<T extends FieldValues> {
  field: FormFieldConfig<T>;
  form: UseFormReturn<T, unknown, T>;
  label: React.ReactNode;
  required: boolean;
  /** Override renderers for custom/platform-specific field types */
  customRenderers?: Record<
    string,
    (props: {
      field: FormFieldConfig<T>;
      form: UseFormReturn<T, unknown, T>;
      label: React.ReactNode;
      required: boolean;
    }) => React.ReactNode
  >;
}

function FieldRenderer<T extends FieldValues>({
  field,
  form,
  label,
  required,
  customRenderers,
}: FieldRendererProps<T>) {
  // Custom field — render via render function or customItem
  if (field.type === "custom") {
    if (field.render) {
      return <>{field.render({ form, label, required })}</>;
    }
    if (field.customItem) {
      return <>{field.customItem}</>;
    }
    return null;
  }

  // Check if there's a custom renderer registered for this field type
  if (customRenderers?.[field.type]) {
    return <>{customRenderers[field.type]({ field, form, label, required })}</>;
  }

  // Identifier field (phone/email auto-detect) — special case, no FormField wrapper
  if (field.type === "identifier") {
    return (
      <IdentifierField
        form={form}
        name={field.name}
        phoneCodeName={field.phoneCodeName}
        label={label}
        phoneCodeLabel={field.phoneCodeLabel}
        countrySearchPlaceholder={field.countrySearchPlaceholder}
        noCountryText={field.noCountryText}
        phoneMustStartWithText={field.phoneMustStartWithText}
        required={required}
        disabled={field.disabled}
        detectedPhoneText={field.detectedPhoneText}
        detectedEmailText={field.detectedEmailText}
        phoneCodeClassName={field.phoneCodeClassName}
        inputProps={field.inputProps}
        phoneCodeInputProps={field.phoneCodeInputProps}
      />
    );
  }

  // All other fields use FormField wrapper
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: controllerField }) => (
        <FormItem
          className={
            field.type === "checkbox" || field.type === "switch"
              ? "mt-6"
              : "space-y-2"
          }
        >
          {/* Label — skip for checkbox/switch (they render inline) */}
          {field.type !== "checkbox" && field.type !== "switch" && label ? (
            <FormLabel>{label}</FormLabel>
          ) : null}

          <FormControl>
            {renderFieldInput(field, controllerField, form)}
          </FormControl>

          {/* Description */}
          {"description" in field && field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function renderFieldInput<T extends FieldValues>(
  field: Exclude<
    FormFieldConfig<T>,
    { type: "custom" } | { type: "identifier" }
  >,
  controllerField: any,
  form: UseFormReturn<T, unknown, T>,
): React.ReactElement {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
    case "tel":
    case "date":
      return (
        <TextField
          fieldType={field.type}
          placeholder={field.placeholder}
          disabled={field.disabled}
          {...controllerField}
          value={controllerField.value ?? ""}
          {...field.inputProps}
        />
      );

    case "password":
      return (
        <PasswordField
          placeholder={field.placeholder}
          disabled={field.disabled}
          {...controllerField}
          value={controllerField.value ?? ""}
          {...field.inputProps}
        />
      );

    case "textarea":
      return (
        <TextareaField
          placeholder={field.placeholder}
          disabled={field.disabled}
          rows={field.rows}
          {...controllerField}
          value={controllerField.value ?? ""}
          {...field.inputProps}
        />
      );

    case "otp":
      return (
        <OTPField
          value={controllerField.value || ""}
          onChange={controllerField.onChange}
          length={field.length ?? 4}
          disabled={field.disabled}
          type={field.otpType}
        />
      );

    case "select":
      return (
        <SelectField
          field={controllerField}
          options={field.options}
          placeholder={field.placeholder}
          disabled={field.disabled}
          multiple={field.multiple}
          {...(field.inputProps as any)}
        />
      );

    case "radio":
      return (
        <RadioField
          options={field.options}
          value={controllerField.value}
          onValueChange={controllerField.onChange}
          disabled={field.disabled}
          orientation={field.orientation}
        />
      );

    case "checkbox":
      return (
        <CheckboxField
          checked={!!controllerField.value}
          onCheckedChange={controllerField.onChange}
          disabled={field.disabled}
          label={field.label}
        />
      );

    case "switch":
      return (
        <SwitchField
          checked={!!controllerField.value}
          onCheckedChange={controllerField.onChange}
          disabled={field.disabled}
          label={field.label}
        />
      );

    case "file":
      return (
        <FileField
          multiple={field.multiple}
          accept={field.accept}
          disabled={field.disabled}
          onChange={(files) => controllerField.onChange(files)}
          {...field.inputProps}
        />
      );

    case "datePicker":
    case "phone":
    case "color":
      // These are platform-specific — should be handled by customRenderers
      // If no custom renderer provided, render a placeholder
      return (
        <div className="text-sm text-muted-foreground">
          [Register a customRenderer for &quot;{field.type}&quot;]
        </div>
      );

    default:
      return (
        <TextField
          placeholder={(field as any).placeholder}
          disabled={(field as any).disabled}
          {...controllerField}
          value={controllerField.value ?? ""}
        />
      );
  }
}

export { FieldRenderer };
