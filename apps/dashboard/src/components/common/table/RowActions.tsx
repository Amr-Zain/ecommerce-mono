import { MoreHorizontal } from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ecommerce/ui/components/dropdown-menu'
import { Link } from '@tanstack/react-router'
import * as React from 'react'
import { RowAction } from '@/types/components/table'
import { cn, hasPermission } from '@/lib/utils'

interface RowActionsOptions<RowData> {
  actions: RowAction<RowData>[]
  menuLabel?: string
}

export function RowActions<RowData>({
  actions,
  menuLabel = 'Actions',
}: RowActionsOptions<RowData>) {
  return function RenderActions(row: { original: RowData }) {
    const r = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Open menu"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-semibold border-b text-center dark:text-white text-black">{menuLabel}</DropdownMenuLabel>

            {actions
              .filter((a) => !(a.hidden?.(r) ?? false))
              .map((a, idx) => {
                const params =
                  typeof a.params === 'function' ? a.params(r) : a.params
                const to = typeof a.to === 'function' ? a.to(r) : a.to

                const hasActionPermission = a.permission && a.action
                  ? hasPermission(a.permission, a.action)
                  : true

                const isDisabled = (typeof a.disabled === 'function' ? a.disabled(r) : a.disabled) || !hasActionPermission

                const item = a.to ? (
                  <DropdownMenuItem
                    key={`${idx}-${a.label}`}
                    disabled={isDisabled ?? false}
                    className={cn(
                      'cursor-pointer justify-center',
                      a.danger ? 'text-red-600' : '',
                    )}
                  >
                    <Link
                      to={to!}
                      params={params as any}
                      preload="intent"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isDisabled) {
                          e.preventDefault()
                        }
                      }}
                    >
                      {typeof a.label === 'function' ? a.label(r) : a.label}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    key={`${idx}-${a.label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDisabled) a.onClick?.(r)
                    }}
                    disabled={isDisabled ?? false}
                    className={cn(
                      'cursor-pointer justify-center',
                      a.danger ? 'text-red-600' : '',
                    )}
                  >
                    {typeof a.label === 'function' ? a.label(r) : a.label}
                  </DropdownMenuItem>
                )

                return (
                  <React.Fragment key={`${idx}-${a.label}-wrap`}>
                    {a.dividerAbove && <DropdownMenuSeparator />}
                    {item}
                  </React.Fragment>
                )
              })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}
