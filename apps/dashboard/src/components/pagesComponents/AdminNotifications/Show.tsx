import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import {
    Bell,
    User,
    Users,
    Calendar,
    Globe,
    Mail,
    CheckCircle2,
    XCircle,
    Hash,
    Send,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { Button } from '@ecommerce/ui/components/button'
import { AdminNotificationDetail } from './Config'
import useFetch from '@/hooks/UseFetch'
import { adminNotificationsQueryKeys } from '@/util/queryKeysFactory'
import { ApiResponseBase } from '@/types/api/http'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Skeleton } from '@ecommerce/ui/components/skeleton'

interface AdminNotificationShowProps {
    notification: AdminNotificationDetail
}

export default function AdminNotificationShow({ notification }: AdminNotificationShowProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir(i18n.language) === 'rtl'
    const lang = isRTL ? 'ar' : 'en'

    const [page, setPage] = useState(1)
    const endpoint = `admin-notifications/${notification.id}`

    const { data: pageData, isFetching } = useFetch<ApiResponseBase<AdminNotificationDetail>>({
        queryKey: [...adminNotificationsQueryKeys.get(notification.id), 'receivers', page],
        endpoint,
        params: { page },
        suspense: false,
        enabled: page > 1,
    })

    // Use fetched data for pages > 1, fall back to the prop (which has page 1)
    const displayNotification = (page > 1 && pageData?.data) ? pageData.data : notification
    const receivers = displayNotification.receivers
    const lastPage = receivers?.last_page ?? 1

    const titleContent = notification.content?.[lang]?.title || notification.content?.en?.title || '—'
    const bodyContent = notification.content?.[lang]?.body || notification.content?.en?.body || '—'
    const arTitle = notification.content?.ar?.title
    const arBody = notification.content?.ar?.body
    const enTitle = notification.content?.en?.title
    const enBody = notification.content?.en?.body

    const getUserLink = (receiver: any) => {
        const type = receiver.user_type?.toLowerCase()
        if (type === 'client' || type === 'user') {
            return { to: '/users/show/$id' as const, params: { id: String(receiver.user_id) } }
        }
        if (type === 'admin' || type === 'supervisor') {
            return { to: '/supervisors/edit/$id' as const, params: { id: String(receiver.user_id) } }
        }
        return null
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        {t('admin_notifications.entity')} #{notification.id}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{notification.created_at}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="capitalize font-medium px-3 py-1 text-sm">
                        <Globe className="h-3.5 w-3.5 me-1.5" />
                        {t(`admin_notifications.${notification.type}`) || notification.type}
                    </Badge>
                    <Badge
                        variant={notification.is_sent ? 'default' : 'secondary'}
                        className="font-bold px-3 py-1 text-sm"
                    >
                        {notification.is_sent ? (
                            <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                        ) : (
                            <XCircle className="h-3.5 w-3.5 me-1.5" />
                        )}
                        {notification.is_sent
                            ? t('admin_notifications.is_sent')
                            : t('admin_notifications.show.not_sent')}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main – left 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Content Card */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Bell className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('admin_notifications.show.content')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                            {/* Current Lang */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    {isRTL ? t('admin_notifications.show.arabic') : t('admin_notifications.show.english')}
                                </p>
                                <div className="bg-muted/30 rounded-xl p-4 border border-muted/20 space-y-2">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        {t('admin_notifications.show.title_label')}
                                    </p>
                                    <p className="font-bold text-base">{titleContent}</p>
                                </div>
                                <div className="bg-muted/30 rounded-xl p-4 border border-muted/20 space-y-2">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        {t('admin_notifications.show.body_label')}
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{bodyContent}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Both Languages Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* AR */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('admin_notifications.show.arabic')}
                                    </p>
                                    <div className="bg-muted/20 rounded-lg p-3 border border-muted/10 space-y-1" dir="rtl">
                                        <p className="text-xs font-bold">{arTitle || '—'}</p>
                                        <p className="text-xs text-muted-foreground">{arBody || '—'}</p>
                                    </div>
                                </div>
                                {/* EN */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('admin_notifications.show.english')}
                                    </p>
                                    <div className="bg-muted/20 rounded-lg p-3 border border-muted/10 space-y-1" dir="ltr">
                                        <p className="text-xs font-bold">{enTitle || '—'}</p>
                                        <p className="text-xs text-muted-foreground">{enBody || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Receivers Table */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 pb-2">
                            <div className="flex items-center gap-2 pt-4">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{t('admin_notifications.show.receivers')}</CardTitle>
                                <Badge variant="secondary" className="ms-auto font-bold">
                                    {notification.receivers_count}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 p-0">
                            {isFetching && (
                                <div className="divide-y divide-muted/40 max-h-[400px] overflow-hidden p-6 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 py-2">
                                            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isFetching && (receivers?.data?.length ?? 0) === 0 && (
                                <div className="p-8 text-center">
                                    <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">{t('admin_notifications.show.no_receivers')}</p>
                                </div>
                            )}
                            {!isFetching && (receivers?.data?.length ?? 0) > 0 && (
                                <>
                                    <div className="divide-y divide-muted/40 max-h-[400px] overflow-y-auto">
                                        {receivers!.data.map((receiver) => {
                                            const userLink = getUserLink(receiver)
                                            return (
                                                <div
                                                    key={receiver.user_id}
                                                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                                                >
                                                    {userLink ? (
                                                        <Link {...userLink} className="flex items-center gap-4 flex-1 min-w-0 group">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0 border border-primary/20 group-hover:border-primary/50 transition-colors">
                                                                {(receiver.name || receiver.email)?.substring(0, 2).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                                    {receiver.name || <span className="text-muted-foreground italic">{t('admin_notifications.show.no_name')}</span>}
                                                                </p>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="truncate">{receiver.email}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0 border border-primary/20">
                                                                {(receiver.name || receiver.email)?.substring(0, 2).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm truncate">
                                                                    {receiver.name || <span className="text-muted-foreground italic">{t('admin_notifications.show.no_name')}</span>}
                                                                </p>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="truncate">{receiver.email}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                            {t(`admin_notifications.${receiver.user_type?.toLowerCase()}`) || receiver.user_type}
                                                        </Badge>
                                                        {receiver.read_at ? (
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                                                <CheckCircle2 className="h-2.5 w-2.5 me-0.5" />
                                                                {t('status.read')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold">
                                                                {t('status.unread')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {lastPage > 1 && (
                                        <div className="flex items-center justify-between px-6 py-4 border-t border-muted/40">
                                            <p className="text-xs text-muted-foreground">
                                                {t('Text.page')} {receivers?.current_page} {t('Text.of')} {lastPage}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    disabled={page <= 1}
                                                    onClick={() => setPage((p) => p - 1)}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    disabled={page >= lastPage}
                                                    onClick={() => setPage((p) => p + 1)}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar – right col */}
                <div className="space-y-6">
                    {/* Sender */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                {t('admin_notifications.sender')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                                    {notification.sender?.name?.substring(0, 2).toUpperCase() || 'SA'}
                                </div>
                                <div>
                                    <p className="font-black text-sm">{notification.sender?.name || '—'}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span>{notification.sender?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Info */}
                    <Card className="shadow-sm border-muted/60 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="border-b border-muted/40 pb-2!">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {t('admin_notifications.show.info')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin_notifications.type')}</span>
                                <span className="font-bold capitalize">
                                    {t(`admin_notifications.${notification.type}`) || notification.type}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin_notifications.receivers_count')}</span>
                                <span className="font-black text-primary">{notification.receivers_count}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin_notifications.is_sent')}</span>
                                <Badge variant={notification.is_sent ? 'default' : 'secondary'} className="text-xs">
                                    {notification.is_sent ? t('admin_notifications.is_sent') : t('admin_notifications.show.not_sent')}
                                </Badge>
                            </div>

                            {/* Receivers Data scope / ids */}
                            {notification.receivers_data && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                            {t('admin_notifications.show.target_info')}
                                        </p>
                                        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('admin_notifications.target_scope')}</span>
                                                <span className="font-bold capitalize">
                                                    {t(`admin_notifications.${notification.receivers_data.scope}`) || notification.receivers_data.scope}
                                                </span>
                                            </div>
                                            {notification.receivers_data.ids && notification.receivers_data.ids.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {notification.receivers_data.ids.map((id) => (
                                                        <Badge key={id} variant="outline" className="text-[9px] font-mono px-1.5 py-0">
                                                            #{id}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('admin_notifications.created_at')}</span>
                                <span className="font-bold text-xs">{notification.created_at}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
