import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { AreaChartProps } from "@/types/components/charts";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { ChartTooltip } from "./LinerChart";


export function  AnalyticsAreaChart({ title, description, data, areaKey, xAxisKey, stroke, fill, height = 300, className }: AreaChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip content={<ChartTooltip />} />
            <Area
                type="monotone"
                dataKey={areaKey}
                stroke={stroke}
                fill={fill}
                fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
