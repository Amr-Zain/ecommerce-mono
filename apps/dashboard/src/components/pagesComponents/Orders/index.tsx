import { DataTable } from '@/components/common/table/AppTable'
import { useTranslation } from 'react-i18next'
import { ApiResponse, Meta } from '@/types/api/http'
import { Order } from '@/types/api/order'
import { orderColumns, getOrderFilters } from './Config'

const Orders = ({
  data,
}: {
  data: ApiResponse<
    {
      orders: Order[]
      meta: Meta
    },
    'orders'
  >
}) => {
  const { t } = useTranslation()

  return (
    <DataTable
      data={data.data.orders as unknown as Order[]}
      columns={orderColumns(t)}
      searchKey="search"
      filters={getOrderFilters(t)}
      pagination={!!data.data.meta}
      rowUrl={(row) => `/orders/show/${row.id}`}
      resizable
    />
  )
}

export default Orders
