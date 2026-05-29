import { Avatar, AvatarFallback, AvatarImage } from "@ecommerce/ui/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Badge } from "@ecommerce/ui/components/badge";
import { User, Shield, Clock, Key, CheckCircle, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import ButtonCopy from "@ecommerce/ui/components/copy-button";
import { cn } from "@/lib/utils";
import { PaymentSession } from "../Config";

interface SidebarProps {
    session: PaymentSession;
    translateSdkKey: (key: string) => string;
}

export function SessionSidebar({ session, translateSdkKey }: SidebarProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === "rtl";
    const user = session?.user;
    const provider = session?.provider;
    const sdkParams = session?.sdk_parameters;

    return (
        <div className="space-y-6">
            {/* User Info */}
            {user && (
                <Card className="border-muted/60 overflow-hidden group hover:border-primary/30 transition-all pt-0 shadow-sm hover:shadow-md">
                    <CardHeader className="bg-muted/30 py-2.5 gap-0">
                        <div className="flex items-center gap-2 justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('common.user')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                        <Link
                            to="/users/show/$id"
                            /* @ts-ignore */
                            params={{ id: String(user.id) }}
                            className="flex flex-col items-center gap-4 group/avatar"
                        >
                            <div className="relative">
                                <Avatar className="h-20 w-20 border-1 border-background shadow-xl group-hover/avatar:scale-105 transition-transform duration-300">
                                    {user.image?.url && <AvatarImage src={user.image.url} alt={user.name || ''} className="object-cover" />}
                                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">
                                        {(user.name || user.email)?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-1">
                                {user.name && <h3 className="text-base font-black group-hover/avatar:text-primary transition-colors">{user.name}</h3>}
                                {user.email && <p className="text-xs text-muted-foreground font-medium italic break-all px-4">{user.email}</p>}
                                {user.phone && (
                                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-bold text-muted-foreground mt-1" dir="ltr">
                                        {user.phone}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Provider Info */}
            {provider && (
                <Card className="border-muted/60 overflow-hidden shadow-sm pt-0">
                    <CardHeader className="bg-muted/30 py-2.5 gap-0">
                        <div className="flex items-center gap-2 justify-center">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('paymentSessions.labels.provider')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                        <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-2xl border border-muted/40 transition-colors hover:bg-muted/30">
                            {provider.image ? (
                                <Avatar className="h-14 w-14 p-2 rounded-xl object-cover border-1 border-background shadow-sm">
                                    <AvatarImage src={provider.image.url} className="object-contain" alt={provider.name || ''} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-black">
                                        {(provider.name || provider.identifier)?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-background shadow-sm">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-sm truncate uppercase tracking-tight">{provider.name || t('paymentSessions.labels.unknown_provider')}</p>
                                    <Badge variant={provider.is_active ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 leading-none font-black uppercase">
                                        {provider.is_active ? t('status.active') : t('status.inactive')}
                                    </Badge>
                                </div>
                                {provider.identifier && <p className="text-[10px] text-muted-foreground font-mono font-bold">{provider.identifier}</p>}
                            </div>
                        </div>

                        {provider.settings && Object.keys(provider.settings).length > 0 && (
                            <div className="space-y-3 pt-1">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest px-1">{t('paymentSessions.labels.settings')}</p>
                                <div className="space-y-2">
                                    {Object.entries(provider.settings).map(([key, value]) => {
                                        if (value == null || value === '' || typeof value === 'object') return null;
                                        const isSecret = key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('token');
                                        return (
                                            <div key={key} className="space-y-1 group">
                                                <p className="text-[10px] text-muted-foreground/80 font-bold px-1">{translateSdkKey(key)}</p>
                                                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-xl border border-muted/40 group-hover:border-primary/20 transition-all">
                                                    <p className="text-[11px] font-mono truncate flex-1 text-muted-foreground/80" dir="ltr">
                                                        {isSecret ? '••••••••••••••••' : String(value)}
                                                    </p>
                                                    <ButtonCopy className="h-6 w-6 text-muted-foreground p-0 hover:bg-primary/10 rounded-lg" content={String(value)} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Timeline */}
            <Card className="border-muted/60 overflow-hidden shadow-sm pt-0">
                <CardHeader className="bg-muted/30 py-2.5 gap-0">
                    <div className="flex items-center gap-2 justify-center">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('paymentSessions.labels.timeline')}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 relative">
                    <div className={cn(
                        "space-y-8 relative before:absolute before:top-[12px] before:bottom-[12px] before:w-[2px] before:bg-gradient-to-b before:from-blue-500/20 before:via-indigo-500/20 before:to-emerald-500/20",
                        isRTL ? "before:right-[11px]" : "before:left-[11px]"
                    )}>
                        <TimelineItem
                            label={t('table.createdAt')}
                            date={session.created_at}
                            color="blue"
                            isRTL={isRTL}
                        />
                        <TimelineItem
                            label={t('table.updatedAt')}
                            date={session.updated_at}
                            color="indigo"
                            isRTL={isRTL}
                        />
                        {session.expires_at && !session.completed_at && (
                            <TimelineItem
                                label={t('table.expiresAt')}
                                date={session.expires_at}
                                color="amber"
                                isRTL={isRTL}
                                icon={<Clock className="h-3 w-3" />}
                            />
                        )}
                        {session.completed_at && (
                            <TimelineItem
                                label={t('paymentSessions.labels.completed_at')}
                                date={session.completed_at}
                                color="emerald"
                                isRTL={isRTL}
                                icon={<CheckCircle className="h-3.5 w-3.5" />}
                                isLast
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* SDK Parameters */}
            {sdkParams && Object.keys(sdkParams).length > 0 && (
                <Card className="border-muted/60 overflow-hidden shadow-sm pt-0">
                    <CardHeader className="bg-muted/30 py-2.5 gap-0">
                        <div className="flex items-center gap-2 justify-center">
                            <Key className="h-3.5 w-3.5 text-primary" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('paymentSessions.labels.sdk_params')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {Object.entries(sdkParams).map(([key, value]) => {
                            if (value == null || value === '') return null;
                            return (
                                <div key={key} className="space-y-1.5 group">
                                    <p className="text-[10px] text-muted-foreground/80 font-bold px-1">{translateSdkKey(key)}</p>
                                    <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-2xl border border-muted/50 group-hover:border-primary/20 transition-all">
                                        <p className="text-[11px] font-mono truncate flex-1 font-medium italic text-muted-foreground" dir="ltr">
                                            {String(value)}
                                        </p>
                                        <ButtonCopy className="h-7 w-7 text-muted-foreground p-0 hover:bg-primary/10 rounded-lg shrink-0" content={String(value)} />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function TimelineItem({ label, date, color, isRTL, icon, isLast }: {
    label: string;
    date?: string;
    color: string;
    isRTL: boolean;
    icon?: React.ReactNode;
    isLast?: boolean;
}) {
    if (!date) return null;

    const colors: Record<string, string> = {
        blue: "bg-blue-500 border-blue-500/40 text-blue-600",
        indigo: "bg-indigo-500 border-indigo-500/40 text-indigo-600",
        amber: "bg-amber-500 border-amber-500/40 text-amber-600",
        emerald: "bg-emerald-500 border-emerald-500/40 text-emerald-600"
    };

    return (
        <div className="relative flex items-start gap-4 group">
            <div className={cn(
                "relative z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background border-2 transition-all duration-300 group-hover:scale-110 shadow-sm",
                colors[color].split(' ')[1],
                isLast && "scale-110 border-none " + colors[color].split(' ')[0]
            )}>
                {icon ? (
                    <div className={cn("text-white", !isLast && colors[color].split(' ')[2])}>{icon}</div>
                ) : (
                    <div className={cn("h-2.2 w-2.2 rounded-full", isLast ? "bg-white" : colors[color].split(' ')[0])} />
                )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none mb-1.5", colors[color].split(' ')[2])}>{label}</p>
                <time className="text-xs font-bold text-muted-foreground/90">{date}</time>
            </div>
        </div>
    );
}
