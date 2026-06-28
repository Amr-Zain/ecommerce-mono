"use client"

import * as React from "react"
import { Input } from "@ecommerce/ui/components/input"

export interface FileFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  onChange?: (files: File | File[] | null) => void
  multiple?: boolean
}

function FileField({ onChange, multiple, ...props }: FileFieldProps) {
  return (
    <Input
      type="file"
      multiple={multiple}
      onChange={(event) => {
        const files = event.currentTarget.files
        if (!files || files.length === 0) {
          onChange?.(null)
          return
        }
        onChange?.(multiple ? Array.from(files) : files[0])
      }}
      {...props}
    />
  )
}

export { FileField }
