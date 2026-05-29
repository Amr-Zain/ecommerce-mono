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
import { Product } from '@/types/api/product'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import { HasPermission } from '@/components/common/HasPermission'

type Props = {
  product: Product
}

export function ProductHeaderCard({ product }: Props) {
  const { t } = useTranslation()
  const enTitle = product.en?.name ?? product.name ?? '—'
  const arTitle = product.ar?.name ?? '—'

  return (<>
    <HasPermission entity="products" action="update">
      <div className="flex justify-end">
        <Link to={'/products/edit/$id'} params={{ id: String(product.id) }}>
          <Button size="sm" className="gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            {t('actions.update', { entity: t('common.product') })}
          </Button>
        </Link>
      </div>
    </HasPermission>
    <Card className='mt-4'>

      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {product.image ? (
            <img
              src={product.image.url}
              alt={enTitle || 'Product'}
              className="h-16 w-16 rounded object-cover ring-1 ring-border"
            />
          ) : null}

          <div>
            <CardTitle className="flex items-center gap-2">
              {enTitle}
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">{arTitle}</span>
            </CardTitle>

            <CardDescription className="mt-1">
              {t('table.columns.code')} #{product.id} • {t('table.createdAt')}{' '}
              {formatDate(product.created_at)} • SKU {product.sku}
            </CardDescription>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Badge variant={product.is_active ? 'default' : 'secondary'}>
              {product.is_active ? t('status.active') : t('status.inactive')}
            </Badge>
            {product.is_featured ? <Badge>{t('status.featured')}</Badge> : null}
            {product.discount && product.discount.value > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {product.discount.type === 'percentage'
                  ? `-${product.discount.value}%`
                  : `-${product.discount.value}`}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {t('menu.products')} • {product.collection?.name ?? '—'}
          </span>
          {product.shopify_id && <div className='flex items-center gap-1'>
            <div className='text-sm font-medium'>
              {t('userShow.shopify_id')}: {product.shopify_id || "unregistered"}
            </div>
            <ButtonCopy content={product.shopify_id || ''} className='h-6 w-6' />
          </div>}
        </div>
      </CardHeader>
    </Card>
  </>
  )
}
