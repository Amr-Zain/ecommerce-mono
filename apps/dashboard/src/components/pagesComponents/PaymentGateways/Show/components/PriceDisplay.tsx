import { cn } from "@/lib/utils";
import { SARIcon } from "@/components/common/Icons";

interface PriceDisplayProps {
    amount: number | string | undefined | null;
    currencyCode?: string | undefined | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function PriceDisplay({
    amount,
    currencyCode = "SAR",
    size = "sm",
    className
}: PriceDisplayProps) {
    if (amount == null) return <span>-</span>;

    const val = typeof amount === 'string' ? parseFloat(amount) : amount;

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4"
    };

    const textSizes = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    return (
        <span className={cn("inline-flex items-center gap-1 font-bold tabular-nums", textSizes[size], className)}>
            {val.toFixed(2)}
            {currencyCode === 'SAR' ? (
                <SARIcon className={cn("shrink-0", iconSizes[size])} />
            ) : (
                <span className="text-[10px] uppercase text-muted-foreground font-black shrink-0">{currencyCode || 'SAR'}</span>
            )}
        </span>
    );
}
