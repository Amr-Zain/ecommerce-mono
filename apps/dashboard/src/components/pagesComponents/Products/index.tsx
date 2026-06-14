import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useSearch, Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import {
  productActions,
  productColumns,
  getProductFilters,
} from './Config'
import { queryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Product } from '@/types/api/product'
import { HasPermission } from '@/components/common/HasPermission'
// import MultiSelectWithAvatars from '../Sliders/MultiSelectProducts'
// import { HasPermission } from '@/components/common/HasPermission'

export default function Products({
  data,
}: {
  data: ApiResponse<Product>
}) {
  const { t } = useTranslation()
  const alert = useAlertModal()
  //   const search = useSearch({ from: '/_main/products/' })
  const [selected, setSelected] = useState<{
    id: string
    type: PickedAction
    isActive?: boolean
  } | null>(null)

  const id = selected?.id || ''

  const { mutateAsync: toggleActive, isPending: pendingActive } =
    useStatusMutation(
      id,
      'active',
      'products',
      queryKeys.products.getProduct(id),
      [queryKeys.products.all()],
    )

  const { mutateAsync: deleteProduct, isPending: pendingDelete } =
    useStatusMutation(
      id,
      'delete',
      'products',
      queryKeys.products.getProduct(id),
      [queryKeys.products.all()],
    )

  useEffect(() => {
    alert.setPending(pendingActive || pendingDelete)
  }, [pendingActive, pendingDelete])

  const open = (type: PickedAction, row: Product) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') await toggleActive({ is_active: !row.is_active })
      else await deleteProduct({})
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'product', t)
    alert.setModel({
      isOpen: true,
      title,
      desc,
      pending: pendingActive || pendingDelete,
      handleConfirm: handler,
      variant: type === 'delete' ? 'destructive' : 'default',
    })
  }

  const toolbar = (
    <>
      <HasPermission entity="products" action="store">
        <Link to="/products/add">
          <Button size="sm">{t('buttons.add')}</Button>
        </Link>
      </HasPermission>
    </>
  )

  return (
    <DataTable
      apiResponse={data}
      columns={productColumns(open)}
      searchKey="search"
      rowUrl={(row) => `/products/show/${row.id}`}
      filters={getProductFilters(t)}
      pagination
      actions={RowActions({
        actions: productActions(t, open),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
    />
  )
}
