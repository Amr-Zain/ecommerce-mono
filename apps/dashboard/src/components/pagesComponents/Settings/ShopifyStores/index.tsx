import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { DataTable } from '@/components/common/table/AppTable'
import { Link, useSearch } from '@tanstack/react-router'
import { shopifyStoreColumns, getShopifyStoreFilters, shopifyStoreActions } from './Config'
import { RowActions } from '@/components/common/table/RowActions'
import { PickedAction, useStatusMutation } from '@/hooks/useStatusMutations'
import { useState, useEffect } from 'react'
import { shopifyStoresQueryKeys } from '@/util/queryKeysFactory'
import { useAlertModal } from '@/stores/useAlertModal'
import { ShopifyStore } from '@/types/api/shopify-store'
import { getModalTitle } from '@/util/helpers'
import { HasPermission } from '@/components/common/HasPermission'

type ShopifyStoresApi = ApiResponse<ShopifyStore[], 'shopify-stores'> | { data: ShopifyStore[] }

const ShopifyStores = ({ data }: { data: ShopifyStoresApi }) => {
    const { t } = useTranslation()
    const alert = useAlertModal()
    const search = useSearch({ from: '/_main/settings/shopify-stores/' })

    const rows = (
        Array.isArray((data as any).data?.['shopify-stores'])
            ? (data as any).data['shopify-stores']
            : (data as any).data
    ) as ShopifyStore[]

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
            'shopify-stores',
            shopifyStoresQueryKeys.getStore(currentId),
            [shopifyStoresQueryKeys.filterd(search)],
        )

    const { mutateAsync: ChangeDeleteMutate, isPending: deletePending } =
        useStatusMutation(
            currentId,
            'delete',
            'shopify-stores',
            shopifyStoresQueryKeys.getStore(currentId),
            [shopifyStoresQueryKeys.filterd(search)],
        )

    useEffect(() => {
        alert.setPending(activePending || deletePending)
    }, [activePending, deletePending])


    const openAlert = (type: PickedAction, row: ShopifyStore) => {
        setSelected({ id: String(row.id), type, isActive: row.is_active })

        const handler = async () => {
            if (type === 'active') {
                await ChangeActiveMutate({ is_active: !row.is_active })
            } else {
                await ChangeDeleteMutate({})
            }
            alert.setIsOpen(false)
        }
        const { title, desc } = getModalTitle(type, 'shopifyStore', t)

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
        <HasPermission action="store" entity="shopify-stores">
            <Link to="/settings/shopify-stores/add">
                <Button size="sm">{t('buttons.add')}</Button>
            </Link>
        </HasPermission>
    )

    return (
        <DataTable
            data={rows}
            columns={shopifyStoreColumns(t, openAlert)}
            searchKey="search"
            filters={getShopifyStoreFilters(t)}
            rowUrl={(row) => `/settings/shopify-stores/show/${row.id}`}
            pagination={false}
            meta={(data as any).data?.meta}
            initialState={{
                pagination: {
                    pageIndex: ((data as any).data?.meta?.current_page || 1) - 1,
                    pageSize: (data as any).data?.meta?.per_page || 10,
                },
            }}
            actions={RowActions({
                actions: shopifyStoreActions(t, openAlert),
                menuLabel: t('actions.entity'),
            })}
            toolbar={customToolbar}
            resizable
            enableUrlState
        />
    )
}

export default ShopifyStores
