import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { Link, type LinkProps, type RegisteredRouter } from '@tanstack/react-router'

type RouterTo = LinkProps<RegisteredRouter>['to']

export interface EntityLinkCardProps {
  title: React.ReactNode
  titleIcon?: React.ReactNode
  to?: RouterTo
  params?: Record<string, string>
  /** Avatar image URL (variant='avatar') or cover image URL (variant='image') */
  image?: string | null
  /** Alt text / fallback initials */
  name?: React.ReactNode
  fallbackText?: string
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  variant?: 'avatar' | 'image'
  /** For variant='image': fixed height class, defaults to h-32 */
  imageHeightClassName?: string
  className?: string
  /** Render the card with no shadow (nested usage) */
  flat?: boolean
  /** When true, renders the body without a Link wrapper (static display) */
  static?: boolean
}

export function EntityLinkCard({
  title,
  titleIcon,
  to,
  params,
  image,
  name,
  fallbackText,
  subtitle,
  badge,
  variant = 'avatar',
  imageHeightClassName = 'h-32',
  className,
  flat = false,
  static: isStatic = false,
}: EntityLinkCardProps) {
  const fallback = fallbackText ?? (typeof name === 'string' ? name.substring(0, 2).toUpperCase() : '?')

  const body = (
    <>
      {variant === 'avatar' ? (
        <div className="flex flex-col items-center text-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
            {image ? <AvatarImage src={image} alt={String(name ?? '')} /> : null}
            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            {name ? <h3 className="text-lg font-bold">{name}</h3> : null}
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            {badge ? <div className="mt-1">{badge}</div> : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`relative ${imageHeightClassName} w-full rounded-2xl overflow-hidden border bg-muted/30`}>
            {image ? (
              <img
                src={image}
                alt={String(name ?? '')}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                {fallbackText ?? (
                  <span className="text-2xl font-black opacity-20">{fallback}</span>
                )}
              </div>
            )}
          </div>
          {name ? <h3 className="text-base font-bold line-clamp-2">{name}</h3> : null}
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          {badge ? <div>{badge}</div> : null}
        </div>
      )}
    </>
  )

  return (
    <Card
      className={[
        'overflow-hidden pt-0',
        flat ? 'shadow-none' : 'shadow-sm border-muted/60 hover:border-primary/30 transition-colors',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="pb-2 border-b border-muted/40">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          {titleIcon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {to && !isStatic ? (
          <Link
            to={to}
            params={params ?? ({} as any)}
            className="flex flex-col items-center text-center gap-4 hover:opacity-80 transition-opacity"
          >
            {body}
          </Link>
        ) : (
          body
        )}
      </CardContent>
    </Card>
  )
}
