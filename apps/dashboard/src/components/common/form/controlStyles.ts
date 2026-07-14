import { cn } from '@/lib/utils'

/**
 * Shared visual contract for controls rendered by the dashboard AppForm.
 *
 * Keep these classes based on semantic theme tokens so controls follow the
 * active dashboard theme instead of pinning light or dark colours locally.
 */
export const dashboardFormControlClassName = cn(
  'h-10 w-full min-w-0 rounded-lg border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs',
  'placeholder:text-muted-foreground',
  'dark:bg-input/30',
)

export const dashboardFormTextareaClassName = cn(
  'min-h-24 w-full min-w-0 rounded-lg border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs',
  'placeholder:text-muted-foreground',
  'dark:bg-input/30',
)

export const dashboardNumberControlClassName = cn(
  dashboardFormControlClassName,
  'no-spinner',
)
