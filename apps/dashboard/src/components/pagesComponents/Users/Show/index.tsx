import * as React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@ecommerce/ui/components/card'
import { Link } from '@tanstack/react-router'
import { Badge } from '@ecommerce/ui/components/badge'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'
import { UserShow as UserShowType } from '../Config'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import {
    CreditCardIcon,
    StarIcon,
    Location01Icon,
    SmartPhone01Icon,
    User02Icon,
    Mail01Icon,
    Call02Icon,
    Calendar01Icon,
    Copy01Icon,
    TrendingUpDownIcon,
    Alert01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'
import { SARIcon } from '@/components/common/Icons'
import { Button } from '@ecommerce/ui/components/button'
import { toast } from 'sonner'
import { StatsCard } from '@/components/common/charts/StatsCard'
import ButtonCopy from '@ecommerce/ui/components/copy-button'
import { hasPermission } from '@/lib/utils'
import { ShowHeader, EmptyState } from '@/components/common/show'

const H = (icon: any) => (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={icon} {...props} />
)
const CreditCard = H(CreditCardIcon)
const Star = H(StarIcon)
const MapPin = H(Location01Icon)
const Smartphone = H(SmartPhone01Icon)
const User = H(User02Icon)
const Mail = H(Mail01Icon)
const Phone = H(Call02Icon)
const Calendar = H(Calendar01Icon)
const Copy = H(Copy01Icon)
const TrendingUp = H(TrendingUpDownIcon)

type Props = {
    user: UserShowType
}

export function UserShow({ user }: Props) {
    const { t } = useTranslation()
    const imageUrl = typeof user.image === 'string' ? user.image : user.image?.url

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <ShowHeader
                variant="card"
                imageNode={
                    <Avatar className="h-20 w-20 border ring-1 ring-border">
                        <AvatarImage src={imageUrl || ''} />
                        <AvatarFallback className="text-xl uppercase bg-primary/10 text-primary">
                            {user.full_name?.substring(0, 2) ?? '?'}
                        </AvatarFallback>
                    </Avatar>
                }
                title={user.full_name}
                secondaryTitle={
                    <Badge variant="outline" className="font-normal">
                        {user.user_type === 'client' ? t('common.client') :
                            user.user_type === 'guest' ? t('common.guest') : t('common.super_admin')}
                    </Badge>
                }
                id={user.id}
                createdAt={user.created_at}
                metaItems={[
                    ...(user.last_login_at ? [{ value: `${t('userShow.last_login')} ${formatDate(user.last_login_at)}` }] : []),
                ]}
                badges={[
                    { variant: user.is_active ? 'default' : 'secondary', children: user.is_active ? t('status.active') : t('status.inactive') },
                    ...(user.is_ban ? [{ variant: 'destructive' as const, className: 'flex items-center gap-1', children: (<><HugeiconsIcon icon={Alert01Icon} className="h-3 w-3" />{t('status.banned')}</>) }] : []),
                    ...(user.tier?.name ? [{ className: 'bg-primary/20 text-primary hover:bg-primary/30 border-none', children: user.tier.name }] : []),
                ]}
                actions={
                    <>
                        <span className="text-xs text-muted-foreground">
                            {user.email || user.phone || t('common.noContact')}
                        </span>
                        {user.shopify_id && <div className='flex items-center gap-1'>
                            <div className='text-sm font-medium'>
                                {t('userShow.shopify_id')}: {user.shopify_id || "unregistered"}
                            </div>
                            <ButtonCopy content={user.shopify_id || ''} className='h-6 w-6' />
                        </div>}
                    </>
                }
            />

            {/* Statistics Grid - using specialized StatsCard for premium feel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsCard
                    title={t('userShow.stats.total_orders')}
                    value={user.statistics.total_orders}
                    icon={CreditCard}
                    iconColor="text-blue-600 bg-blue-500/10"
                />
                <StatsCard
                    title={t('userShow.stats.total_spent')}
                    value={<div className="flex items-center gap-1">{user.statistics.total_spent} <SARIcon className="h-4 w-4" /></div>}
                    icon={TrendingUp}
                    iconColor="text-emerald-600 bg-emerald-500/10"
                />
                <StatsCard
                    title={t('userShow.stats.points')}
                    value={user.points}
                    icon={Star}
                    iconColor="text-amber-500 bg-amber-500/10"
                />
                <StatsCard
                    title={t('userShow.stats.redeemed_rewards_count')}
                    value={user.redeemed_rewards_count}
                    icon={CreditCard}
                    iconColor="text-purple-600 bg-purple-500/10"
                />
                <StatsCard
                    title={t('userShow.stats.addresses_count')}
                    value={user.statistics.addresses_count}
                    icon={MapPin}
                    iconColor="text-rose-500 bg-rose-500/10"
                />
                <StatsCard
                    title={t('userShow.stats.devices_count')}
                    value={user.statistics.devices_count}
                    icon={Smartphone}
                    iconColor="text-slate-600 bg-slate-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Core Account Info */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t('userShow.account_details')}
                        </CardTitle>
                        <CardDescription>{t('userShow.account_details_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> {t('Form.labels.email')}
                            </span>
                            <span className="text-sm font-medium">{user.email || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> {t('Form.labels.phone')}
                            </span>
                            <span className="text-sm font-medium">{user.phone ? `${user.phone_code || ''}${user.phone}` : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> {t('userShow.birth_date')}
                            </span>
                            <span className="text-sm font-medium">{user.birth_date || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" /> {t('userShow.gender')}
                            </span>
                            <span className="text-sm font-medium capitalize">{user.gender || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground">{t('userShow.lifetime_points')}</span>
                            <span className="text-sm font-medium">{user.lifetime_points}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed">
                            <span className="text-sm text-muted-foreground">{t('userShow.market')}</span>
                            <Badge variant="outline" className="capitalize">{user.market || '—'}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* System / meta Info */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">{t('userShow.system_info')}</CardTitle>
                        <CardDescription>{t('userShow.system_info_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-dashed">
                            <span className="text-sm text-muted-foreground">{t('Form.labels.language')}</span>
                            <Badge variant="outline" className="uppercase">{user.locale}</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed">
                            <span className="text-sm text-muted-foreground">{t('Form.labels.allow_notifications')}</span>
                            <Badge variant={user.allow_notifications ? 'default' : 'secondary'}>
                                {user.allow_notifications ? t('status.enabled') : t('status.disabled')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed">
                            <span className="text-sm text-muted-foreground">{t('userShow.last_login')}</span>
                            <span className="text-sm font-medium">{user.last_login_at ? formatDate(user.last_login_at) : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-dashed">
                            <span className="text-sm text-muted-foreground">{t('table.createdAt')}</span>
                            <span className="text-sm font-medium">{formatDate(user.created_at)}</span>
                        </div>
                        {user.is_ban && (
                            <div className="pt-4">
                                <div className="text-xs font-semibold text-destructive uppercase mb-1">{t('userShow.ban_reason')}</div>
                                <div className="text-sm p-3 bg-destructive/5 border border-destructive/20 rounded-md text-destructive">
                                    {user.ban_reason || t('common.no_data')}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Additional Data (Addresses & Devices) */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Addresses */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> {t('common.addresses')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.addresses.length > 0 ? (
                            <div className="space-y-2">
                                {user.addresses.map((addr) => (
                                    <div key={addr.id} className="text-sm p-3 bg-muted/50 rounded-md border">
                                        <div className="font-medium flex items-center justify-between">
                                            <span>{addr.address}</span>
                                            {addr.is_default && <Badge variant="secondary" className="text-[10px]">{t('common.default')}</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{addr.city}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message={t('common.no_data')} className="py-4" />
                        )}
                    </CardContent>
                </Card>

                {/* Devices */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Smartphone className="h-4 w-4" /> {t('common.devices')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.devices.length > 0 ? (
                            <div className="space-y-2">
                                {user.devices.map((device) => (
                                    <div key={device.id} className="text-sm p-3 bg-muted/50 rounded-md border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium capitalize">{device.device_name || device.os || t('common.unknown_device')}</div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {device.os} {device.os_version && `(${device.os_version})`}
                                                    {device.device_id && (
                                                        <span className="inline-flex items-center gap-1 group/id">
                                                            • ID: {device.device_id.substring(0, 8)}...
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4 opacity-0 group-hover/id:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(device.device_id!)
                                                                    toast.success(t('common.copied'))
                                                                }}
                                                            >
                                                                <Copy className="h-2.5 w-2.5" />
                                                            </Button>
                                                        </span>
                                                    )}
                                                    {device.token && (
                                                        <span className="inline-flex items-center gap-1 group/id">
                                                            • Token: {device.token.substring(0, 8)}...
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4 opacity-0 group-hover/id:opacity-100 transition-opacity"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(device.device_id!)
                                                                    toast.success(t('common.copied'))
                                                                }}
                                                            >
                                                                <Copy className="h-2.5 w-2.5" />
                                                            </Button>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="text-[10px] font-normal mb-1 block w-fit ml-auto">
                                                {formatDate(device.last_used_at)}
                                            </Badge>
                                            {device.app_version && <div className="text-[10px] text-muted-foreground">App v{device.app_version}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message={t('common.no_data')} className="py-4" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders & Reviews */}
            {/* Recent Orders & Reviews */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> {t('dashboard.recentOrders')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.recent_orders.length > 0 ? (
                            <div className="space-y-2">
                                {user.recent_orders.map((order) => (
                                    <Link
                                        to="/orders/show/$id"
                                        disabled={!hasPermission('orders', 'show')}
                                        params={{ id: String(order.id) }}
                                        key={order.id}
                                        className="block hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between p-3 border rounded-md text-sm">
                                            <div>
                                                <div className="font-medium">#{order.order_number}</div>
                                                <div className="text-xs text-muted-foreground">{formatDate(order.created_at)}</div>
                                            </div>
                                            <div>
                                                <Badge variant="outline" className="capitalize mb-1">{t(`status.${order.status}`)}</Badge>
                                                {order.total && (
                                                    <div className="text-xs font-semibold flex items-center gap-1 justify-end">
                                                        {order.total} <SARIcon className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message={t('common.no_data')} className="py-4" />
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Star className="h-4 w-4" /> {t('dashboard.recentReviews')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.recent_reviews.length > 0 ? (
                            <div className="space-y-2">
                                {user.recent_reviews.map((review) => (
                                    <Link
                                        to="/reviews/show/$id"
                                        params={{ id: String(review.id) }}
                                        disabled={!hasPermission('reviews', 'show')}
                                        key={review.id}
                                        className="block hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="p-3 border rounded-md text-sm space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="font-medium text-xs line-clamp-1 pr-2" title={review.product_name || ''}>
                                                    {review.product_name || t('common.unknown_product')}
                                                </div>
                                                <div className="flex items-center text-amber-500 text-xs shrink-0">
                                                    <Star className="h-3 w-3 fill-current mr-1" /> {review.rating}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded italic">
                                                    "{review.comment}"
                                                </div>
                                            )}
                                            <div className="text-[10px] text-muted-foreground text-right">
                                                {formatDate(review.created_at)}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message={t('common.no_data')} className="py-4" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <CardFooter className="flex items-center justify-end text-sm text-muted-foreground p-0">
                {t('table.updatedAt')}: &nbsp; {formatDate(user.updated_at)}
            </CardFooter>
        </div>
    )
}
