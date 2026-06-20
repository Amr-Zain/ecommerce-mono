import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'

export type ShowHeaderVariant = 'plain' | 'card'

export interface ShowHeaderBadge {
  variant?: React.ComponentProps<typeof Badge>['variant']
  className?: string
  children: React.ReactNode
}

export interface ShowHeaderMetaItem {
  icon?: React.ReactNode
  label?: string
  value?: React.ReactNode
}

export interface ShowHeaderProps {
  variant?: ShowHeaderVariant
  icon?: React.ReactNode
  image?: { src: string; alt?: string } | null
  /** Custom leading visual (overrides `image`/`icon`); e.g. <ImageWithPreview/> */
  imageNode?: React.ReactNode
  avatarFallbackText?: string
  title: React.ReactNode
  secondaryTitle?: React.ReactNode
  titleIcon?: React.ReactNode
  id?: string | number
  createdAt?: string
  meta?: React.ReactNode
  metaItems?: ShowHeaderMetaItem[]
  badges?: ShowHeaderBadge[]
  actions?: React.ReactNode
  className?: string
  editAction?: React.ReactNode
  /** When provided, rendered above the header (e.g. permission-gated edit button row) */
  preHeader?: React.ReactNode
}

export function ShowHeader({
  variant = 'plain',
  icon,
  image,
  imageNode,
  avatarFallbackText,
  title,
  secondaryTitle,
  titleIcon,
  id,
  createdAt,
  meta,
  metaItems,
  badges,
  actions,
  className,
  preHeader,
}: ShowHeaderProps) {
  const { t } = useTranslation()

  const leadingVisual = imageNode
    ? imageNode
    : image ? (
    image.src ? (
      variant === 'card' ? (
        <img
          src={image.src}
          alt={image.alt ?? ''}
          className="h-16 w-16 rounded object-cover ring-1 ring-border"
        />
      ) : (
        <Avatar className="h-16 w-16 rounded-xl border shadow-sm">
          <AvatarImage src={image.src} alt={image.alt ?? ''} />
          {avatarFallbackText ? (
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
              {avatarFallbackText}
            </AvatarFallback>
          ) : null}
        </Avatar>
      )
    ) : null
  ) : icon ? (
    variant === 'card' ? (
      <span className="text-primary">{icon}</span>
    ) : (
      <span className="h-16 w-16 rounded-xl border shadow-sm bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </span>
    )
  ) : null

  const headerInner = (
    <CardHeader className="flex flex-row items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        {leadingVisual}
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            {titleIcon}
            {title}
            {secondaryTitle ? (
              <>
                <Separator orientation="vertical" className={variant === 'card' ? 'h-5' : 'h-6'} />
                <span className="text-muted-foreground font-medium">
                  {secondaryTitle}
                </span>
              </>
            ) : null}
          </CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {id != null ? (
              <span>
                {t('table.columns.code', { defaultValue: 'ID' })} #{id}
              </span>
            ) : null}
            {createdAt ? (
              <span className="flex items-center gap-1.5">
                {id != null ? <span aria-hidden>•</span> : null}
                {t('table.createdAt', { defaultValue: 'Created At' })}{' '}
                {formatDate(createdAt)}
              </span>
            ) : null}
            {metaItems?.map((m, i) => (
              <React.Fragment key={i}>
                <span aria-hidden>•</span>
                <span className="flex items-center gap-1.5">
                  {m.icon}
                  {m.label ? <span>{m.label}</span> : null}
                  {m.value != null ? <span>{m.value}</span> : null}
                </span>
              </React.Fragment>
            ))}
            {meta}
          </CardDescription>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {badges.map((b, i) => (
              <Badge key={i} variant={b.variant} className={b.className}>
                {b.children}
              </Badge>
            ))}
          </div>
        ) : null}
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </CardHeader>
  )

  if (variant === 'plain') {
    return (
      <div className={className}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {leadingVisual}
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                {titleIcon}
                {title}
                {secondaryTitle ? (
                  <span className="text-muted-foreground text-lg font-medium">
                    {secondaryTitle}
                  </span>
                ) : null}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {id != null ? (
                  <span className="flex items-center gap-1">#{id}</span>
                ) : null}
                {createdAt ? (
                  <span className="flex items-center gap-1.5">
                    {id != null ? <span aria-hidden>•</span> : null}
                    {formatDate(createdAt)}
                  </span>
                ) : null}
                {metaItems?.map((m, i) => (
                  <React.Fragment key={i}>
                    <span aria-hidden>•</span>
                    <span className="flex items-center gap-1.5">
                      {m.icon}
                      {m.label ? <span>{m.label}</span> : null}
                      {m.value != null ? <span>{m.value}</span> : null}
                    </span>
                  </React.Fragment>
                ))}
                {meta}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {badges && badges.length > 0
              ? badges.map((b, i) => (
                  <Badge key={i} variant={b.variant} className={b.className}>
                    {b.children}
                  </Badge>
                ))
              : null}
            {actions}
          </div>
        </div>
        {preHeader}
      </div>
    )
  }

  return (
    <div className={className}>
      {preHeader}
      <Card>{headerInner}</Card>
    </div>
  )
}
