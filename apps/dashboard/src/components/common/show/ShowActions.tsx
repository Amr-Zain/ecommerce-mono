import * as React from 'react'
import { Button } from '@ecommerce/ui/components/button'
import { Link, type LinkProps, type RegisteredRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons'
import { HasPermission } from '@/components/common/HasPermission'
import type { PermissionAction } from '@/types/auth'

type RouterTo = LinkProps<RegisteredRouter>['to']

export interface ShowAction {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  onClick?: () => void
  disabled?: boolean
  /** Permission gate; if omitted the action is always rendered */
  permission?: { entity: string; action: PermissionAction }
  /** Render as a router Link instead of a button */
  linkTo?: RouterTo
  linkParams?: Record<string, string>
  className?: string
}

export interface ShowActionsProps {
  /** Permission entity used for the default edit + delete actions */
  entity?: string
  /** Optional explicit actions to render */
  actions?: ShowAction[]
  /** Default edit action config */
  editTo?: RouterTo
  editParams?: Record<string, string>
  editLabel?: React.ReactNode
  /** Default delete action */
  onDelete?: () => void
  deletePending?: boolean
  deleteLabel?: React.ReactNode
  /** Extra nodes rendered as-is (already permission-gated by caller) */
  extra?: React.ReactNode
  className?: string
}

export function ShowActions({
  entity,
  actions,
  editTo,
  editParams,
  editLabel,
  onDelete,
  deletePending,
  deleteLabel,
  extra,
  className,
}: ShowActionsProps) {
  const { t } = useTranslation()
  const nodes: React.ReactNode[] = []

  if (actions) {
    actions.forEach((a) => {
      const btn = (
        <Button
          key={a.key}
          variant={a.variant}
          size={a.size}
          onClick={a.onClick}
          disabled={a.disabled}
          className={a.className}
        >
          {a.icon}
          {a.label}
        </Button>
      )
      if (a.linkTo) {
        nodes.push(
          a.permission ? (
            <HasPermission key={a.key} entity={a.permission.entity} action={a.permission.action}>
              <Link to={a.linkTo} params={a.linkParams ?? ({} as any)}>
                {btn}
              </Link>
            </HasPermission>
          ) : (
            <Link key={a.key} to={a.linkTo} params={a.linkParams ?? ({} as any)}>
              {btn}
            </Link>
          ),
        )
      } else if (a.permission) {
        nodes.push(
          <HasPermission key={a.key} entity={a.permission.entity} action={a.permission.action}>
            {btn}
          </HasPermission>,
        )
      } else {
        nodes.push(btn)
      }
    })
  }

  if (editTo && entity) {
    nodes.push(
      <HasPermission key="edit" entity={entity} action="update">
        <Link to={editTo} params={editParams ?? ({} as any)}>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Edit01Icon} className="me-1 h-4 w-4" />
            {editLabel ?? t('actions.update')}
          </Button>
        </Link>
      </HasPermission>,
    )
  }

  if (onDelete && entity) {
    nodes.push(
      <HasPermission key="delete" entity={entity} action="delete">
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={deletePending}
        >
          <HugeiconsIcon icon={Delete01Icon} className="me-1 h-4 w-4" />
          {deleteLabel ?? t('actions.delete')}
        </Button>
      </HasPermission>,
    )
  }

  if (extra) nodes.push(<React.Fragment key="extra">{extra}</React.Fragment>)

  if (nodes.length === 0) return null

  return (
    <div className={['flex items-center gap-2 flex-wrap', className].filter(Boolean).join(' ')}>
      {nodes}
    </div>
  )
}
