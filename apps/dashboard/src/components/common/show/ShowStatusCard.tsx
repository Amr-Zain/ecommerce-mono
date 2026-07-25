import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Switch } from '@ecommerce/ui/components/switch'
import { useTranslation } from 'react-i18next'
import { HasPermission } from '@/components/common/HasPermission'
import type { PermissionAction } from '@/types/auth'

export interface ShowStatusCardProps {
  isActive: boolean
  activeLabel?: string
  inactiveLabel?: string
  /** Permission gate for the toggle switch */
  permissionEntity?: string
  permissionAction?: PermissionAction
  onToggle?: (next: boolean) => void
  togglePending?: boolean
  title?: React.ReactNode
  className?: string
  /** Hide the toggle switch (read-only status display) */
  readOnly?: boolean
}

export function ShowStatusCard({
  isActive,
  activeLabel,
  inactiveLabel,
  permissionEntity,
  permissionAction = 'update',
  onToggle,
  togglePending,
  title,
  className,
  readOnly = false,
}: ShowStatusCardProps) {
  const { t } = useTranslation()

  const switchEl = (
    <Switch
      checked={isActive}
      onCheckedChange={(checked: boolean) => onToggle?.(checked)}
      disabled={togglePending || !onToggle}
    />
  )

  return (
    <Card
      className={[
        'shadow-sm border-muted/60 overflow-hidden pt-0 group hover:border-primary/30 transition-all duration-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="border-b border-muted/40 pb-2!">
        <div className="pt-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {title ?? t('table.columns.status', { defaultValue: 'Status' })}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive
                ? (activeLabel ?? t('status.active', { defaultValue: 'Active' }))
                : (inactiveLabel ?? t('status.inactive', { defaultValue: 'Inactive' }))}
            </Badge>
          </div>
          {!readOnly ? (
            permissionEntity ? (
              <HasPermission entity={permissionEntity} action={permissionAction}>
                {switchEl}
              </HasPermission>
            ) : (
              switchEl
            )
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
