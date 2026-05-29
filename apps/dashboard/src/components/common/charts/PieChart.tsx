import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ecommerce/ui/components/card";
import { PieChartProps } from "@/types/components/charts";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartTooltip } from "./LinerChart";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }: any) => {
  // Move labels even further out to ensure no overlap and account for longer names
  const radius = outerRadius + 45;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Keep labels for everything unless it's truly zero
  if (percent === 0) return null;

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[10px] md:text-[11px] font-semibold fill-muted-foreground"
    >
      {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export function AnalyticsPieChart({ title, description, data, height = 400, className }: PieChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription>{description || " "}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              minAngle={15}
              labelLine={{ stroke: 'currentColor', strokeWidth: 1, opacity: 0.2 }}
              label={renderCustomizedLabel}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth={1}
                  className="outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: "30px", fontSize: "12px" }}
              formatter={(value) => <span className="inline-block px-1.5">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}