import { useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import useFetch from '@/hooks/UseFetch'
import { paymentGatewaysQueryKeys, paymentSessionsQueryKeys } from '@/util/queryKeysFactory'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'

const PaymentGatewaysTabs = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const searchParams = useSearch({ from: '/_main/payment-gateways/' })
    const currentTab = (searchParams as any).tab || 'gateways'

    const { data: gatewaysData, isPending: gatewaysPending } = useFetch<ApiResponseBase<any[]>>({
        queryKey: paymentGatewaysQueryKeys.all(),
        endpoint: 'payment-gateways',
    })

    const { data: sessionsData, isPending: sessionsPending } = useFetch<ApiResponse<any>>({
        queryKey: paymentSessionsQueryKeys.filterd({ paginate: '1' }),
        endpoint: 'payment-sessions',
        params: { paginate: '1' },
    })

    const items: TabItem[] = [
        {
            value: 'gateways',
            trigger: (
                <span className="flex items-center gap-2">
                    {t('menu.paymentGateways')}
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
                        {gatewaysPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            gatewaysData?.data?.length || 0
                        )}
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
                        {sessionsPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            sessionsData?.data?.meta?.total || 0
                        )}
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
            <AnimatedTabs items={items} value={currentTab} onValueChange={handleTabChange} />
        </div>
    )
}

export default PaymentGatewaysTabs
