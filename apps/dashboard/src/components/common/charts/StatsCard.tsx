import { Card, CardContent, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import CountUp from "@/components/CountUp.jsx";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const viewedStats = new Set<string>();

export interface StatsSubItem {
  label: string;
  value: string | number;
}

interface StatsCardProps {
  title: string;
  value: number | string | React.ReactNode;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  subItems?: StatsSubItem[];
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  iconColor = "text-primary bg-primary/10",
  className,
  subItems,
}: StatsCardProps) {
  const { t } = useTranslation();
  const [isFirstVisit] = useState(!viewedStats.has(title));

  useEffect(() => {
    viewedStats.add(title);
  }, [title]);

  const [textColor, bgColor] = iconColor.includes(" ") ? iconColor.split(" ") : [iconColor, ""];

  return (
    <Card className={cn("py-4 px-0 group hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 ease-in-out", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg transition-all duration-300", bgColor || "bg-primary/10")}>
          <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:rotate-12", textColor || "text-primary")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? (
            <CountUp to={value} from={isFirstVisit ? 0 : value} separator="," duration={2} />
          ) : (
            value
          )}
        </div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {changeType === "increase" ? (
              <ArrowUpRight className="me-1 h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="me-1 h-3 w-3 text-destructive" />
            )}
            <span className={changeType === "increase" ? "text-success" : "text-destructive"}>
              {change}
            </span>
          </div>
        )}

        {subItems && subItems.length > 0 && (
          <div className="pt-3 mt-3 border-t flex flex-wrap gap-x-3 gap-y-1">
            {subItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 min-w-fit">
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", textColor || "bg-primary")} />
                <span className="text-[11px] font-bold">{item.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
