import * as React from 'react'
import { CardFooter } from '@ecommerce/ui/components/card'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'
import { HugeiconsIcon } from '@hugeicons/react'
import { Edit01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@ecommerce/ui/components/button'
import { Link } from '@tanstack/react-router'
import { HasPermission } from '@/components/common/HasPermission'
import { ShowHeader } from '@/components/common/show'

import { LocalizedContentCard } from './LocalizedContentCard'

import { AdditionalViewDialog } from './AdditionalViewDialog'
import { AdditionalFormDialog } from './AdditionalFormDialog'

import type { StaticPage, AdditionalPage } from '@/types/api/staticPages'
import { AdditionalsCard } from './AdditionalsCard'

export function StaticPageShow({ page }: { page: StaticPage }) {
  const { t } = useTranslation()

  const {
    id,
    type,
    image,
    is_active,
    created_at,
    en = {},
    ar = {},
    additionals = [],
  } = page

  const [viewOpen, setViewOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<AdditionalPage | null>(null)

  const openCreate = React.useCallback(() => {
    setSelected(null)
    setFormOpen(true)
  }, [])

  const openEdit = React.useCallback((item: AdditionalPage) => {
    setSelected(item)
    setFormOpen(true)
  }, [])

  const openView = React.useCallback((item: AdditionalPage) => {
    setSelected(item)
    setViewOpen(true)
  }, [])

  const handleFormDone = React.useCallback(() => {
    setFormOpen(false)
    setSelected(null)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ShowHeader
        variant="card"
        image={image?.url ? { src: image.url, alt: en?.title ?? ar?.title ?? 'Page' } : null}
        title={en?.title ?? '—'}
        secondaryTitle={ar?.title ?? '—'}
        id={id}
        createdAt={created_at}
        badges={[
          { variant: is_active ? 'default' : 'secondary', children: is_active ? t('status.active') : t('status.inactive') },
          ...(type ? [{
            className: 'text-xs text-muted-foreground',
            children: `${t('menu.pages')} • ${t(`staticPage.types.${type}`) || '—'}`,
          } as any] : []),
        ]}
        preHeader={
          <HasPermission entity="static-pages" action="update">
            <div className="flex justify-end p-4">
              <Link to="/static-pages/edit/$id" params={{ id: String(id) } as any}>
                <Button variant="default">
                  <HugeiconsIcon icon={Edit01Icon} className="me-2 h-4 w-4" />
                  {t('actions.update', { entity: t('common.page') })}
                </Button>
              </Link>
            </div>
          </HasPermission>
        }
      />

      <LocalizedContentCard en={en} ar={ar} />

      <AdditionalsCard
        staticPageId={id}
        items={additionals}
        onCreate={openCreate}
        onEdit={openEdit}
        onView={openView}
      />

      <CardFooter className="flex items-center justify-end text-sm text-muted-foreground">
        {t('table.updatedAt')}: &nbsp; {formatDate(created_at)}
      </CardFooter>

      <AdditionalViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        item={selected}
      />

      <AdditionalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        selected={selected}
        static_page_id={id}
        onDone={handleFormDone}
      />
    </div>
  )
}

export default StaticPageShow
