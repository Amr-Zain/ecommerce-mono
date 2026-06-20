import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ecommerce/ui/components/table'
import { Badge } from '@ecommerce/ui/components/badge'
import { Button } from '@ecommerce/ui/components/button'
import { ShopifyStoreDetails, ShopifyWebhook } from '@/types/api/shopify-store'
import { formatDate } from '@/util/helpers'
import useFetch from '@/hooks/UseFetch'
import { useMutate } from '@/hooks/UseMutate'
import { ApiResponse } from '@/types/api/http'
import { Skeleton } from '@ecommerce/ui/components/skeleton'
import {
    Store01Icon,
    Settings01Icon,
    WebhookIcon,
    Calendar01Icon,
    InformationCircleIcon,
    Shield01Icon,
    Activity01Icon,
    Link01Icon,
    Key01Icon,
    LockIcon,
    ReloadIcon,
    AlertCircleIcon,
    Globe02Icon,
    Download01Icon,
    Loading02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'
import { Separator } from '@ecommerce/ui/components/separator'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import ConfirmModal from '@/components/common/uiComponents/ConfirmModal'
import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/util/queryKeysFactory'
import { Link } from '@tanstack/react-router'
import { ShowHeader, ShowInfoCard, EmptyState } from '@/components/common/show'

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={icon} {...props} />
)
const Store = H(Store01Icon)
const Settings = H(Settings01Icon)
const Webhook = H(WebhookIcon)
const Calendar = H(Calendar01Icon)
const Info = H(InformationCircleIcon)
const ShieldCheck = H(Shield01Icon)
const Activity = H(Activity01Icon)
const ExternalLink = H(Link01Icon)
const Key = H(Key01Icon)
const Lock = H(LockIcon)
const RefreshCcw = H(ReloadIcon)
const AlertCircle = H(AlertCircleIcon)
const Globe = H(Globe02Icon)
const Download = H(Download01Icon)
const Loader2 = H(Loading02Icon)

interface InstallResponse {
    status: string
    message: string
    data: {
        auth_url: string
        state: string
        expires_in: number
        shop: string
        store_id: string
    }
}

export default function ShopifyStoreShow({ store }: { store: ShopifyStoreDetails }) {
    const { t } = useTranslation()
    const [showInstallConfirm, setShowInstallConfirm] = useState(false)

    const { mutateAsync: installStore, isPending: isInstalling } = useMutate<InstallResponse>({
        endpoint: `shopify-stores/${store.id}/install`,
        mutationKey: ['shopify-install', store.id],
        method: 'post',
        onSuccess: (data) => {
            if (data.data?.auth_url) {
                window.open(data.data.auth_url, '_blank')
            }
        },
        onError: () => {
            toast.error(t('shopifyStoreShow.install.error'))
        },
    })

    const { data: webhooksResponse, isLoading: webhooksLoading } = useFetch<ApiResponse<ShopifyWebhook[], 'webhooks'>>({
        endpoint: `shopify-stores/${store.id}/webhooks`,
        queryKey: ['shopify-webhooks', store.id],
        enabled: store.status === 'connected',
    })

    const webhooks = webhooksResponse?.data?.webhooks || []

    const normalizedScopes = Array.isArray(store.settings?.scopes)
        ? store.settings?.scopes
        : typeof store.settings?.scopes === 'string'
            ? store.settings.scopes.split(',').map(s => s.trim())
            : []

    const handleInstall = async () => {
        await installStore({} as any)
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Install Confirmation Modal */}
            <ConfirmModal
                title={t('shopifyStoreShow.install.confirmTitle')}
                desc={t('shopifyStoreShow.install.confirmDesc')}
                open={showInstallConfirm}
                setOpen={setShowInstallConfirm}
                onClick={handleInstall}
                Pending={isInstalling}
                variant="default"
            />

            <ShowHeader
                variant="plain"
                titleIcon={<Store className="h-8 w-8 text-primary" />}
                title={store.shop_domain}
                meta={
                    <span className="text-muted-foreground text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {t('shopifyStoreShow.subtitle')}
                    </span>
                }
                badges={[
                    { variant: store.status === 'connected' ? 'default' : 'outline', className: 'px-3 py-1 capitalize font-bold', children: t(`status.${store.status}`) },
                    { variant: store.is_active ? 'default' : 'secondary', className: 'px-3 py-1 capitalize font-bold', children: store.is_active ? t('status.active') : t('status.inactive') },
                ]}
                actions={
                    <>
                        {store.status !== 'connected' && (
                            <Button
                                onClick={() => setShowInstallConfirm(true)}
                                disabled={isInstalling}
                                className="gap-2"
                            >
                                {isInstalling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                {store.status === 'pending-reinstall' ? t('shopifyStoreShow.install.reinstall') : t('shopifyStoreShow.install.button')}
                            </Button>
                        )}
                        <Link to="/settings/shopify-stores/edit/$id" params={{ id: store.id }}>
                            <Button>
                                {t('actions.edit')}
                            </Button>
                        </Link>
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Settings Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 transition-all hover:border-primary/20">
                        <CardHeader className="bg-muted/30 pb-4 gap-0">
                            <div className="flex items-center gap-2 pt-4">
                                <Settings className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('shopifyStoreShow.settings.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Table>
                                <TableBody>
                                    <TableRow className="hover:bg-transparent border-none flex justify-between items-center">
                                        <TableCell className="w-48 text-muted-foreground flex items-center gap-2 py-3 shrink-0 whitespace-nowrap">
                                            <Key className="h-4 w-4 opacity-70" /> {t('Form.labels.client_id')}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] font-mono text-xs py-3" title={store.settings?.client_id || ''}>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="truncate">{store.settings?.client_id || '—'}</span>
                                                {store.settings?.client_id && <ButtonCopy content={store.settings.client_id} className="h-6 w-6" />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="hover:bg-transparent border-none flex justify-between items-center">
                                        <TableCell className="text-muted-foreground flex items-center gap-2 py-3 shrink-0">
                                            <Lock className="h-4 w-4 opacity-70" /> {t('Form.labels.client_secret')}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs py-3">
                                            {store.settings?.client_secret ? '••••••••••••••••' : '—'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="hover:bg-transparent border-none flex justify-between items-center">
                                        <TableCell className="text-muted-foreground flex items-center gap-2 py-3 shrink-0">
                                            <ExternalLink className="h-4 w-4 opacity-70" /> {t('Form.labels.redirect_uri')}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] font-medium py-3" title={store.settings?.redirect_uri || ''}>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="truncate">{store.settings?.redirect_uri || '—'}</span>
                                                {store.settings?.redirect_uri && <ButtonCopy content={store.settings.redirect_uri} className="h-6 w-6" />}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="hover:bg-transparent border-none flex justify-between items-center">
                                        <TableCell className="text-muted-foreground flex items-center gap-2 py-3 shrink-0">
                                            <RefreshCcw className="h-4 w-4 opacity-70" /> {t('Form.labels.state_ttl')}
                                        </TableCell>
                                        <TableCell className="font-medium py-3 text-right">
                                            {store.settings?.state_ttl ? `${store.settings.state_ttl}s` : '—'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="hover:bg-transparent border-none flex justify-between items-center">
                                        <TableCell className="text-muted-foreground flex items-center gap-2 py-3 shrink-0">
                                            <ShieldCheck className="h-4 w-4 opacity-70" /> {t('Form.labels.protected_customer_data_approved')}
                                        </TableCell>
                                        <TableCell className="py-3 text-right">
                                            <Badge variant={store.settings?.protected_customer_data_approved ? 'default' : 'secondary'}>
                                                {store.settings?.protected_customer_data_approved ? t('common.yes') : t('common.no')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Webhooks Section */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0 transition-all hover:border-primary/20">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center gap-2 pt-4">
                                <Webhook className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('shopifyStoreShow.webhooks.title')}</CardTitle>
                                <Badge variant="secondary" className="ms-auto font-bold">
                                    {webhooks.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 p-0">
                            {webhooksLoading ? (
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : webhooks.length > 0 ? (
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow>
                                            <TableHead className="px-6 h-10 text-[10px] uppercase tracking-wider font-bold">{t('shopifyStoreShow.webhooks.topic')}</TableHead>
                                            <TableHead className="h-10 text-[10px] uppercase tracking-wider font-bold">{t('shopifyStoreShow.webhooks.address')}</TableHead>
                                            <TableHead className="text-right px-6 h-10 text-[10px] uppercase tracking-wider font-bold">{t('shopifyStoreShow.webhooks.version')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {webhooks.map((webhook: ShopifyWebhook) => (
                                            <TableRow key={webhook.id} className="group hover:bg-muted/20">
                                                <TableCell className="px-6 py-4 font-bold flex items-center gap-2">
                                                    <span className="text-primary text-[11px] bg-primary/5 px-2 py-1 rounded-md border border-primary/10 transition-colors group-hover:bg-primary/10">
                                                        {webhook.topic}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-[11px] text-muted-foreground font-mono max-w-[200px] py-4" title={webhook.address}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate">{webhook.address}</span>
                                                        <ButtonCopy content={webhook.address} className="h-6 w-6 shrink-0" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6 py-4">
                                                    <Badge variant="outline" className="font-mono text-[10px] bg-background">{webhook.api_version}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <EmptyState
                                    icon={<Webhook className="h-10 w-10 opacity-10" />}
                                    message={t('shopifyStoreShow.webhooks.empty')}
                                    className="py-12"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* General Info Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all">
                        <CardHeader className="pb-2 border-b border-muted/40 bg-muted/5  gap-0">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Info className="h-3.5 w-3.5" /> {t('shopifyStoreShow.general.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-5">
                            <div className="space-y-1.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                                    {t('table.columns.provider')}
                                </p>
                                <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-muted/40">
                                    <Globe className="h-4 w-4 text-primary/70" />
                                    <span className="font-bold text-sm capitalize">{t(`status.${store.provider}`)}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                                    {t('table.columns.has_client_secret')}
                                </p>
                                <Badge variant={store.has_client_secret ? 'default' : 'destructive'} className="text-[10px]">
                                    {store.has_client_secret ? t('common.yes') : t('common.no')}
                                </Badge>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                                    {t('Form.labels.api_version')}
                                </p>
                                <p className="font-mono text-xs font-black bg-primary/5 text-primary px-2.5 py-1.5 rounded-md border border-primary/10 inline-block">
                                    {store.settings?.api_version || '—'}
                                </p>
                            </div>

                            <Separator className="opacity-40" />

                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                                    {t('Form.labels.scopes')}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {normalizedScopes.map((scope) => (
                                        <Badge key={scope} variant="secondary" className="text-[10px] font-mono leading-none py-1.5 px-2 bg-muted/50 hover:bg-muted border-none">
                                            {scope}
                                        </Badge>
                                    )) || '—'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline/Dates Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden hover:border-primary/20 transition-all">
                        <CardHeader className="pb-3 border-b border-muted/40 bg-muted/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" /> {t('shopifyStoreShow.dates.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-5">
                            {[
                                { label: t('table.columns.created_at'), value: store.created_at },
                                { label: t('table.columns.updated_at'), value: store.updated_at },
                                { label: t('table.columns.installed_at'), value: store.installed_at },
                                { label: t('table.columns.last_sync_at'), value: store.last_sync_at },
                            ].map((date, i, arr) => (
                                <div key={date.label} className="group/item">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60 tracking-wider">{date.label}</p>
                                        <p className="text-xs font-bold tabular-nums text-foreground/80 group-hover/item:text-primary transition-colors">
                                            {date.value ? formatDate(date.value) : '—'}
                                        </p>
                                    </div>
                                    {i < arr.length - 1 && <Separator className="mt-4 opacity-30" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Error Card */}
                    {store.last_error && (
                        <Card className="shadow-sm border-destructive/20 bg-destructive/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                            <CardHeader className="pb-3 border-b border-destructive/10 bg-destructive/10">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" /> {t('shopifyStoreShow.last_error')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-xs text-destructive leading-relaxed font-bold italic">{store.last_error}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
