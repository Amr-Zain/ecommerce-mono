import { Button } from '@ecommerce/ui/components/button'
import { Link, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useAlertModal } from '@/stores/useAlertModal'
import { ApiResponseBase } from '@/types/api/http'
import { MessageTemplate } from '@/types/api/message'
import { getModalTitle } from '@/util/helpers'
import { queryKeys } from '@/util/queryKeysFactory'
import {
  getMessageTemplateFilters,
  messageTemplateActions,
  messageTemplateColumns,
} from './Config'

export default function MessageTemplates({
  data,
}: {
  data: ApiResponseBase<MessageTemplate[]>
}) {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/message-templates/' })
  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const currentId = selected?.id || ''
  const rows = Array.isArray(data.data) ? data.data : []

  const { mutateAsync: changeActive, isPending: activePending } =
    useStatusMutation(
      currentId,
      'active',
      'message-templates',
      queryKeys.messageTemplates.get(currentId),
      [queryKeys.messageTemplates.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'message-templates',
      queryKeys.messageTemplates.get(currentId),
      [queryKeys.messageTemplates.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: MessageTemplate) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') {
        await changeActive({ isActive: !row.is_active })
      } else {
        await changeDelete({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'messageTemplates.entity', t)
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

  return (
    <DataTable
      data={rows}
      columns={messageTemplateColumns(openAlert, t)}
      searchKey="search"
      filters={getMessageTemplateFilters(t)}
      actions={RowActions({
        actions: messageTemplateActions(t, openAlert),
        menuLabel: t('messageTemplates.entity'),
      })}
      toolbar={
        <Link to="/message-templates/add">
          <Button size="sm">{t('buttons.add')}</Button>
        </Link>
      }
      resizable
    />
  )
}
