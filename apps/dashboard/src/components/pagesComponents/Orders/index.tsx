import { DataTable } from '@/components/common/table/AppTable'
import { useTranslation } from 'react-i18next'
import { ApiResponse } from '@/types/api/http'
import { Order } from '@/types/api/order'
import { orderColumns, getOrderFilters } from './Config'

const Orders = ({
    data,
}: {
    data: ApiResponse<{
        orders: Order[]
        meta: any
    }, 'orders'>
}) => {
    const { t } = useTranslation()

    return (
        <DataTable
            data={data.data.orders as unknown as Order[]}
            columns={orderColumns(t)}
            searchKey="search"
            filters={getOrderFilters(t)}
            pagination={!!data.data.meta}
            meta={data.data.meta}
            rowUrl={(row) => `/orders/show/${row.id}`}
            initialState={{
                pagination: {
                    pageIndex: data.data.meta?.current_page ? data.data.meta.current_page - 1 : 0,
                    pageSize: data.data.meta?.per_page || 10,
                },
            }}
            resizable
            enableUrlState
        />
    )
}

export default Orders

