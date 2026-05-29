import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { ChartTooltip } from "./LinerChart";
import { BarChartProps } from "@/types/components/charts";

import { useTranslation } from "react-i18next";

export function AnalyticsBarChart({ title, description, data, barConfig, xAxisKey, height = 300, className }: BarChartProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} className="text-xs fill-muted-foreground" />
            <YAxis className="text-xs fill-muted-foreground" orientation={isRtl ? 'right' : 'left'} tickMargin={isRtl ? 16 : 6} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
            <Bar
              dataKey={barConfig.dataKey}
              fill={barConfig.fill || "hsl(var(--primary))"}
              radius={barConfig.radius || [4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Example data
const trafficData = [
  { month: "Jan", desktop: 186, mobile: 120, tablet: 40 },
  { month: "Feb", desktop: 205, mobile: 140, tablet: 50 },
  { month: "Mar", desktop: 237, mobile: 180, tablet: 60 },
  { month: "Apr", desktop: 273, mobile: 200, tablet: 70 },
  { month: "May", desktop: 209, mobile: 170, tablet: 55 },
  { month: "Jun", desktop: 214, mobile: 190, tablet: 65 },
];

const deviceData = [
  { name: "Desktop", value: 60, color: "hsl(var(--primary))" },
  { name: "Mobile", value: 30, color: "hsl(var(--secondary))" },
  { name: "Tablet", value: 10, color: "hsl(var(--accent))" },
];

const conversionData = [
  { day: "Mon", conversions: 24, visitors: 400 },
  { day: "Tue", conversions: 32, visitors: 450 },
  { day: "Wed", conversions: 28, visitors: 380 },
  { day: "Thu", conversions: 45, visitors: 520 },
  { day: "Fri", conversions: 52, visitors: 600 },
  { day: "Sat", visitors: 350, conversions: 18 },
  { day: "Sun", visitors: 300, conversions: 15 },
];

const userActivityData = [
  { day: "Mon", users: 1200 },
  { day: "Tue", users: 1900 },
  { day: "Wed", users: 800 },
  { day: "Thu", users: 1600 },
  { day: "Fri", users: 2200 },
  { day: "Sat", users: 1400 },
  { day: "Sun", users: 1000 },
];

export function AnalyticsDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* <AnalyticsLineChart
        title="Traffic Sources"
        description="Website traffic by device type over time"
        data={trafficData}
        xAxisKey="month"
        lines={[
          { dataKey: "desktop", stroke: "hsl(var(--primary))" },
          { dataKey: "mobile", stroke: "hsl(var(--success))" },
          { dataKey: "tablet", stroke: "hsl(var(--warning))" }
        ]}
        className="col-span-2"
      />
      
      <AnalyticsPieChart
        title="Device Usage"
        description="Distribution of users by device type"
        data={deviceData}
      />
      
      <AnalyticsAreaChart
        title="Conversion Rate"
        description="Daily conversion rate this week"
        data={conversionData}
        xAxisKey="day"
        areaKey="conversions"
        stroke="hsl(var(--primary))"
        fill="hsl(var(--primary))"
      />
       */}

    </div>
  );
}