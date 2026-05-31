import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useSearch, Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { sliderActions, sliderColumns, getSliderFilters } from './Config'
import { slidersQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

export type SliderEntity = {
  id: string
  title?: string
  sort_order?: number
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  created_at: string
  updated_at?: string
  slide?: {
    uuid: string
    path: string
    mime_type?: string
    type?: string
    original_name?: string
    is_main?: boolean
    collection?: string
  } | null
  en?: { id?: string; record_id?: string; title?: string }
  ar?: { id?: string; record_id?: string; title?: string }
}

const Sliders = ({
  data,
}: {
  data: ApiResponse<SliderEntity[]>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/sliders/' })
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
      'sliders',
      slidersQueryKeys.getSlider(currentId),
      [slidersQueryKeys.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'sliders',
      slidersQueryKeys.getSlider(currentId),
      [slidersQueryKeys.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: SliderEntity) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') {
        await changeActive({ is_active: !row.is_active })
      } else {
        await changeDelete({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'slider', t)
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
    <HasPermission entity="sliders" action="store">
      <Link to="/sliders/add">
        <Button>{t('buttons.add')}</Button>
      </Link>
    </HasPermission>
  )

  return (
    <DataTable
      data={data.data.items}
      columns={sliderColumns(openAlert,t)}
      searchKey="search"
      filters={getSliderFilters(t)}
      pagination
      meta={data.data.meta!}
      actions={RowActions({
        actions: sliderActions(t, openAlert),
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

export default Sliders
