import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useMutate } from '@/hooks/UseMutate'
import { useAlertModal } from '@/stores/useAlertModal'
import { ApiResponse } from '@/types/api/http'
import { Ticket } from '@/types/api/ticket'
import { queryKeys } from '@/util/queryKeysFactory'
import { getTicketFilters, ticketActions, ticketColumns } from './Config'

const Tickets = ({ data }: { data: ApiResponse<Ticket> }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/_main/tickets/' })
  const alert = useAlertModal()
  const [selected, setSelected] = useState<Ticket | null>(null)

  const { mutateAsync: deleteTicket, isPending } = useMutate({
    endpoint: selected ? `tickets/${selected.id}` : 'tickets',
    mutationKey: ['delete-ticket', selected?.id],
    method: 'delete',
    invalidates: [queryKeys.tickets.filterd(search)],
  })

  useEffect(() => {
    alert.setPending(isPending)
  }, [isPending])

  const onDelete = (row: Ticket) => {
    setSelected(row)
    const handler = async () => {
      await deleteTicket({})
      alert.setIsOpen(false)
    }
    alert.setModel({
      isOpen: true,
      variant: 'destructive',
      title: t('actions.delete'),
      desc: t('modals.delete.desc'),
      pending: isPending,
      handleConfirm: handler,
    })
    alert.setHandler(handler)
  }

  return (
    <DataTable
      apiResponse={data}
      columns={ticketColumns(t)}
      searchKey="search"
      filters={getTicketFilters(t)}
      pagination={!!data.data.meta}
      rowUrl={(row) => `/tickets/show/${row.id}`}
      actions={RowActions({
        actions: ticketActions(t, navigate, onDelete),
        menuLabel: t('actions.entity'),
      })}
      resizable
    />
  )
}

export default Tickets
