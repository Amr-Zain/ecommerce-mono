// src/components/pagesComponents/Settings/Faqs/index.tsx
import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { Faq } from '@/types/api/faq'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
  faqActions,
  faqColumns,
  getFaqFilters,
} from './Config'
import { faqQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

const Faqs = ({ data }: { data: ApiResponse<Faq> }) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/faqs/' })

  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const currentId = selected?.id || ''

  const { mutateAsync: changeActive, isPending: activePending } =
    useStatusMutation(
      currentId,
      'active',
      'faqs',
      faqQueryKeys.getFaq(currentId),
      [faqQueryKeys.all()],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'faqs',
      faqQueryKeys.getFaq(currentId),
      [faqQueryKeys.all()],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: Faq) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') await changeActive({ is_active: !row.is_active })
      else await changeDelete({})
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'faq', t)
    alert.setModel({
      isOpen: true,
      variant: type === 'delete' ? 'destructive' : 'default',
      title,
      desc,
      pending: activePending || deletePending,
      handleConfirm: handler,
    })
    alert.setHandler(handler)
  }

  const toolbar = (
    <HasPermission entity="faqs" action="store">
      <Link to="/faqs/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={data.data.items}
      columns={faqColumns(openAlert,t)}
      searchKey="search"
      filters={getFaqFilters(t)}
      pagination
      meta={data.data.meta!}
      actions={RowActions({
        actions: faqActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: (data.data.meta!.page ?? 1) - 1,
          pageSize: data.data.meta!.limit || 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default Faqs
