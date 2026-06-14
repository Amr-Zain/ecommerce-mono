import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { Link, useSearch } from '@tanstack/react-router'
import { City } from '@/types/api/country'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { actions, cityColumns, getCityFilters } from './config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

const Cities = ({ data }: { data: ApiResponse<City[], 'cities'> }) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/settings/cities/' })

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
      'cities',
      queryKeys.cities.getCity(currentId),
      [queryKeys.cities.filterd(search)],
    )

  const { mutateAsync: ChangeDeleteMutate, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'cities',
      queryKeys.cities.getCity(currentId),
      [queryKeys.cities.filterd(search)],
    )

  // ✅ Sync the global alert's pending state
  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction , row: City) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })

    const handler = async () => {
      if (type === 'active') {
        await ChangeActiveMutate({ is_active: !row.is_active })
      } else {
        await ChangeDeleteMutate({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'city', t)
    
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
    <HasPermission action="store" entity="cities">
      <Link to="/settings/cities/add">
        <Button size="sm">{t('buttons.add') }</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={data.data.cities ?? []}
      columns={cityColumns(openAlert)}
      searchKey="search"
      filters={getCityFilters(t)}
      pagination
      actions={RowActions({
        actions: actions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={customToolbar}
      resizable
    />
  )
}

export default Cities
