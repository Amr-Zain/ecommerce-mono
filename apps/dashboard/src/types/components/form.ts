import { Control, FieldPath, FieldValues } from "react-hook-form";
import React from "react";
import { MapFieldProps, Position } from "@/components/common/form/MapField";
import { EditorProps } from "@/components/common/form/Editor/EditorField";
import { FileUploadInputProps } from "./uploader";
import { DateRange } from "react-day-picker";
import { SelectInputProps } from "@/components/common/form/Select";

// Base interfaces for common props
interface BaseFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string | React.ReactNode;
    span?: number;
    placeholder?: string;
    control?: Control<T>;
}
interface ColorInputProps extends BaseInputProps {
  size?: 'default' | 'sm' | 'lg' | 'icon'
}
// Option type for select and radio fields
interface FieldOption {
    value: string | number;
    label: string | React.ReactNode;
}

// Input props for different field types
interface BaseInputProps extends Record<string, any> {
    className?: string;
    disabled?: boolean;
    required?: boolean;
}

interface TextInputProps extends BaseInputProps {
    maxLength?: number;
    minLength?: number;
}

interface NumberInputProps extends BaseInputProps {
    min?: number;
    max?: number;
    step?: number;
}

interface TextAreaInputProps extends BaseInputProps {
    rows?: number;
    cols?: number;
    resize?: boolean;
}


interface CheckboxInputProps extends BaseInputProps {
    indeterminate?: boolean;
}

interface RadioInputProps extends BaseInputProps {
    orientation?: "horizontal" | "vertical";
}

interface PasswordInputProps extends BaseInputProps {
    showToggle?: boolean;
}

interface OTPInputProps extends BaseInputProps {
    length?: number;
    type?: "numeric" | "alphanumeric";
    handleOTPChange?: (value: string) => void;
}

// Phone field specific props
interface CountryCodeData {
    id: number;
    name: string;
    phone_code: string;
    phone_limit: number;
    flag: string;
}

interface PhoneInputProps extends BaseInputProps {
    phoneCodeName?: string;
    phoneNumberName?: string;
    countries?: CountryCodeData[];
    currentPhoneLimit?: number | null;
    disableCode?: boolean;
    countryId?: string | number;
    codeClass?: string;
    phoneClass?: string;
    setCurrentPhoneLimit?: (value: number | null) => void;
    setPhoneStartingNumber?: (value: number | null) => void;
}

// Date picker props
interface DateInputProps extends BaseInputProps {
    mode?: "single" | "range" | "multiple";
    disabledDates?: {
        from?: Date;
        to?: Date;
    };
    format?: string;
}

// Map field props
interface MapInputProps extends BaseInputProps {
    onMarkerPositionChange?: (position: Position) => void;
    defaultMarkerPosition?: Position;
    locations?: Position[];
    zoom?: number;
    height?: number;
    mapContainerStyle?: React.CSSProperties;
}

// Editor props
interface EditorInputProps extends BaseInputProps {
    height?: number;
    toolbar?: any;
}

// Multi-language field props
interface MultiLangInputProps extends BaseInputProps {
    type?: "input" | "editor";
    languages?: Array<{
        key: string;
        label: string;
    }>;
    defaultLanguage?: string;
}

// File upload props extending the uploader types
interface FileUploadFieldInputProps extends FileUploadInputProps, BaseInputProps {}

// Discriminated union for all field types
export type FieldProp<T extends FieldValues, TSelect = unknown> =
  ({
      type: 'text'
      inputProps?: TextInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'email'
      inputProps?: TextInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'textarea'
      inputProps?: TextAreaInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'number'
      inputProps?: NumberInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'password'
      inputProps?: PasswordInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'checkbox'
      inputProps?: CheckboxInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'select'
      inputProps?: Omit<SelectInputProps<T, TSelect>, 'field'>
    } & BaseFieldProps<T>)
  | ({
      type: 'radio'
      inputProps?: RadioInputProps
      options: FieldOption[]
    } & BaseFieldProps<T>)
  | ({
      type: 'otp'
      inputProps?: OTPInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'phone'
      inputProps?: PhoneInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'date'
      inputProps?: DateInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'map'
      inputProps?: MapInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'editor'
      inputProps?: EditorInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'multiLangField'
      inputProps?: MultiLangInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'fileUpload'
      inputProps?: FileUploadFieldInputProps
    } & BaseFieldProps<T>)
  | ({
      type: 'mediaUploader' 
      inputProps?: FileUploadFieldInputProps
    } & BaseFieldProps<T>)
  | ({
      type:  'imgUploader'
      inputProps?: FileUploadFieldInputProps
    } & BaseFieldProps<T>)
  | {
      type: 'custom'
      customItem: React.ReactNode
      span?: number
      name?: FieldPath<T>
      control?: Control<T>
      label?: string | React.ReactNode
    } 
    | {
      type: 'switch'
      inputProps?: CheckboxInputProps
    } & BaseFieldProps<T>
  | ({
    type: 'color'
    inputProps?: ColorInputProps
  } & BaseFieldProps<T>)

export type {
    BaseFieldProps,
    FieldOption,
    TextInputProps,
    NumberInputProps,
    TextAreaInputProps,
    SelectInputProps,
    CheckboxInputProps,
    RadioInputProps,
    PasswordInputProps,
    OTPInputProps,
    PhoneInputProps,
    DateInputProps,
    MapInputProps,
    EditorInputProps,
    CountryCodeData,
    MultiLangInputProps,
    FileUploadFieldInputProps,
};