import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/common/table/AppTable'
import { ApiResponseBase } from '@/types/api/http'
import { Meta } from '@/types/api/http'
import { ExchangeRequest } from '@/types/api/order'
import {
  exchangeColumns,
  getExchangeFilters,
} from './Config'

type ExchangeListResponse = ApiResponseBase<{ items: ExchangeRequest[]; meta?: Meta }>

const Exchanges = ({ data }: { data: ExchangeListResponse }) => {
  const { t } = useTranslation()

  return (
    <DataTable
      data={data.data.items ?? []}
      columns={exchangeColumns(t)}
      searchKey="search"
      filters={getExchangeFilters(t)}
      rowUrl={(row) => `/exchanges/show/${row.id}`}
      resizable
    />
  )
}

export default Exchanges
