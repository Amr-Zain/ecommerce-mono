import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { useTranslation } from 'react-i18next'
import { EmptyState } from './EmptyState'

export interface JsonCardProps {
  title?: React.ReactNode
  titleIcon?: React.ReactNode
  data: unknown
  /** Max height of the <pre> in Tailwind units; defaults to max-h-96 */
  maxHeightClassName?: string
  emptyText?: string
  /** Render the card with no shadow (nested usage) */
  flat?: boolean
  className?: string
  /** Pretty-print indentation; defaults to 2 */
  indent?: number
}

export function JsonCard({
  title,
  titleIcon,
  data,
  maxHeightClassName = 'max-h-96',
  emptyText,
  flat = false,
  className,
  indent = 2,
}: JsonCardProps) {
  const { t } = useTranslation()

  const isEmpty =
    data == null ||
    (typeof data === 'object' && Object.keys(data as object).length === 0)

  const json = React.useMemo(() => {
    if (isEmpty) return ''
    try {
      return JSON.stringify(data, null, indent)
    } catch {
      return String(data)
    }
  }, [data, isEmpty, indent])

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
      {title ? (
        <CardHeader className="border-b border-muted/40 bg-muted/30 pb-4">
          <div className="flex items-center gap-2 pt-4">
            {titleIcon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
      ) : null}
      <CardContent className="pt-4">
        {isEmpty ? (
          <EmptyState message={emptyText ?? t('common.no_data', { defaultValue: 'No data' })} />
        ) : (
          <pre
            className={[
              'text-xs font-mono bg-muted/20 p-4 rounded-lg overflow-auto',
              maxHeightClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {json}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}
