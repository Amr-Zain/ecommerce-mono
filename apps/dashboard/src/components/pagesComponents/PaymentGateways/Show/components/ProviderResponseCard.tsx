import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ProviderResponseCardProps {
    providerResponse: any;
}

export function ProviderResponseCard({ providerResponse }: ProviderResponseCardProps) {
    const { t } = useTranslation();

    if (!providerResponse) return null;

    const handledKeys = [
        'obj', 'raw', 'intention_detail', 'object', 'special_reference',
        'intention_order_id', 'client_secret', 'extras', 'payment_keys',
        'payment_methods', 'buyer', 'id', 'status', 'paymentStatus',
        'product', 'configuration', 'order', 'captures', 'shipping_address',
        'merchant_urls', 'buyer_history', 'order_history', 'refunds'
    ];

    const remainingEntries = Object.entries(providerResponse).filter(
        ([key, val]) => !handledKeys.includes(key) && val != null && typeof val !== 'object'
    );

    if (remainingEntries.length === 0) return null;

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm">
            <CardHeader className="bg-muted/30 py-3 gap-0">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{t('paymentSessions.labels.provider_response')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {remainingEntries.map(([key, val]: [any, any]) => (
                        <div key={key} className="space-y-1.5 p-3 rounded-xl bg-muted/5 border border-muted/20">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">{key.replace(/_/g, ' ')}</p>
                            {typeof val === 'boolean' ? (
                                <Badge variant={val ? 'default' : 'secondary'} className="text-[10px] font-bold px-2 py-0">
                                    {val ? t('common.yes') : t('common.no')}
                                </Badge>
                            ) : (
                                <p className="text-sm font-mono font-bold break-all">{String(val)}</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
