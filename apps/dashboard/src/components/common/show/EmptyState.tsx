import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'

export interface EmptyStateProps {
  icon?: React.ReactNode
  message: React.ReactNode
  description?: React.ReactNode
  className?: string
  /** Size for the default icon (when `icon` not provided) */
  iconClassName?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon,
  message,
  description,
  className,
  iconClassName = 'h-10 w-10',
  children,
}: EmptyStateProps) {
  return (
    <div
      className={[
        'text-center text-muted-foreground flex flex-col items-center gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ?? (
        <HugeiconsIcon icon={InformationCircleIcon} className={iconClassName + ' opacity-30'} />
      )}
      {message ? <span className="text-sm font-medium">{message}</span> : null}
      {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
      {children}
    </div>
  )
}
