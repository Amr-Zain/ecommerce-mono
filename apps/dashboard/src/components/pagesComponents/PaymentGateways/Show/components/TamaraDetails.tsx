import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { CreditCard, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getSessionStatusColor } from "../Config";
import ButtonCopy from "@ecommerce/ui/components/copy-button";

interface TamaraDetailsProps {
    providerResponse: any;
}

export function TamaraDetails({ providerResponse }: TamaraDetailsProps) {
    const { t } = useTranslation();

    if (!providerResponse) return null;

    const status = providerResponse.status;
    const orderId = providerResponse.order_id || providerResponse.orderId;
    const checkoutId = providerResponse.checkout_id;
    const paymentStatus = providerResponse.paymentStatus;
    const declineType = providerResponse.decline_type;

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm">
            <CardHeader className="bg-muted/20 py-3 border-b border-muted/50 gap-0">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('paymentSessions.labels.tamara_response')}</CardTitle>
                    {status && (
                        <Badge variant="outline" className={cn("ms-auto text-[10px] font-bold uppercase px-2 py-0.5", getSessionStatusColor(status))}>
                            {status}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-6">
                {/* Primary IDs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orderId && (
                        <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.order_id')}</p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-bold truncate">{orderId}</span>
                                <ButtonCopy className="h-6 w-6 text-muted-foreground/50 p-0 hover:bg-transparent" content={orderId} />
                            </div>
                        </div>
                    )}
                    {checkoutId && (
                        <div className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-muted/30">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t('paymentSessions.labels.checkout_id')}</p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-bold truncate">{checkoutId}</span>
                                <ButtonCopy className="h-6 w-6 text-muted-foreground/50 p-0 hover:bg-transparent" content={checkoutId} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Status Info */}
                {(paymentStatus || declineType || providerResponse.user_type || providerResponse.session) && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-muted/50 pt-6">
                        {paymentStatus && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.payment_status')}</p>
                                <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-2", getSessionStatusColor(paymentStatus))}>
                                    {paymentStatus}
                                </Badge>
                            </div>
                        )}
                        {declineType && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.decline_type')}</p>
                                <Badge variant="outline" className="text-[10px] font-black uppercase px-2 bg-red-50 text-red-700 border-red-200">
                                    {declineType}
                                </Badge>
                            </div>
                        )}
                        {providerResponse.user_type && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.user_type')}</p>
                                <p className="text-xs font-bold capitalize">{providerResponse.user_type}</p>
                            </div>
                        )}
                         {providerResponse.session && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t('paymentSessions.labels.session_id')}</p>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[10px] font-mono truncate opacity-60 font-medium">{providerResponse.session}</span>
                                    <ButtonCopy className="h-6 w-6 text-muted-foreground/50 p-0 hover:bg-transparent" content={providerResponse.session} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Checkout Link (if status is new) */}
                {providerResponse.checkout_url && status === 'new' && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-sm overflow-hidden group">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <ExternalLink className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-primary/70 font-black uppercase tracking-widest leading-none mb-1">{t('paymentSessions.labels.checkout_url')}</p>
                            <a 
                                href={providerResponse.checkout_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-primary hover:underline truncate block"
                            >
                                {providerResponse.checkout_url}
                            </a>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
