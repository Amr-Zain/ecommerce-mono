import { useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { unwrapList } from './response'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import type { ApiResponse, ApiResponseBase } from '@/types/api/http'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'

const PaymentGatewaysTabs = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const searchParams = useSearch({ from: '/_main/payment-gateways/' })
  const currentTab = (searchParams as any).tab || 'gateways'

  const { data: gatewaysData } = useFetch<ApiResponseBase<Array<any>>>({
    queryKey: queryKeys.paymentGateways.all(),
    endpoint: 'payment-gateways',
  })

  const { data: sessionsData } = useFetch<ApiResponse<any>>({
    queryKey: queryKeys.paymentSessions.filterd({ paginate: '1' }),
    endpoint: 'payment-sessions',
    params: { paginate: '1' },
  })
  const gatewayCount = unwrapList(gatewaysData).items.length
  const sessionCount =
    unwrapList(sessionsData, 'payment_sessions').meta?.total ?? 0

  const items: Array<TabItem> = [
    {
      value: 'gateways',
      trigger: (
        <span className="flex items-center gap-2">
          {t('menu.paymentGateways')}
          <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
            {gatewayCount}
          </Badge>
        </span>
      ),
    },
    {
      value: 'sessions',
      trigger: (
        <span className="flex items-center gap-2">
          {t('menu.paymentSessions')}
          <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
            {sessionCount}
          </Badge>
        </span>
      ),
    },
  ]

  const handleTabChange = (value: string) => {
    navigate({
      to: '.',
      search: (prev: any) => ({
        ...prev,
        tab: value,
      }),
    })
  }

  return (
    <div className="w-full max-w-md mb-4">
      <AnimatedTabs
        items={items}
        value={currentTab}
        onValueChange={handleTabChange}
      />
    </div>
  )
}

export default PaymentGatewaysTabs
