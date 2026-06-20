import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import ButtonCopy from '@ecommerce/ui/components/copy-button'

export interface ShowInfoItem {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  copyable?: boolean
  html?: boolean
  /** Render value in a <pre> with whitespace-pre-wrap */
  pre?: boolean
  badge?: { variant?: React.ComponentProps<typeof Badge>['variant']; className?: string }
  className?: string
}

export interface ShowInfoCardProps {
  title?: React.ReactNode
  titleIcon?: React.ReactNode
  description?: React.ReactNode
  items?: ShowInfoItem[]
  asTable?: boolean
  separator?: boolean
  flat?: boolean
  className?: string
  contentClassName?: string
  headerClassName?: string
  children?: React.ReactNode
  headerExtra?: React.ReactNode
  microTitle?: boolean
}

export function ShowInfoCard({
  title,
  titleIcon,
  description,
  items,
  asTable = true,
  separator = false,
  flat = false,
  className,
  contentClassName,
  headerClassName,
  children,
  headerExtra,
  microTitle = false,
}: ShowInfoCardProps) {
  const hasHeader = title || description || titleIcon || headerExtra

  const renderItems = () => {
    if (!items || items.length === 0) return null
    if (asTable) {
      return (
        <div className="space-y-3 text-sm">
          {items.map((item, i) => (
            <div key={i}>
              <InfoRow item={item} />
              {separator && i < items.length - 1 ? (
                <Separator className="mt-3 opacity-40" />
              ) : null}
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={item.className}>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <InfoRow item={item} stacked />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card
      className={[
        'overflow-hidden pt-0',
        flat ? 'shadow-none' : 'shadow-sm border-muted/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {hasHeader ? (
        <CardHeader
          className={[
            'border-b border-muted/40 bg-muted/30',
            microTitle ? 'pb-2' : 'pb-4',
            headerClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="flex items-center gap-2 pt-4">
            {titleIcon}
            {title ? (
              microTitle ? (
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {title}
                </CardTitle>
              ) : (
                <CardTitle className="text-lg">{title}</CardTitle>
              )
            ) : null}
            {headerExtra ? <div className="ms-auto">{headerExtra}</div> : null}
          </div>
          {description ? (
            <CardDescription className={microTitle ? '' : 'mt-1.5'}>
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={['pt-4', contentClassName].filter(Boolean).join(' ')}>
        {renderItems()}
        {children}
      </CardContent>
    </Card>
  )
}

export function InfoRow({
  item,
  stacked = false,
}: {
  item: ShowInfoItem
  stacked?: boolean
}) {
  const { label, value, icon, copyable, html, pre, badge, className } = item

  if (stacked) {
    return (
      <div className={className}>
        {value != null && badge ? (
          <Badge variant={badge.variant} className={badge.className}>
            {value}
          </Badge>
        ) : pre ? (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm font-medium">
            {String(value ?? '—')}
          </pre>
        ) : html ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: String(value ?? '') }}
          />
        ) : (
          <p className="font-medium break-words">{value ?? '—'}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={[
        'flex items-center justify-between gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="flex items-center gap-1.5 max-w-[60%] text-end font-medium">
        {value != null && badge ? (
          <Badge variant={badge.variant} className={badge.className}>
            {value}
          </Badge>
        ) : pre ? (
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm text-start">
            {String(value ?? '—')}
          </pre>
        ) : html ? (
          <span
            className="prose prose-sm dark:prose-invert max-w-none text-sm text-start"
            dangerouslySetInnerHTML={{ __html: String(value ?? '') }}
          />
        ) : (
          <span className="break-words">{value ?? '—'}</span>
        )}
        {copyable && value ? <ButtonCopy content={String(value)} className="h-4 w-4" /> : null}
      </span>
    </div>
  )
}
