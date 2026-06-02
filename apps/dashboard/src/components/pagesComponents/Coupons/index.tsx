import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useSearch, Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useEffect, useState } from 'react'
import { couponActions, couponColumns, getCouponFilters } from './Config'
import { couponsQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Coupon } from '@/types/api/coupon'

const Coupons = ({ data }: { data: ApiResponse<Coupon[], 'coupons'> }) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/coupons/' })
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
      'coupons',
      couponsQueryKeys.getCoupon(currentId),
      [couponsQueryKeys.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'coupons',
      couponsQueryKeys.getCoupon(currentId),
      [couponsQueryKeys.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: Coupon) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') {
        await changeActive({ is_active: !row.is_active })
      } else {
        await changeDelete({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'coupon', t)
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
    <Link to="/coupons/add">
      <Button size="sm">{t('buttons.add')}</Button>
    </Link>
  )

  return (
    <DataTable
      data={data.data.coupons ?? []}
      columns={couponColumns(openAlert, t)}
      searchKey="search"
      filters={getCouponFilters(t)}
      pagination
      meta={data.data.meta}
      actions={RowActions({
        actions: couponActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: (data.data.meta?.current_page ?? 1) - 1,
          pageSize: data.data.meta?.per_page ?? 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default Coupons
