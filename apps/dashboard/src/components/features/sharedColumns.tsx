import {
  ColumnDef,
  createColumnHelper,
  CellContext,
} from '@tanstack/react-table'
import { ColumnHeader } from '@/components/common/table/ColumnHeader'
import { Switch } from '@ecommerce/ui/components/switch'
import ImageWithPreview from '../common/uiComponents/image/ImagePreview'
import { PickedAction } from '@/hooks/useStatusMutations'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { cn, hasPermission } from '@/lib/utils'
import { Image } from '@/types/api/general'
import { Badge } from '@ecommerce/ui/components/badge'

export type WithId = { id: number | string }
export type WithActive = { is_active: boolean }
export type WithCreatedAt = { created_at: string }

const ch = <T,>() => createColumnHelper<T>()

// Small helper so we can call `useTranslation` properly.
const I18nHeader: React.FC<{ column: any; titleKey: string }> = ({
  column,
  titleKey,
}) => {
  const { t } = useTranslation()
  return (
    <ColumnHeader column={column} title={t(titleKey)} className=" text-start" />
  )
}

/** Helper to build a consistent meta object */
const makeMeta = (args: {
  titleKey: string
  label?: string
  accessorKey?: string
  id?: string
  sortable?: boolean
  className?: string
}) => ({
  labelKey: args.titleKey,
  // Plain fallback label; you can translate in the dropdown using labelKey if you want.
  label: args.label ?? args.titleKey,
  accessorKey: args.accessorKey,
  id: args.id,
  sortable: !!args.sortable,
  className: args.className,
})

export function textColumn<T>(
  key: keyof T & string,
  titleKey: string,
  opts?: {
    sortable?: boolean
    render?: (ctx: CellContext<T, any>) => React.ReactNode
    className?: string,
  },
): ColumnDef<T> {
  return ch<T>().accessor(key as any, {
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: (ctx) =>
      opts?.render ? (
        opts.render(ctx)
      ) : (
        <div
          className={cn('text-muted-foreground line-clamp-1', opts?.className)}
        >
          {String(ctx.getValue() ?? '-')}
        </div>
      ),
    enableSorting: !!opts?.sortable,
    meta: makeMeta({
      titleKey,
      accessorKey: String(key),
      sortable: opts?.sortable,
      className: opts?.className,
    }),
  })
}
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ecommerce/ui/components/popover'
import { Eye } from 'lucide-react'

export function textDesc<T>(
  key: keyof T & string,
  titleKey: string,
  opts?: {
    sortable?: boolean
    render?: (ctx: CellContext<T, any>) => React.ReactNode
    className?: string,
  },
): ColumnDef<T> {
  return ch<T>().accessor(key as any, {
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: (ctx) =>
      opts?.render ? (
        opts.render(ctx)
      ) : (
        String(ctx.getValue() ?? '-').length > 50 ? (
          <Popover>
            <PopoverTrigger onClick={(e) => e.stopPropagation()} className='cursor-pointer'>
              <div
                className={cn('text-muted-foreground line-clamp-1', opts?.className)}
              >
                <Eye className='size-4' />
              </div>
            </PopoverTrigger>
            <PopoverContent className="data-[state=open]:!zoom-in-0 data-[state=closed]:!zoom-out-0 origin-center duration-400 max-h-[50vh] overflow-y-auto">
              <div
                className={opts?.className}
                dangerouslySetInnerHTML={{ __html: String(ctx.getValue() ?? '-') }}
              />
            </PopoverContent>
          </Popover>

        ) : (
          <div
            className={cn('text-muted-foreground line-clamp-1', opts?.className)}
            dangerouslySetInnerHTML={{ __html: String(ctx.getValue() ?? '-') }}
          />
        )
      ),
    enableSorting: !!opts?.sortable,
    meta: makeMeta({
      titleKey,
      accessorKey: String(key),
      sortable: opts?.sortable,
      className: opts?.className,
    }),
  })
}

export function imageColumn<T>(
  key: keyof T & string,
  titleKey: string, // i18n key
  opts?: {
    sortable?: boolean
    render?: (ctx: CellContext<T, any>) => React.ReactNode
  },
): ColumnDef<T> {
  return ch<T>().accessor(key as any, {
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: (ctx) =>
      opts?.render ? (
        opts.render(ctx)
      ) : (
        <ImageWithPreview
          src={String((ctx.getValue() as any)?.path! ?? ctx.getValue())}
          alt="page"
          className="size-12 rounded-full border border-border"
        />
      ),
    enableSorting: !!opts?.sortable,
    meta: makeMeta({
      titleKey,
      accessorKey: String(key),
      sortable: opts?.sortable,
    }),
  })
}

export function imageNameColumn<T>(
  accessor: (
    row: T,
  ) => { image?: string | null; name?: string | null } | null | undefined,
  titleKey: string,
  opts?: {
    id?: string
    sortable?: boolean
    placeholder?: string
    renderName?: (
      ctx: CellContext<T, any>,
      name: string | null | undefined,
    ) => React.ReactNode
    renderImage?: (
      ctx: CellContext<T, any>,
      image: Image | null | undefined,
      name: string | null | undefined,
    ) => React.ReactNode
  },
): ColumnDef<T> {
  const id = opts?.id ?? titleKey
  return ch<T>().display({
    id,
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: (ctx) => {
      const row = ctx.row.original as T
      const value = accessor(row) ?? null
      const name = value?.name ?? null
      const image = value?.image ?? null

      if (!name && !image) {
        return (
          <span className="text-muted-foreground">
            {opts?.placeholder ?? '-'}
          </span>
        )
      }

      return (
        <div className="flex items-center gap-3">
          {opts?.renderImage ? (
            opts.renderImage(ctx, image as any, name)
          ) : image ? (
            <ImageWithPreview
              src={(image as any)?.path ?? (image as any)?.url}
              alt={String(name ?? '')}
              className="size-12 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="size-10 rounded-md border border-dashed border-border" />
          )}

          <span className="font-medium truncate max-w-[200px]">
            {opts?.renderName
              ? opts.renderName(ctx, name)
              : (name ?? opts?.placeholder ?? '-')}
          </span>
        </div>
      )
    },
    enableSorting: !!opts?.sortable,
    meta: makeMeta({
      titleKey,
      id,
      sortable: opts?.sortable,
    }),
  })
}



export function booleanControlColumn<T extends Record<string, any>>(
  key: keyof T,
  titleKey: string, // i18n key
  open: (type: PickedAction, row: T) => void,
  actionType: PickedAction,
  hidePanner: boolean = false,
  permission?: string,
): ColumnDef<T> {
  const accessorKey = String(key)
  return {
    accessorKey,
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: ({ row, getValue }) => {
      const cellVal = getValue() as any
      // 1) If the cell value is an object and contains the nested flag (actionType), use that.
      // 2) If the cell value itself is boolean, use it.
      // 3) Fallbacks: try row.original[actionType] or row.original[key].
      let value: boolean
      const { t } = useTranslation()
      if (cellVal && typeof cellVal === 'object' && actionType in cellVal) {
        value = Boolean(cellVal[actionType])
      } else if (typeof cellVal === 'boolean') {
        value = cellVal
      } else if (row?.original && actionType in (row.original as any)) {
        value = Boolean((row.original as any)[actionType])
      } else if (row?.original && accessorKey in (row.original as any)) {
        value = Boolean((row.original as any)[accessorKey])
      } else {
        value = false
      }

      const canUpdate = permission ? hasPermission(permission, 'update') : true

      if (!canUpdate) {
        return (
          <div className="flex items-center gap-2 max-w-fit">
            <Badge variant={value ? 'default' : 'destructive'}>
              <div>
                {value ? t('status.enabled') : t('status.disabled')}
              </div>
            </Badge>
          </div>
        )
      }

      return (
        <div
          className="flex items-center gap-2 cursor-pointer max-w-fit"
          title={
            value
              ? t('Form.messages.click_to_disable')
              : t('Form.messages.click_to_enable')
          }
          onClick={(e) => {
            e.stopPropagation()
            open(actionType, row.original)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              open(actionType, row.original)
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium w-14">
            <Switch checked={value} className='scale-110 cursor-pointer' />
          </div>
          {
            !hidePanner && (

              <Badge variant={value ? 'default' : 'destructive'}>
                <div>
                  {value ? t('status.enabled') : t('status.disabled')}
                </div>
              </Badge>
              // </span>
            )}
        </div>
      )
    },
    enableSorting: false,
    meta: makeMeta({
      titleKey,
      accessorKey,
      sortable: false,
      id: accessorKey,
    }),
  }
}

function DateCell({ value }: { value: unknown }) {
  const { t, i18n } = useTranslation()

  const raw = (value as string) ?? ''
  const date = new Date(raw)

  if (isNaN(date.getTime())) {
    return (
      <div className="text-sm space-y-1">
        <div>{t('table.date.unknown', '-')}</div>
        <div className="text-xs text-muted-foreground" />
      </div>
    )
  }

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const todayStart = startOfDay(new Date())
  const dateStart = startOfDay(date)

  const msPerDay = 24 * 60 * 60 * 1000
  // Floor the difference in calendar days; clamp future to 0 => "today"
  const diffDays =
    Math.floor((todayStart.getTime() - dateStart.getTime()) / msPerDay)


  // Format the calendar date in the active language/locale
  const locale = i18n.language || undefined
  const dateStr = new Intl.DateTimeFormat(locale).format(date)
  return (
    <div className="text-sm space-y-1">
      <div>{dateStr}</div>
      <div className="text-xs text-muted-foreground">
        {diffDays < 0
          ? t('time.days_left', { count: Math.abs(diffDays) })
          : t('time.daysAgo', { count: diffDays })}
      </div>
    </div>
  )
}

export function createdAtColumn<T extends WithCreatedAt>(
  titleKey = 'table.createdAt',
): ColumnDef<T> {
  return ch<T>().accessor('created_at' as any, {
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: ({ getValue }) => <DateCell value={getValue()} />,
    enableSorting: true,
    sortingFn: 'datetime',
    meta: makeMeta({
      titleKey,
      accessorKey: 'created_at',
      sortable: true,
    }),
  })
}

export function DateColumn<T extends WithCreatedAt>(
  key: keyof T & string,
  titleKey = 'table.createdAt',
): ColumnDef<T> {
  return ch<T>().accessor(key as any, {
    header: ({ column }) => <I18nHeader column={column} titleKey={titleKey} />,
    cell: ({ getValue }) => <DateCell value={getValue()} />,
    enableSorting: true,
    sortingFn: 'datetime',
    meta: makeMeta({
      titleKey,
      accessorKey: String(key),
      sortable: true,
    }),
  })
}
