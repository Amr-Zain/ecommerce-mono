import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Separator } from "@ecommerce/ui/components/separator";
import { Info, Key, Hash, Package, CreditCard, AlertTriangle, CheckCircle, MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { getSessionStatusColor } from "../Config";
import { PriceDisplay } from "./PriceDisplay";

interface PaymobDetailsProps {
    providerResponse: any;
}

export function PaymobDetails({ providerResponse }: PaymobDetailsProps) {
    const { t } = useTranslation();

    if (!providerResponse) return null;

    const isIntention = !!providerResponse.intention_detail || providerResponse.object === 'paymentintention';
    const isTransaction = !!providerResponse.obj;

    if (!isIntention && !isTransaction) return null;

    return (
        <div className="space-y-6">
            {isIntention && <PaymobIntention intention={providerResponse} />}
            {isTransaction && <PaymobTransaction transaction={providerResponse.obj} />}
        </div>
    );
}

function PaymobIntention({ intention }: { intention: any }) {
    const { t } = useTranslation();

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm transition-all">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-950/10 py-3 border-b border-amber-100 dark:border-amber-900/30 gap-0">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('paymentSessions.labels.paymob_intention')}</CardTitle>
                    {intention.status && (
                        <Badge variant="outline" className={cn('ms-auto text-[10px] font-black capitalize px-2 py-0.5 border-2', getSessionStatusColor(intention.status))}>
                            {intention.status}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-7">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {intention.object && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.object_type')}</p>
                            <p className="text-xs font-mono font-bold text-amber-700">{intention.object}</p>
                        </div>
                    )}
                    {intention.confirmed !== undefined && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.confirmed')}</p>
                            <Badge variant="outline" className={cn('text-[9px] font-black uppercase py-0', intention.confirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground opacity-60')}>
                                {intention.confirmed ? t('common.yes') : t('common.no')}
                            </Badge>
                        </div>
                    )}
                    {intention.special_reference && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.special_reference')}</p>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono font-bold truncate opacity-80">{intention.special_reference}</span>
                                <ButtonCopy className="h-6 w-6 text-muted-foreground p-0 hover:bg-transparent" content={intention.special_reference} />
                            </div>
                        </div>
                    )}
                    {intention.intention_order_id && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.intention_order_id')}</p>
                            <p className="text-xs font-mono font-black">{intention.intention_order_id}</p>
                        </div>
                    )}
                </div>

                {intention.client_secret && (
                    <div className="space-y-2 p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 group">
                        <p className="text-[10px] text-amber-700/60 font-black uppercase tracking-[0.2em]">{t('paymentSessions.labels.client_secret')}</p>
                        <div className="flex items-center gap-3">
                            <p className="text-[11px] font-mono truncate flex-1 text-amber-900/60 font-bold" dir="ltr">••••••••{intention.client_secret.slice(-8)}</p>
                            <ButtonCopy className="h-8 w-8 text-amber-600 p-0 hover:bg-amber-100/50 rounded-lg shrink-0" content={intention.client_secret} />
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Billing Data */}
                    {intention.intention_detail?.billing_data && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5" /> {t('paymentSessions.labels.billing_data')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                {Object.entries(intention.intention_detail.billing_data).map(([key, value]) => {
                                    if (!value) return null;
                                    return (
                                        <div key={key} className="space-y-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-xs font-black">{String(value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {intention.extras?.creation_extras && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Info className="h-3.5 w-3.5" /> {t('paymentSessions.labels.creation_extras')}
                            </h4>
                            <div className="space-y-3 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                {intention.extras.creation_extras.order_id && (
                                    <div className="flex justify-between items-center border-b border-muted/30 pb-2.5 last:border-0 last:pb-0">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{t('paymentSessions.labels.order_id')}</span>
                                        <span className="text-xs font-mono font-black">{intention.extras.creation_extras.order_id}</span>
                                    </div>
                                )}
                                {intention.extras.creation_extras.merchant_order_id && (
                                    <div className="flex justify-between items-center border-b border-muted/30 pb-2.5 last:border-0 last:pb-0">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{t('paymentSessions.labels.session_key')}</span>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] font-mono font-bold truncate opacity-70">{intention.extras.creation_extras.merchant_order_id}</span>
                                            <ButtonCopy className="h-6 w-6 text-muted-foreground/40 p-0 hover:bg-transparent" content={intention.extras.creation_extras.merchant_order_id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                {intention.intention_detail?.items?.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" /> {t('orders.labels.items')}
                        </h4>
                        <div className="grid gap-3">
                            {intention.intention_detail.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-muted/30 group transition-all">
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm group-hover:text-amber-700 transition-colors">{item.name}</p>
                                        {item.description && <p className="text-[10px] text-muted-foreground font-medium italic line-clamp-1">{item.description}</p>}
                                    </div>
                                    <div className="text-end">
                                        <PriceDisplay amount={item.amount} className="text-amber-700" />
                                        {item.quantity && <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5">× {item.quantity}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Methods & Keys */}
                <div className="grid md:grid-cols-2 gap-8 border-t border-muted/50 pt-7">
                    {intention.payment_methods?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" /> {t('paymentSessions.labels.payment_methods')}
                            </h4>
                            <div className="space-y-2">
                                {intention.payment_methods.map((pm: any, i: number) => (
                                    <div key={pm.id || i} className="p-3 rounded-xl bg-muted/10 border border-muted/30 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shadow-sm group-hover:bg-primary/5 transition-colors">
                                                <CreditCard className="h-4 w-4 text-primary/70" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase leading-none">{pm.method_type || 'Unknown'}</p>
                                                <p className="text-[9px] text-muted-foreground mt-1 opacity-60">ID: {pm.integration_id || pm.id}</p>
                                            </div>
                                        </div>
                                        <Badge variant={pm.live ? 'default' : 'secondary'} className="text-[9px] font-black h-4 px-1 leading-none uppercase">
                                            {pm.live ? t('paymentSessions.labels.live') : t('paymentSessions.labels.test')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {intention.payment_keys?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Key className="h-3.5 w-3.5" /> {t('paymentSessions.labels.payment_keys')}
                            </h4>
                            <div className="space-y-2">
                                {intention.payment_keys.map((pk: any, i: number) => (
                                    <div key={i} className="p-3 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/20 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-[9px] font-black border-indigo-200 text-indigo-700 dark:border-indigo-900/20 dark:text-indigo-300">{pk.gateway_type}</Badge>
                                            <span className="text-[10px] font-mono text-indigo-900/60 font-black">ID: {pk.integration}</span>
                                        </div>
                                        {pk.redirection_url && (
                                            <div className="p-2 rounded bg-indigo-100/50 dark:bg-indigo-950/50 flex items-center gap-2 group">
                                                <span className="text-[9px] font-mono truncate flex-1 opacity-60 group-hover:opacity-100 transition-opacity" dir="ltr">{pk.redirection_url}</span>
                                                <ButtonCopy className="h-5 w-5 text-indigo-400 p-0" content={pk.redirection_url} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function PaymobTransaction({ transaction }: { transaction: any }) {
    const { t } = useTranslation();

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm transition-all">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-950/10 py-3! gap-0 border-b border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('paymentSessions.labels.paymob_transaction')}</CardTitle>
                    <Badge variant="outline" className={cn(
                        "ms-auto text-[10px] font-black px-2 py-0.5 border-2",
                        transaction.success ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                        {transaction.success ? t('paymentSessions.labels.success') : t('paymentSessions.labels.failed')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-7">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { key: 'is_live', label: t('paymentSessions.labels.live_mode') },
                        { key: 'is_3d_secure', label: '3D Secure' },
                        { key: 'is_refund', label: t('paymentSessions.labels.is_refund') },
                        { key: 'is_capture', label: t('paymentSessions.labels.is_capture') },
                        { key: 'is_settled', label: t('paymentSessions.labels.is_settled') },
                        { key: 'error_occured', label: t('paymentSessions.labels.error_occured') },
                        { key: 'pending', label: t('paymentSessions.labels.pending') },
                    ].filter(f => transaction[f.key] !== undefined).map(flag => (
                        <div key={flag.key} className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border text-center gap-1.5 transition-all shadow-sm",
                            transaction[flag.key] ? "bg-emerald-100 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" : "bg-muted/20 border-muted/40"
                        )}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{flag.label}</span>
                            <Badge variant="outline" className={cn("text-[8px] font-black px-1.5 h-3.5 border", transaction[flag.key] ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-muted text-muted-foreground opacity-60")}>
                                {transaction[flag.key] ? t('common.yes') : t('common.no')}
                            </Badge>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Source Data (Card Info) */}
                    {transaction.source_data && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" /> {t('paymentSessions.labels.card_info')}
                            </h4>
                            <div className="flex items-center gap-4 p-4 bg-muted/10 rounded-2xl border border-muted/30 transition-all">
                                <div className="h-12 w-20 rounded-xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                                    <CreditCard className="h-7 w-7 text-white relative z-10 opacity-90" />
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <p className="font-black text-sm uppercase tracking-wider text-amber-900/80 truncate">{transaction.source_data.sub_type || 'CARD'}</p>
                                    <p className="text-xs text-muted-foreground font-mono font-bold tracking-[0.1em]">{transaction.source_data.pan ? `•••• •••• •••• ${transaction.source_data.pan}` : 'N/A'}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black opacity-50">{transaction.source_data.type}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Data */}
                    {transaction.order?.shipping_data && (
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" /> {t('paymentSessions.labels.shipping_data')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                {Object.entries(transaction.order.shipping_data).map(([key, value]) => {
                                    if (!value || typeof value === 'object') return null;
                                    return (
                                        <div key={key} className="space-y-0.5">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-xs font-black">{String(value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* MIGS / Transaction Data (Recursive Scalar List) */}
                {(transaction.data || transaction.payment_key_claims) && (
                    <div className="grid md:grid-cols-2 gap-8 border-t border-muted/50 pt-7">
                        {transaction.data && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> {t('paymentSessions.labels.transaction_data')}
                                </h4>
                                <div className="space-y-2 bg-muted/5 p-4 rounded-2xl border border-muted/20">
                                    {Object.entries(transaction.data).map(([k, v]) => {
                                        if (v == null || typeof v === 'object' || v === '-1') return null;
                                        return (
                                            <div key={k} className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] text-muted-foreground font-bold uppercase truncate">{k.replace(/_/g, ' ')}</span>
                                                <span className="text-[10px] font-mono font-black break-all text-right">{String(v)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {transaction.payment_key_claims && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5" /> {t('paymentSessions.labels.billing_data')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-2xl border border-muted/30">
                                    {Object.entries(transaction.payment_key_claims.billing_data || {}).map(([key, value]) => {
                                        if (!value) return null;
                                        return (
                                            <div key={key} className="space-y-0.5">
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-xs font-black">{String(value)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
