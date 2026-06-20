import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/common/table/AppTable'
import { ApiResponseBase } from '@/types/api/http'
import { Meta } from '@/types/api/http'
import { ReturnRequest } from '@/types/api/order'
import { getReturnFilters, returnColumns } from './Config'

type ReturnListResponse = ApiResponseBase<{ items: ReturnRequest[]; meta?: Meta }>

const Returns = ({ data }: { data: ReturnListResponse }) => {
  const { t } = useTranslation()

  return (
    <DataTable
      data={data.data.items ?? []}
      columns={returnColumns(t)}
      searchKey="search"
      filters={getReturnFilters(t)}
      rowUrl={(row) => `/returns/show/${row.id}`}
      resizable
    />
  )
}

export default Returns
