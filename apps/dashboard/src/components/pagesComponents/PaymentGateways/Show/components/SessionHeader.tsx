import { Badge } from "@ecommerce/ui/components/badge";
import { CreditCard, Key, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { PaymentSession, getSessionStatusColor } from "../Config";
import { PriceDisplay } from "./PriceDisplay";

interface SessionHeaderProps {
    session: PaymentSession;
}

export function SessionHeader({ session }: SessionHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    {t('paymentSessions.entity')} #{session.id}
                </h1>
                {session.session_key && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Key className="h-3.5 w-3.5" />
                        <span className="font-mono text-xs">{session.session_key}</span>
                        <ButtonCopy className="h-7 w-7 text-muted-foreground p-0 hover:bg-transparent" content={session.session_key} />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {session.status && (
                    <Badge
                        variant="outline"
                        className={cn(
                            'capitalize font-semibold px-3 py-1.5 text-sm border',
                            getSessionStatusColor(session.status)
                        )}
                    >
                        {t(`paymentSessions.status.${session.status}`)}
                    </Badge>
                )}
                {session.amount && (
                    <Badge variant="secondary" className="px-3 py-1.5 flex items-center gap-1">
                        <PriceDisplay amount={session.amount} currencyCode={session.currency} size="md" />
                    </Badge>
                )}
                {session.expires_at && (
                    <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('table.expiresAt')}: {session.expires_at}
                    </Badge>
                )}
            </div>
        </div>
    );
}
