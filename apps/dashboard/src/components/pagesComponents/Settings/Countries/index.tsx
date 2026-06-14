import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { Link, useSearch } from '@tanstack/react-router'
import { countryColumns, getCountryFilters, countryActions } from './Config'
import { RowActions } from '@/components/common/table/RowActions'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { CountryDetails } from '@/types/api/country'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

type CountriesApi = ApiResponse<CountryDetails> | { data: CountryDetails[] }

const Countries = ({ data }: { data: CountriesApi }) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/settings/countries/' })

  const rows = (
    Array.isArray((data as any).data?.items)
      ? (data as any).data.items
      : (data as any).data
  ) as CountryDetails[]

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
      'countries',
      queryKeys.countries.getCountry(currentId),
      [queryKeys.countries.filterd(search)],
    )

  const { mutateAsync: ChangeDeleteMutate, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'countries',
      queryKeys.countries.getCountry(currentId),
      [queryKeys.countries.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])


  const openAlert = (type: PickedAction, row: CountryDetails) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })

    const handler = async () => {
      if (type === 'active') {
        await ChangeActiveMutate({ is_active: !row.is_active })
      } else {
        await ChangeDeleteMutate({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'country', t)
    
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
    <HasPermission action="store" entity="countries">
      <Link to="/settings/countries/add">
        <Button size="sm">{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )
  console.log(data)

  return (
    <DataTable
      data={rows}
      columns={countryColumns(openAlert)}
      searchKey="search"
      filters={getCountryFilters(t)}
      rowUrl={(row) => `/settings/countries/show/${row.id}`}
      pagination
      actions={RowActions({
        actions: countryActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={customToolbar}
      resizable
    />
  )
}

export default Countries
