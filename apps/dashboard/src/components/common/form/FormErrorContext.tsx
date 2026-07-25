import { createContext, useContext } from 'react'

export type FormErrors = Record<string, string>

export interface FormErrorContextValue {
  setFormErrors: (errors: FormErrors) => void
}

export const FormErrorContext = createContext<FormErrorContextValue | null>(null)

export function useFormErrorContext() {
  return useContext(FormErrorContext)
}
