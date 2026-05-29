import * as React from 'react'
import { CardFooter } from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge' // (kept only if you need elsewhere here)
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'

import { PageHeaderCard } from './PageHeaderCard'
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

  // dialogs
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
      {/* Header */}
      <PageHeaderCard
        id={id}
        created_at={created_at}
        image={image?.url}
        is_active={is_active}
        type={type}
        enTitle={en?.title ?? null}
        arTitle={ar?.title ?? null}
        editTo="/static-pages/edit/$id"
      />

      {/* Content blocks */}
      <LocalizedContentCard en={en} ar={ar} />

      {/* Additionals list & actions */}
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

      {/* View dialog */}
      <AdditionalViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        item={selected}
      />

      {/* Create/Edit dialog */}
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
