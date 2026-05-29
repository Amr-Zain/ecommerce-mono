import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Separator } from "@ecommerce/ui/components/separator";
import { CreditCard, User, Package, Shield, CheckCircle, History, Truck, AlertTriangle, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { getSessionStatusColor } from "../Config";
import { PriceDisplay } from "./PriceDisplay";

interface TabbyDetailsProps {
    providerResponse: any;
}

export function TabbyDetails({ providerResponse }: TabbyDetailsProps) {
    const { t } = useTranslation();

    if (!providerResponse) return null;

    const tabbyData = providerResponse.raw || providerResponse;
    const topStatus = tabbyData.status || providerResponse.status;

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm">
            <CardHeader className="bg-muted/20 py-3 border-b border-muted/50 gap-0">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('paymentSessions.labels.tabby_response')}</CardTitle>
                    {topStatus && (
                        <Badge variant="outline" className={cn("ms-auto text-[10px] font-bold uppercase px-2 py-0.5", getSessionStatusColor(topStatus))}>
                            {topStatus}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-7">
                {/* Status Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {providerResponse.phase && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.phase')}</p>
                            <Badge variant="secondary" className="text-[10px] font-bold px-2">{providerResponse.phase}</Badge>
                        </div>
                    )}
                    {tabbyData.rejection_reason_code && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.rejection_reason')}</p>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] font-black uppercase px-2">{tabbyData.rejection_reason_code}</Badge>
                        </div>
                    )}
                    {tabbyData.is_test !== undefined && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.environment')}</p>
                            <Badge variant={tabbyData.is_test ? 'secondary' : 'default'} className="text-[10px] font-bold px-2">
                                {tabbyData.is_test ? t('paymentSessions.labels.test') : t('paymentSessions.labels.live')}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {providerResponse.provider_message && (
                    <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 shadow-sm">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-bold leading-relaxed">{providerResponse.provider_message}</p>
                    </div>
                )}

                {/* Main Tabby Info Sections */}
                <div className="space-y-6">
                    {/* Buyer & Address */}
                    {(tabbyData.buyer || tabbyData.shipping_address) && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {tabbyData.buyer && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <User className="h-3.5 w-3.5" /> {t('paymentSessions.labels.buyer_info')}
                                    </h4>
                                    <div className="space-y-3 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('Form.labels.name')}</p>
                                            <p className="text-sm font-black">{tabbyData.buyer.name || '-'}</p>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('orders.labels.email')}</p>
                                            <p className="text-sm font-medium italic break-all">{tabbyData.buyer.email || '-'}</p>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('orders.labels.phone')}</p>
                                            <p className="text-sm font-mono font-bold" dir="ltr">{tabbyData.buyer.phone || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tabbyData.shipping_address && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Truck className="h-3.5 w-3.5" /> {t('orders.labels.shipping_address')}
                                    </h4>
                                    <div className="space-y-3 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('common.address')}</p>
                                            <p className="text-sm font-medium leading-relaxed">{tabbyData.shipping_address.address || '-'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('common.city')}</p>
                                                <p className="text-sm font-bold">{tabbyData.shipping_address.city || '-'}</p>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('paymentSessions.labels.zip')}</p>
                                                <p className="text-sm font-mono">{tabbyData.shipping_address.zip || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Products & Installments */}
                    {(tabbyData.product || tabbyData.configuration) && (
                        <div className="grid md:grid-cols-2 gap-6 pb-2">
                            {/* Product Details */}
                            {tabbyData.product && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Package className="h-3.5 w-3.5" /> {t('paymentSessions.labels.product_details')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                        {tabbyData.product.type && (
                                            <div>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('paymentSessions.labels.type')}</p>
                                                <p className="text-xs font-black uppercase text-primary">{tabbyData.product.type}</p>
                                            </div>
                                        )}
                                        {tabbyData.product.installments_count != null && (
                                            <div>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">{t('paymentSessions.labels.installments')}</p>
                                                <p className="text-sm font-black">{tabbyData.product.installments_count}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Installment Plan */}
                            {tabbyData.configuration?.available_products?.installments?.[0] && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5" /> {t('paymentSessions.labels.installment_plan')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {tabbyData.configuration.available_products.installments[0].installments?.map((inst: any, idx: number) => (
                                            <div key={idx} className="p-2.5 rounded-xl bg-muted/10 border border-muted/30 text-center">
                                                <p className="text-[8px] text-muted-foreground font-black uppercase mb-1">{t('paymentSessions.labels.installment')} {idx + 1}</p>
                                                <PriceDisplay amount={inst.amount} size="sm" />
                                                <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">{inst.due_date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Items */}
                    {(tabbyData.order?.items ?? tabbyData.payment?.order?.items)?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package className="h-3.5 w-3.5" /> {t('orders.labels.items')}
                            </h4>
                            <div className="grid gap-3">
                                {(tabbyData.order?.items ?? tabbyData.payment?.order?.items ?? []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-muted/30 group hover:border-primary/20 transition-all">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.title || item.name}</p>
                                            <div className="flex items-center gap-2">
                                                {item.category && <Badge variant="outline" className="text-[9px] font-black uppercase py-0">{item.category}</Badge>}
                                                {item.reference_id && <span className="text-[10px] text-muted-foreground font-mono opacity-60">{item.reference_id}</span>}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <PriceDisplay amount={item.unit_price} />
                                            {item.quantity && <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5">× {item.quantity}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Captures & Refunds (Conditional) */}
                    {(tabbyData.captures?.length > 0 || tabbyData.refunds?.length > 0) && (
                        <div className="grid md:grid-cols-2 gap-6 border-t border-muted/50 pt-6">
                            {tabbyData.captures?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {t('paymentSessions.labels.captures')}
                                    </h4>
                                    <div className="space-y-2">
                                        {tabbyData.captures.map((cap: any, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center group">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold truncate opacity-70 group-hover:opacity-100 transition-opacity">{cap.id}</span>
                                                    <ButtonCopy className="h-6 w-6 text-emerald-600/50 dark:text-emerald-400/50 p-0 hover:bg-transparent" content={cap.id} />
                                                </div>
                                                <PriceDisplay amount={cap.amount} className="text-emerald-700 dark:text-emerald-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {tabbyData.refunds?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ExternalLink className="h-3.5 w-3.5 text-red-500" /> {t('paymentSessions.labels.refunds')}
                                    </h4>
                                    <div className="space-y-2">
                                        {tabbyData.refunds.map((ref: any, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-red-50/30 border border-red-100 flex justify-between items-center group">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-[10px] font-mono text-red-700 font-bold truncate opacity-70 group-hover:opacity-100 transition-opacity">{ref.id}</span>
                                                    <ButtonCopy className="h-6 w-6 text-red-600/50 p-0 hover:bg-transparent" content={ref.id} />
                                                </div>
                                                <PriceDisplay amount={ref.amount} className="text-red-700" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History & URLs */}
                    <div className="grid md:grid-cols-2 gap-6 border-t border-muted/50 pt-6">
                        {tabbyData.order_history?.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" /> {t('paymentSessions.labels.order_history')}
                                </h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {tabbyData.order_history.map((hist: any, i: number) => (
                                        <div key={i} className="p-3 rounded-xl bg-muted/10 border border-muted/30 flex justify-between items-center">
                                            <div>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase px-2">{hist.status}</Badge>
                                                <p className="text-[9px] text-muted-foreground mt-1 font-bold">{hist.created_at}</p>
                                            </div>
                                            <PriceDisplay amount={hist.amount} size="sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {tabbyData.merchant_urls && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ExternalLink className="h-3.5 w-3.5" /> {t('paymentSessions.labels.callback_urls')}
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(tabbyData.merchant_urls).map(([k, v]) => (
                                        <div key={k} className="p-2.5 rounded-xl bg-muted/5 border border-muted/30 group">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase mb-1">{k}</p>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[10px] font-mono truncate flex-1 opacity-60 group-hover:opacity-100 transition-opacity">{String(v)}</span>
                                                <ButtonCopy className="h-6 w-6 text-muted-foreground/50 p-0 hover:bg-transparent" content={String(v)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
