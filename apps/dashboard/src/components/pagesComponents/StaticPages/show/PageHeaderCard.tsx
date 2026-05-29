import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import { Button } from '@ecommerce/ui/components/button'
import { Edit } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

type PageHeaderCardProps = {
  id: number | string
  created_at: string
  image?: string | null
  is_active?: boolean
  type?: string
  enTitle?: string | null
  arTitle?: string | null
  editTo?: string // e.g. "/static-pages/edit/$id"
}

export function PageHeaderCard({
  id,
  created_at,
  image,
  is_active = true,
  type,
  enTitle,
  arTitle,
  editTo,
}: PageHeaderCardProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex justify-end p-4">
        {editTo ? (
          <HasPermission entity="static-pages" action="update">
            <Link to={editTo as any} params={{ id: String(id) } as any}>
              <Button variant="default">
                <Edit className="me-2 h-4 w-4" />
                {t('actions.update', { entity: t('common.page') })}
              </Button>
            </Link>
          </HasPermission>
        ) : null}
      </div>
    <Card>

      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={image}
              alt={enTitle || arTitle || 'Page'}
              className="h-16 w-16 rounded object-cover ring-1 ring-border"
            />
          ) : null}

          <div>
            <CardTitle className="flex items-center gap-2">
              {enTitle || '—'}
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">{arTitle || '—'}</span>
            </CardTitle>

            <CardDescription className="mt-1">
              {/* {t('table.columns.code')} #{id} • {t('table.createdAt')}{' '} */}
              {formatDate(created_at)}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant={is_active ? 'default' : 'secondary'}>
            {is_active ? t('status.active') : t('status.inactive')}
          </Badge>
          {type ? (
            <span className="text-xs text-muted-foreground">
              {t('menu.pages')} • {t(`staticPage.types.${type}`) || '—'}
            </span>
          ) : null}
        </div>
      </CardHeader>
    </Card>
    </>
  )
}
