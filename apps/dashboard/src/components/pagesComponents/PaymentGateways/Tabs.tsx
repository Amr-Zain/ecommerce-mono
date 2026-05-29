import { useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { Tabs, TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import useFetch from '@/hooks/UseFetch'
import { paymentGatewaysQueryKeys, paymentSessionsQueryKeys } from '@/util/queryKeysFactory'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'

const PaymentGatewaysTabs = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    // @ts-ignore
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

    const tabs = [
        {
            name: t('menu.paymentGateways'),
            value: 'gateways',
            count: gatewaysPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                gatewaysData?.data?.length || 0
            ),
        },
        {
            name: t('menu.paymentSessions'),
            value: 'sessions',
            count: sessionsPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                sessionsData?.data?.meta?.total || 0
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
            <Tabs value={currentTab} onValueChange={handleTabChange} className="gap-4">
                <TabsList>
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex items-center gap-2 px-3"
                        >
                            {tab.name}
                            <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
                                {tab.count}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    )
}

export default PaymentGatewaysTabs
