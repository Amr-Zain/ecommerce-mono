import { Button } from '@ecommerce/ui/components/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DataTable } from '@/components/common/table/AppTable'
import { RowActions } from '@/components/common/table/RowActions'
import { ApiResponseBase } from '@/types/api/http'
import { MessageCampaign } from '@/types/api/message'
import { messageCampaignActions, messageCampaignColumns } from './Config'

export default function Messages({
  data,
}: {
  data: ApiResponseBase<MessageCampaign[]>
}) {
  const { t } = useTranslation()
  const rows = Array.isArray(data.data) ? data.data : []

  return (
    <DataTable
      data={rows}
      columns={messageCampaignColumns(t)}
      actions={RowActions({
        actions: messageCampaignActions(t),
        menuLabel: t('messages.entity'),
      })}
      toolbar={
        <Link to="/messages/send">
          <Button size="sm">{t('messages.send')}</Button>
        </Link>
      }
      resizable
    />
  )
}
