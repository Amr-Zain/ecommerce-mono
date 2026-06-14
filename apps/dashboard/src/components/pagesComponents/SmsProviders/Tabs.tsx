import { useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ApiResponse, ApiResponseBase } from '@/types/api/http'

const SmsProvidersTabs = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const searchParams = useSearch({ from: '/_main/sms-providers/' }) as any
    const currentTab = searchParams.tab || 'providers'

    const { data: providersData, isPending: providersPending } = useFetch<ApiResponseBase<any[]>>({
        queryKey: queryKeys.smsProviders.all(),
        endpoint: 'sms-providers',
    })

    const { data: sessionsData, isPending: sessionsPending } = useFetch<ApiResponse<any>>({
        queryKey: queryKeys.smsSessions.filterd({ paginate: '1' }),
        endpoint: 'sms-sessions',
        params: { paginate: '1' },
    })

    const items: TabItem[] = [
        {
            value: 'providers',
            trigger: (
                <span className="flex items-center gap-2">
                    {t('menu.smsProviders')}
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums place-content-center">
                        {providersPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            providersData?.data?.length || 0
                        )}
                    </Badge>
                </span>
            ),
        },
        {
            value: 'sessions',
            trigger: (
                <span className="flex items-center gap-2">
                    {t('menu.smsSessions')}
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

export default SmsProvidersTabs
