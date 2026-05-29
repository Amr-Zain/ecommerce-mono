import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Separator } from "@ecommerce/ui/components/separator";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { getSessionStatusColor } from "../Config";
import { PriceDisplay } from "./PriceDisplay";

interface OrderInfoProps {
    order: any;
    currency?: string;
}

export function OrderInfo({ order, currency }: OrderInfoProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 py-3 gap-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">{t('paymentSessions.labels.order_info')}</CardTitle>
                    </div>
                    {order.id && (
                        <Link
                            to="/orders/show/$id"
                            params={{ id: String(order.id) }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-md"
                        >
                            <ExternalLink className="h-3 w-3" />
                            {t('actions.show')}
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {order.id && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.order_id')}</p>
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-sm">#{order.id}</p>
                                <ButtonCopy className="h-6 w-6 text-muted-foreground p-0 hover:bg-transparent" content={String(order.id)} />
                            </div>
                        </div>
                    )}
                    {order.shopify_id && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.shopify_id')}</p>
                            <div className="flex items-center gap-1.5">
                                <p className="text-sm font-mono font-medium truncate max-w-[120px]">{order.shopify_id}</p>
                                <ButtonCopy className="h-6 w-6 text-muted-foreground p-0 hover:bg-transparent" content={order.shopify_id} />
                            </div>
                        </div>
                    )}
                    {order.order_number && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.order_number')}</p>
                            <p className="font-bold text-sm">{order.shopify_name || `#${order.order_number}`}</p>
                        </div>
                    )}
                    {order.status && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.status')}</p>
                            <Badge variant="outline" className={cn('capitalize text-[10px] font-bold border-2', getSessionStatusColor(order.status))}>
                                {t(`orders.status.${order.status}`)}
                            </Badge>
                        </div>
                    )}
                    {order.financial_status && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.financial_status')}</p>
                            <Badge variant="outline" className={cn('capitalize text-[10px] font-bold border-2', getSessionStatusColor(order.financial_status))}>
                                {t(`orders.financialStatus.${order.financial_status}`)}
                            </Badge>
                        </div>
                    )}
                    {order.fulfillment_status && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.fulfillment_status')}</p>
                            <Badge variant="outline" className={cn('capitalize text-[10px] font-bold border-2', getSessionStatusColor(order.fulfillment_status))}>
                                {t(`orders.fulfillmentStatus.${order.fulfillment_status}`)}
                            </Badge>
                        </div>
                    )}
                    {order.email && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.email')}</p>
                            <p className="text-sm font-medium truncate">{order.email}</p>
                        </div>
                    )}
                    {order.phone && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.phone')}</p>
                            <p className="text-sm font-medium" dir="ltr">{order.phone}</p>
                        </div>
                    )}
                </div>

                <Separator className="bg-muted/50" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/20 p-4 rounded-xl border border-muted/40">
                    {order.subtotal_price != null && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.subtotal')}</p>
                            <PriceDisplay amount={order.subtotal_price} currencyCode={currency} />
                        </div>
                    )}
                    {order.total_shipping != null && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.shipping')}</p>
                            <PriceDisplay amount={order.total_shipping} currencyCode={currency} />
                        </div>
                    )}
                    {order.total_tax != null && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.tax')}</p>
                            <PriceDisplay amount={order.total_tax} currencyCode={currency} />
                        </div>
                    )}
                    {order.total_price != null && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('orders.labels.total')}</p>
                            <PriceDisplay amount={order.total_price} currencyCode={currency} size="lg" className="text-primary" />
                        </div>
                    )}
                </div>

                {(order.processed_at || order.paid_at || order.fulfilled_at) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-muted/50 pt-4">
                        {order.processed_at && (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.processed_at')}</p>
                                <p className="text-[11px] font-bold">{new Date(order.processed_at).toLocaleString()}</p>
                            </div>
                        )}
                        {order.paid_at && (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.paid_at')}</p>
                                <p className="text-[11px] font-bold text-emerald-600">{new Date(order.paid_at).toLocaleString()}</p>
                            </div>
                        )}
                        {order.fulfilled_at && (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.fulfilled_at')}</p>
                                <p className="text-[11px] font-bold text-indigo-600">{new Date(order.fulfilled_at).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
