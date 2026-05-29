import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@ecommerce/ui/components/avatar";
import {
    MessageSquare,
    Calendar,
    User,
    Clock,
    Shield,
    CheckCircle,
    Hash,
    Phone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Separator } from "@ecommerce/ui/components/separator";
import { SmsSession, getSessionStatusColor } from "./Config";

interface SmsSessionShowProps {
    session: SmsSession | null | undefined; // Allow session to be null or undefined
}

export default function SmsSessionShow({ session }: SmsSessionShowProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";

    const provider = session?.provider;

    // Improved JSON parsing for response
    const providerResponse = (() => {
        if (!session?.response) return null;
        if (typeof session.response === 'object') return session.response;
        try {
            return JSON.parse(session.response);
        } catch (e) {
            return { raw: session.response };
        }
    })();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        {t('smsSessions.entity')} #{session?.id || '---'}
                    </h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {session?.status && (
                        <Badge
                            variant="outline"
                            className={cn(
                                'capitalize font-semibold px-3 py-1.5 text-sm border',
                                getSessionStatusColor(session.status)
                            )}
                        >
                            {t(`smsSessions.status.${session.status}`) !== `smsSessions.status.${session.status}`
                                ? t(`smsSessions.status.${session.status}`)
                                : session.status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Message Info */}
                    <Card className="border-muted/60 overflow-hidden pt-0">
                        <CardHeader className="bg-muted/30 py-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-bold">{t('smsSessions.labels.message_info') || t('Form.labels.message')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('Form.labels.phone')}</p>
                                    <p className="font-semibold" dir="ltr">{session?.recipient || '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('table.columns.created_at')}</p>
                                    <p className="font-semibold">{session?.created_at || '---'}</p>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('Form.labels.message')}</p>
                                <div className="p-4 bg-muted/30 rounded-lg border border-muted/60">
                                    <p className="text-sm whitespace-pre-wrap">{session?.message || '---'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Provider Response */}
                    {providerResponse && Object.keys(providerResponse).length > 0 && (
                        <Card className="border-muted/60 overflow-hidden pt-0">
                            <CardHeader className="bg-muted/30 py-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-bold">{t('paymentSessions.labels.provider_response')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
                                <pre className="text-xs font-mono bg-muted/20 p-4 rounded-lg overflow-auto max-h-96">
                                    {JSON.stringify(providerResponse, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Response */}
                    {session?.error && (
                        <Card className="border-red-200/60 overflow-hidden pt-0">
                            <CardHeader className="bg-red-50/30 py-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-500" />
                                    <CardTitle className="text-sm font-bold text-red-700">{t('status.failed')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4">
                                <div className="p-4 bg-red-50/50 rounded-lg border border-red-100 italic text-sm text-red-600">
                                    {typeof session.error === 'string' ? session.error : JSON.stringify(session.error)}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Provider Info */}
                    {provider && (
                        <Card className="border-muted/60 overflow-hidden group hover:border-primary/30 transition-colors pt-0 pb-0">
                            <CardHeader className="bg-muted/30 py-2 pb-2">
                                <div className="flex items-center gap-2 justify-center">
                                    <Shield className="h-3.5 w-3.5 text-primary" />
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('table.columns.provider')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <MessageSquare className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{provider.name || '---'}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{provider.identifier || '---'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="border-muted/60 overflow-hidden pt-0 pb-0">
                        <CardHeader className="bg-muted/30 py-2 pb-2">
                            <div className="flex items-center gap-2 justify-center">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('paymentSessions.labels.timeline')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-6 pt-4 relative">
                            <div className={cn(
                                "space-y-6 relative before:absolute before:top-[14px] before:bottom-[14px] before:w-[2px] before:bg-muted/80",
                                isRTL ? "before:right-[11px]" : "before:left-[11px]"
                            )}>
                                <div className="relative flex items-start gap-4 group">
                                    <div className="relative z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background border-2 border-blue-500/40 group-hover:border-blue-500 transition-colors shrink-0 mt-0.5">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-none mb-1">{t('table.createdAt')}</p>
                                        <p className="text-sm font-semibold text-blue-700/90">{session?.created_at || '---'}</p>
                                    </div>
                                </div>

                                {session?.status === 'delivered' && (
                                    <div className="relative flex items-start gap-4 group">
                                        <div className="relative z-10 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 border-2 border-emerald-500 group-hover:scale-110 transition-transform shrink-0 mt-0.5">
                                            <CheckCircle className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-none mb-1">{t('smsSessions.status.delivered')}</p>
                                            <p className="text-sm font-bold text-emerald-700">{session?.created_at || '---'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
