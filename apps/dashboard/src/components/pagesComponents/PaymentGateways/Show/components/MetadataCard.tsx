import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MetadataCardProps {
    metadata: any[];
}

export function MetadataCard({ metadata }: MetadataCardProps) {
    const { t } = useTranslation();

    if (!metadata || metadata.length === 0) return null;

    return (
        <Card className="border-muted/60 overflow-hidden pt-0 shadow-sm">
            <CardHeader className="bg-muted/30 py-3 gap-0">
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">{t('common.metadata')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-5">
                <div className="grid gap-4">
                    {metadata.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-muted/5 border border-muted/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                            {typeof item === 'object' && item !== null ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(item).map(([k, v]) => (
                                        <div key={k} className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{k}</p>
                                            <p className="text-xs font-bold leading-relaxed">{String(v)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs font-mono font-bold break-all opacity-80">{String(item)}</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
