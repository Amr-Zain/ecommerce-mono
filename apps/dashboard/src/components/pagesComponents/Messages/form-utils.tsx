import { ReactNode } from 'react'
import { Label } from '@ecommerce/ui/components/label'
import { toast } from 'sonner'

export function MessageField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function parseJsonObject(
  value: string,
  errorMessage: string,
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected object')
    }
    return parsed
  } catch {
    toast.error(errorMessage)
    return null
  }
}
