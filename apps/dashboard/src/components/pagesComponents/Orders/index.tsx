import { DataTable } from '@/components/common/table/AppTable'
import { useTranslation } from 'react-i18next'
import { ApiResponseBase, Meta } from '@/types/api/http'
import { Order } from '@/types/api/order'
import { orderColumns, getOrderFilters } from './Config'

type OrderListResponse = ApiResponseBase<{ items: Order[]; meta?: Meta }>

const Orders = ({
  data,
}: {
  data: OrderListResponse
}) => {
  const { t } = useTranslation()

  return (
    <DataTable
      apiResponse={data}
      columns={orderColumns(t)}
      searchKey="search"
      filters={getOrderFilters(t)}
      pagination
      rowUrl={(row) => `/orders/show/${row.id}`}
      resizable
    />
  )
}

export default Orders
