import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import ButtonCopy from "@ecommerce/ui/components/copy-button";

interface CheckoutUrlsCardProps {
    urls: { label: string; url: string }[];
}

export function CheckoutUrlsCard({ urls }: CheckoutUrlsCardProps) {
    const { t } = useTranslation();

    if (!urls || urls.length === 0) return null;

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 py-3 gap-0">
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{t('paymentSessions.labels.checkout_url')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5 space-y-4">
                {urls.map(({ label, url }, idx) => (
                    <div key={idx} className="space-y-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">{label}</p>
                        <div className="flex items-center gap-3 p-3 bg-primary/[0.03] rounded-2xl border border-primary/10 group hover:border-primary/30 transition-all">
                            <p className="font-mono text-[11px] truncate flex-1 text-primary/80 font-medium" dir="ltr">{url}</p>
                            <ButtonCopy className="h-8 w-8 text-primary p-0 hover:bg-primary/10 rounded-lg shrink-0" content={url} />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
