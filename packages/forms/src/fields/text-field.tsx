"use client"

import * as React from "react"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  fieldType?: "text" | "email" | "number" | "tel" | "date"
}

function TextField({ fieldType = "text", ...props }: TextFieldProps) {
  return <Input type={fieldType} {...props} />
}

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function TextareaField(props: TextareaFieldProps) {
  return <Textarea {...props} />
}

export { TextField, TextareaField }
