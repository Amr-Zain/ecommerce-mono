import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { useSearch, Link } from '@tanstack/react-router'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { categoryActions, categoryColumns, getCategoryFilters } from './Config'
import { categoriesQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { getModalTitle } from '@/util/helpers'
import { Category } from '@/types/api/faq'
import TabsBadgeCategories from './Tabs'
import { HasPermission } from '@/components/common/HasPermission'

const Categories = ({
  data,
}: {
  data: ApiResponse<Category>
}) => {
  const { t } = useTranslation()
  const alert = useAlertModal()
  const search = useSearch({ from: '/_main/categories/' })
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
      'collections',
      categoriesQueryKeys.getCategory(currentId),
      [categoriesQueryKeys.filterd(search)],
    )

  const { mutateAsync: changeDelete, isPending: deletePending } =
    useStatusMutation(
      currentId,
      'delete',
      'collections',
      categoriesQueryKeys.getCategory(currentId),
      [categoriesQueryKeys.filterd(search)],
    )

  useEffect(() => {
    alert.setPending(activePending || deletePending)
  }, [activePending, deletePending])

  const openAlert = (type: PickedAction, row: Category) => {
    setSelected({ id: String(row.id), type, isActive: row.is_active })
    const handler = async () => {
      if (type === 'active') {
        await changeActive({ is_active: !row.is_active })
      } else {
        await changeDelete({})
      }
      alert.setIsOpen(false)
    }
    const { title, desc } = getModalTitle(type, 'category', t)
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
    <>
      <HasPermission entity="collections" action="store">
        <Link to="/categories/add">
          <Button size="sm">{t('buttons.add')}</Button>
        </Link>
      </HasPermission>
    </>
  )

  return (
    <DataTable
      data={data.data.items}
      columns={categoryColumns(openAlert)}
      searchKey="search"
      filters={getCategoryFilters(t)}
      pagination
      rowUrl={(row)=>`/categories/show/${row.id}`}
      meta={data.data.meta!}
      actions={RowActions({
        actions: categoryActions(t, openAlert),
        menuLabel: t('actions.entity'),
      })}
      toolbar={toolbar}
      initialState={{
        pagination: {
          pageIndex: (data.data?.meta!?.page ?? 1) - 1,
          pageSize: data.data?.meta!?.limit || 10,
        },
      }}
      resizable
      enableUrlState
    />
  )
}

export default Categories
