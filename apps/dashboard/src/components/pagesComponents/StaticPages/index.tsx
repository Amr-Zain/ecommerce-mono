import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { Link, useSearch } from '@tanstack/react-router'
import { RowActions } from '@/components/common/table/RowActions'
import { useState, useEffect } from 'react'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import {
  staticPagesColumns,
  pageActions,
} from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { StaticPage } from '@/types/api/staticPages'
import { HasPermission } from '@/components/common/HasPermission'



const StaticPages = ({
  data,
}: {
  data: ApiResponse<StaticPage[], 'static_pages'>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()

  const rows = ((data as any).data?.static_pages || []) as StaticPage[]
  // const meta = (data as any).data?.meta
  const search = useSearch({ from: '/_main/static-pages/' })

  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const currentId = selected?.id || ''

  const { mutateAsync: ChangeActiveMutate, isPending: activePending } =
    useStatusMutation(
      currentId,
      'active',
      'static-pages',
      queryKeys.pages.getPage(currentId),
      [queryKeys.pages.filterd(search)],
    )

  const { mutateAsync: ChangeDeleteMutate, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'static-pages',
      queryKeys.pages.getPage(currentId),
      [queryKeys.pages.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: StaticPage) => {
    setSelected({ id: row.id.toString(), type, isActive: row.is_active })

    const handler = async () => {
      if (type === 'active') {
        await ChangeActiveMutate({ is_active: !row.is_active })
      } else {
        await ChangeDeleteMutate({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'page', t)

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

  const customToolbar = (
    <HasPermission entity="static-pages" action="store">
      <Link to="/static-pages/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={rows}
      columns={staticPagesColumns(openAlert, t)}
      searchKey="search"
      rowUrl={(row) => `/static-pages/show/${row.id}`}
      actions={RowActions({
        actions: pageActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={customToolbar}
      resizable
      pagination={false}
    />
  )
}

export default StaticPages
