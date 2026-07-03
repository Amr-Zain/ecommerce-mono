import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@ecommerce/ui/components/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { ChartConfig } from '@ecommerce/ui/components/chart'
import type { DashboardAnalytics } from '@/types/api/dashboard'
import { SARIcon } from '@/components/common/Icons'

const salesConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  netRevenue: { label: 'Net Revenue', color: 'var(--chart-2)' },
  orders: { label: 'Orders', color: 'var(--chart-3)' },
} satisfies ChartConfig

const stockConfig = {
  count: { label: 'Count', color: 'var(--chart-1)' },
} satisfies ChartConfig

const loyaltyConfig = {
  earned: { label: 'Earned', color: 'var(--chart-1)' },
  redeemed: { label: 'Redeemed', color: 'var(--chart-5)' },
} satisfies ChartConfig

const customerConfig = {
  newUsers: { label: 'New Users', color: 'var(--chart-1)' },
  activeUsers: { label: 'Active Users', color: 'var(--chart-2)' },
} satisfies ChartConfig

const reviewConfig = {
  count: { label: 'Reviews', color: 'var(--chart-4)' },
} satisfies ChartConfig

const pieColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface ChartBlockProps {
  title: string
  description?: string
  children: ReactNode
}

function ChartBlock({ title, description, children }: ChartBlockProps) {
  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyChart() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
      {t('dashboard.noChartData')}
    </div>
  )
}

export function SalesTrendChart({
  data,
  className,
}: {
  data: DashboardAnalytics['salesTrend']
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <ChartBlock
        title={t('dashboard.salesTrend')}
        description={t('dashboard.salesTrendDesc')}
      >
        {data.length ? (
          <ChartContainer config={salesConfig} className="min-h-72 w-full">
            <AreaChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="var(--color-revenue)"
                fillOpacity={0.2}
                stroke="var(--color-revenue)"
                stackId="a"
              />
              <Area
                dataKey="netRevenue"
                type="monotone"
                fill="var(--color-netRevenue)"
                fillOpacity={0.2}
                stroke="var(--color-netRevenue)"
                stackId="b"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartBlock>
    </div>
  )
}

export function RevenueLineChart({
  data,
  className,
}: {
  data: DashboardAnalytics['salesTrend']
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <ChartBlock
        title={t('dashboard.revenueLine')}
        description={t('dashboard.revenueLineDesc')}
      >
        {data.length ? (
          <ChartContainer config={salesConfig} className="min-h-72 w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                dataKey="netRevenue"
                type="monotone"
                stroke="var(--color-netRevenue)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                dataKey="orders"
                type="monotone"
                stroke="var(--color-orders)"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartBlock>
    </div>
  )
}

export function OrdersDonutChart({
  data,
  title,
  description,
}: {
  data: DashboardAnalytics['ordersByStatus']
  title: string
  description?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return (
    <ChartBlock title={title} description={description}>
      {data.length ? (
        <div className="space-y-4">
          <ChartContainer
            config={{ value: { label: title } }}
            className="min-h-64 w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
          <BreakdownSummary data={data} total={total} />
        </div>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function InventoryStockChart({
  data,
}: {
  data: DashboardAnalytics['inventoryStockStates']
}) {
  const { t } = useTranslation()
  return (
    <ChartBlock
      title={t('dashboard.inventoryStockStates')}
      description={t('dashboard.inventoryStockStatesDesc')}
    >
      {data.length ? (
        <ChartContainer config={stockConfig} className="min-h-72 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="state"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={6} />
          </BarChart>
        </ChartContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function RadialBreakdownChart({
  data,
  title,
  description,
}: {
  data: Array<{ name: string; value: number }>
  title: string
  description?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radialData = data.map((item, index) => ({
    ...item,
    fill: pieColors[index % pieColors.length],
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }))

  return (
    <ChartBlock title={title} description={description}>
      {radialData.length ? (
        <div className="space-y-4">
          <ChartContainer
            config={{ value: { label: title } }}
            className="min-h-64 w-full"
          >
            <RadialBarChart
              data={radialData}
              innerRadius={30}
              outerRadius={110}
              barSize={16}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[
                  0,
                  Math.max(...radialData.map((item) => item.value), 1),
                ]}
                tick={false}
              />
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <RadialBar dataKey="value" background cornerRadius={8}>
                <LabelList
                  dataKey="name"
                  position="insideStart"
                  className="fill-background capitalize"
                  fontSize={11}
                />
              </RadialBar>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </RadialBarChart>
          </ChartContainer>
          <BreakdownSummary data={radialData} total={total} />
        </div>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

function BreakdownSummary({
  data,
  total,
}: {
  data: Array<{ name: string; value: number; fill?: string }>
  total: number
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data.map((item, index) => {
        const percentage =
          total > 0 ? Math.round((item.value / total) * 100) : 0
        return (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    item.fill ?? pieColors[index % pieColors.length],
                }}
              />
              <span className="truncate font-medium">{item.name}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {item.value} ({percentage}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function CustomerLineChart({
  data,
}: {
  data: DashboardAnalytics['customerGrowth']
}) {
  const { t } = useTranslation()
  return (
    <ChartBlock
      title={t('dashboard.customerLine')}
      description={t('dashboard.customerGrowthDesc')}
    >
      {data.length ? (
        <ChartContainer config={customerConfig} className="min-h-72 w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="newUsers"
              type="monotone"
              stroke="var(--color-newUsers)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              dataKey="activeUsers"
              type="monotone"
              stroke="var(--color-activeUsers)"
              strokeWidth={3}
              dot={false}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function ReviewRatingsChart({
  data,
}: {
  data: DashboardAnalytics['reviewRatings']
}) {
  const { t } = useTranslation()
  return (
    <ChartBlock
      title={t('dashboard.ratingDistribution')}
      description={t('dashboard.reviewsByRating')}
    >
      {data.length ? (
        <ChartContainer config={reviewConfig} className="min-h-72 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="rating"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={6} />
          </BarChart>
        </ChartContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function CustomerGrowthChart({
  data,
}: {
  data: DashboardAnalytics['customerGrowth']
}) {
  const { t } = useTranslation()
  return (
    <ChartBlock
      title={t('dashboard.customerGrowth')}
      description={t('dashboard.customerGrowthDesc')}
    >
      {data.length ? (
        <ChartContainer config={customerConfig} className="min-h-72 w-full">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="newUsers"
              type="monotone"
              fill="var(--color-newUsers)"
              fillOpacity={0.2}
              stroke="var(--color-newUsers)"
            />
            <Area
              dataKey="activeUsers"
              type="monotone"
              fill="var(--color-activeUsers)"
              fillOpacity={0.2}
              stroke="var(--color-activeUsers)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function LoyaltyTrendChart({
  data,
}: {
  data: DashboardAnalytics['loyaltyPointsTrend']
}) {
  const { t } = useTranslation()
  return (
    <ChartBlock
      title={t('dashboard.loyaltyPointsTrend')}
      description={t('dashboard.loyaltyPointsTrendDesc')}
    >
      {data.length ? (
        <ChartContainer config={loyaltyConfig} className="min-h-72 w-full">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="earned"
              type="monotone"
              fill="var(--color-earned)"
              fillOpacity={0.2}
              stroke="var(--color-earned)"
            />
            <Area
              dataKey="redeemed"
              type="monotone"
              fill="var(--color-redeemed)"
              fillOpacity={0.2}
              stroke="var(--color-redeemed)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      ) : (
        <EmptyChart />
      )}
    </ChartBlock>
  )
}

export function BusinessMetricsGrid({
  metrics,
}: {
  metrics?: DashboardAnalytics['businessMetrics']
}) {
  const { t } = useTranslation()
  const items = [
    {
      label: t('dashboard.metrics.grossRevenue'),
      value: metrics?.grossRevenue ?? 0,
      suffix: <SARIcon className="size-4 text-muted-foreground" />,
    },
    {
      label: t('dashboard.metrics.netRevenue'),
      value: metrics?.netRevenue ?? 0,
      suffix: <SARIcon className="size-4 text-muted-foreground" />,
    },
    {
      label: t('dashboard.metrics.averageOrderValue'),
      value: metrics?.averageOrderValue ?? 0,
      suffix: <SARIcon className="size-4 text-muted-foreground" />,
    },
    {
      label: t('dashboard.metrics.refundRate'),
      value: `${metrics?.refundRate ?? 0}%`,
    },
    {
      label: t('dashboard.metrics.repeatCustomerRate'),
      value: `${metrics?.repeatCustomerRate ?? 0}%`,
    },
    {
      label: t('dashboard.metrics.reviewApprovalRate'),
      value: `${metrics?.reviewApprovalRate ?? 0}%`,
    },
    {
      label: t('dashboard.metrics.inventoryAtRisk'),
      value: metrics?.inventoryAtRisk ?? 0,
    },
    {
      label: t('dashboard.metrics.pendingOperations'),
      value: metrics?.pendingOperations ?? 0,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-muted/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <div className="mt-2 flex items-center gap-1 text-2xl font-bold">
              {item.value}
              {item.suffix}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function OperationalAlertsCard({
  alerts,
}: {
  alerts?: DashboardAnalytics['operationalAlerts']
}) {
  const { t } = useTranslation()
  const rows = [
    {
      label: t('dashboard.alerts.pendingPayments'),
      value: alerts?.pendingPaymentsCount ?? 0,
      detail: `${alerts?.pendingPaymentsAmount ?? 0}`,
    },
    {
      label: t('dashboard.alerts.pendingReviews'),
      value: alerts?.pendingReviews ?? 0,
    },
    {
      label: t('dashboard.alerts.openTickets'),
      value: alerts?.openTickets ?? 0,
    },
    {
      label: t('dashboard.alerts.openReturns'),
      value: alerts?.openReturns ?? 0,
      detail: `${alerts?.refundRequestsValue ?? 0}`,
    },
    {
      label: t('dashboard.alerts.openExchanges'),
      value: alerts?.openExchanges ?? 0,
    },
    {
      label: t('dashboard.alerts.stockRisk'),
      value:
        (alerts?.lowStockVariants ?? 0) + (alerts?.outOfStockVariants ?? 0),
    },
  ]

  return (
    <ChartBlock
      title={t('dashboard.operationalAlerts')}
      description={t('dashboard.operationalAlertsDesc')}
    >
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{row.label}</p>
              {row.detail && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  {row.detail}
                  <SARIcon className="size-3" />
                </p>
              )}
            </div>
            <span className="text-lg font-bold">{row.value}</span>
          </div>
        ))}
      </div>
    </ChartBlock>
  )
}
