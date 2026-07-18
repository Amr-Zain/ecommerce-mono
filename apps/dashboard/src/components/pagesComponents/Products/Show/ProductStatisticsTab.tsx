import { Badge } from '@ecommerce/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import {
  AlertTriangle,
  Boxes,
  CreditCard,
  DollarSign,
  EyeOff,
  Heart,
  History,
  Package,
  RotateCcw,
  ShoppingCart,
  Star,
  Users,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { ApiResponseBase } from '@/types/api/http'
import type { ProductStatistics } from '@/types/api/product'
import { AnalyticsBarChart } from '@/components/common/charts/BarChart'
import { AnalyticsLineChart } from '@/components/common/charts/LinerChart'
import { StatsCard } from '@/components/common/charts/StatsCard'
import { SARIcon } from '@/components/common/Icons'
import useFetch from '@/hooks/UseFetch'
import { queryKeys } from '@/util/queryKeysFactory'

export function ProductStatisticsTab({ productId }: { productId: number }) {
  const { t, i18n } = useTranslation()
  const { data } = useFetch<ApiResponseBase<ProductStatistics>>({
    queryKey: queryKeys.products.statistics(productId),
    endpoint: `products/${productId}/statistics`,
    suspense: true,
  })
  const statistics = data.data
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.language).format(value)
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(
      value,
    )
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
      new Date(value),
    )

  const salesChart = statistics.sales_time_series.map((item) => ({
    ...item,
    label: new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${item.date}T00:00:00`)),
  }))

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title={t('productShow.stats.totalSold')}
          value={statistics.sales.total_sold}
          change={`${statistics.sales.sales_trend}%`}
          changeType={
            statistics.sales.sales_trend >= 0 ? 'increase' : 'decrease'
          }
          icon={ShoppingCart}
          iconColor="text-blue-600 bg-blue-500/10"
          subItems={[
            {
              label: t('productShow.stats.orders', 'Orders'),
              value: statistics.sales.orders_count,
            },
            {
              label: t('productShow.stats.customers', 'Customers'),
              value: statistics.sales.customers_count,
            },
          ]}
        />
        <StatsCard
          title={t('productShow.stats.totalRevenue')}
          value={
            <span className="inline-flex items-center gap-1">
              {money(statistics.sales.total_revenue)}{' '}
              <SARIcon className="size-5 opacity-70" />
            </span>
          }
          icon={DollarSign}
          iconColor="text-emerald-600 bg-emerald-500/10"
          subItems={[
            {
              label: t('productShow.stats.avgOrderValue', 'Avg order'),
              value: money(statistics.sales.average_order_value),
            },
            {
              label: t('productShow.stats.avgSellingPrice', 'Avg unit'),
              value: money(statistics.sales.average_selling_price),
            },
          ]}
        />
        <StatsCard
          title={t('productShow.stats.available')}
          value={statistics.inventory.available_stock}
          icon={Package}
          iconColor="text-violet-600 bg-violet-500/10"
          subItems={[
            {
              label: t('productShow.reserved'),
              value: statistics.inventory.reserved_stock,
            },
            {
              label: t('productShow.stats.outOfStockVariants', 'Out of stock'),
              value: statistics.inventory.out_of_stock_variants,
            },
          ]}
        />
        <StatsCard
          title={t('productShow.reviews')}
          value={`${statistics.reviews.average_rating} / 5`}
          icon={Star}
          iconColor="text-amber-600 bg-amber-500/10"
          subItems={[
            {
              label: t('productShow.totalReviews'),
              value: statistics.reviews.total_count,
            },
            {
              label: t('dashboard.pendingApproval'),
              value: statistics.reviews.pending_count,
            },
          ]}
        />
        <StatsCard
          title={t('productShow.stats.liveInterest', 'Live interest')}
          value={
            statistics.engagement.wishlist_count +
            statistics.engagement.carts_count
          }
          icon={Heart}
          iconColor="text-pink-600 bg-pink-500/10"
          subItems={[
            {
              label: t('productShow.stats.wishlist'),
              value: statistics.engagement.wishlist_count,
            },
            {
              label: t('productShow.stats.activeCarts', 'Active carts'),
              value: statistics.engagement.carts_count,
            },
            {
              label: t('productShow.stats.cartUnits', 'Cart units'),
              value: statistics.engagement.cart_additions,
            },
          ]}
        />
      </div>

      {!statistics.engagement.view_tracking_available && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardContent className="flex gap-3 py-4 text-sm">
            <EyeOff className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">
                {t('productShow.telemetry.title', 'Telemetry coverage')}
              </p>
              <p className="text-muted-foreground">
                {t(
                  'productShow.telemetry.description',
                  'Page views, conversion rate, and actor-level product edits are not recorded yet. Sales use paid, non-cancelled orders; cart and wishlist figures show the current state.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsLineChart
          title={t('productShow.charts.revenue', 'Revenue trend')}
          description={t(
            'productShow.charts.last30Days',
            'Paid product revenue during the last 30 days',
          )}
          data={salesChart}
          xAxisKey="label"
          lines={[
            { dataKey: 'revenue', stroke: 'var(--chart-1)', strokeWidth: 3 },
          ]}
          height={320}
        />
        <AnalyticsBarChart
          title={t('productShow.charts.units', 'Units sold')}
          description={t(
            'productShow.charts.unitsDescription',
            'Daily paid quantity during the last 30 days',
          )}
          data={salesChart}
          xAxisKey="label"
          barConfig={{ dataKey: 'quantity', fill: 'var(--chart-2)' }}
          height={320}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownCard
          title={t(
            'productShow.breakdowns.orderStatus',
            'Sales by order status',
          )}
          items={statistics.order_status_breakdown}
          money={money}
        />
        <BreakdownCard
          title={t(
            'productShow.breakdowns.paymentMethod',
            'Sales by payment method',
          )}
          items={statistics.payment_method_breakdown}
          money={money}
          icon="payment"
        />
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="size-4 text-primary" />
            {t('productShow.variantPerformance.title', 'Variant performance')}
          </CardTitle>
          <CardDescription>
            {t(
              'productShow.variantPerformance.description',
              'All-time paid sales compared with live stock and reservations',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-start">
                  {t('table.columns.sku', 'SKU')}
                </th>
                <th className="px-3 py-3 text-start">
                  {t('Form.labels.attributes')}
                </th>
                <th className="px-3 py-3 text-end">{t('productShow.sold')}</th>
                <th className="px-3 py-3 text-end">
                  {t('productShow.stats.totalRevenue')}
                </th>
                <th className="px-3 py-3 text-end">
                  {t('productShow.stats.available')}
                </th>
                <th className="px-3 py-3 text-end">
                  {t('productShow.reserved')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {statistics.variant_performance.map((variant) => (
                <tr key={variant.id} className="hover:bg-muted/30">
                  <td className="px-3 py-3 font-mono text-xs">
                    {variant.sku || `#${variant.id}`}{' '}
                    {variant.is_default && (
                      <Badge variant="secondary" className="ms-1 text-[9px]">
                        {t('common.default', 'Default')}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {variant.attributes
                      .map((item) => `${item.attribute}: ${item.value}`)
                      .join(' · ') || '—'}
                  </td>
                  <td className="px-3 py-3 text-end font-semibold">
                    {number(variant.sold_quantity)}
                  </td>
                  <td className="px-3 py-3 text-end font-semibold">
                    {money(variant.revenue)}
                  </td>
                  <td className="px-3 py-3 text-end">
                    <Badge
                      variant={
                        variant.available_stock > 0 ? 'outline' : 'destructive'
                      }
                    >
                      {variant.available_stock}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-end">
                    {variant.reserved_stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-primary" />
              {t('productShow.audit.title', 'Inventory & price audit')}
            </CardTitle>
            <CardDescription>
              {t(
                'productShow.audit.description',
                'Recent system-recorded stock movements and price changes',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <AuditList
              title={t('productShow.audit.inventory', 'Inventory movements')}
              empty={t('Text.noResults')}
              items={statistics.recent_activity.inventory_logs.map((item) => ({
                id: `inventory-${item.id}`,
                title: `${item.variant.sku || `#${item.variant.id}`} · ${item.reason}`,
                value: `${item.change_amount > 0 ? '+' : ''}${item.change_amount}`,
                detail: `${item.previous_stock} → ${item.new_stock}`,
                date: date(item.created_at),
                tone: item.change_amount >= 0 ? 'positive' : 'negative',
              }))}
            />
            <AuditList
              title={t('productShow.audit.prices', 'Price changes')}
              empty={t('Text.noResults')}
              items={statistics.recent_activity.price_history.map((item) => ({
                id: `price-${item.id}`,
                title: item.variant.sku || `#${item.variant.id}`,
                value: `${money(item.old_price)} → ${money(item.new_price)}`,
                detail: t('productShow.audit.price', 'Price'),
                date: date(item.created_at),
                tone:
                  item.new_price >= item.old_price ? 'positive' : 'negative',
              }))}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="size-4 text-primary" />
              {t('productShow.returns.title', 'Returns')}
            </CardTitle>
            <CardDescription>
              {t(
                'productShow.returns.description',
                'Requests that include this product',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label={t('productShow.returns.requests', 'Requests')}
              value={statistics.returns.requests_count}
            />
            <MetricRow
              label={t(
                'productShow.returns.requestedQty',
                'Requested quantity',
              )}
              value={statistics.returns.requested_quantity}
            />
            <MetricRow
              label={t('productShow.returns.acceptedQty', 'Accepted quantity')}
              value={statistics.returns.accepted_quantity}
            />
            <div className="flex flex-wrap gap-2 border-t pt-4">
              {statistics.returns.by_status.map((item) => (
                <Badge
                  key={item.status}
                  variant="outline"
                  className="capitalize"
                >
                  {item.status.replaceAll('_', ' ')} · {item.count}
                </Badge>
              ))}
              {!statistics.returns.by_status.length && (
                <span className="text-sm text-muted-foreground">
                  {t('Text.noResults')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              {t('productShow.revenue.title', 'Revenue checkpoints')}
            </CardTitle>
            <CardDescription>
              {t(
                'productShow.revenue.description',
                'Paid, non-cancelled product revenue',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label={t('productShow.revenue.today', 'Today')}
              value={money(statistics.sales.revenue_breakdown.today)}
            />
            <MetricRow
              label={t('productShow.revenue.week', 'Last 7 days')}
              value={money(statistics.sales.revenue_breakdown.this_week)}
            />
            <MetricRow
              label={t('productShow.revenue.month', 'This month')}
              value={money(statistics.sales.revenue_breakdown.this_month)}
            />
            <MetricRow
              label={t('productShow.revenue.year', 'This year')}
              value={money(statistics.sales.revenue_breakdown.this_year)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              {t('productShow.reviewsDistribution', 'Rating distribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const key =
                `${rating}_star` as keyof ProductStatistics['reviews']['rating_distribution']
              const count = statistics.reviews.rating_distribution[key]
              const percentage = statistics.reviews.total_count
                ? Math.round((count / statistics.reviews.total_count) * 100)
                : 0
              return (
                <div
                  key={rating}
                  className="grid grid-cols-[36px_1fr_64px] items-center gap-3"
                >
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    {rating}
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-end text-xs text-muted-foreground">
                    {count} · {percentage}%
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="size-4 text-pink-500" />
              {t('productShow.interest.title', 'Recent customer interest')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statistics.recent_activity.reviews.slice(0, 3).map((review) => (
              <Link
                key={`review-${review.id}`}
                to={`/reviews/show/${review.id}` as never}
                className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-semibold">{review.user_name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {review.comment || t('productShow.noReviews')}
                  </p>
                </div>
                <Badge variant="outline">{review.rating} ★</Badge>
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {statistics.recent_activity.wishlists
                .slice(0, 5)
                .map((wishlist) => (
                  <Badge
                    key={`wishlist-${wishlist.id}`}
                    variant="secondary"
                    className="bg-pink-500/10 text-pink-700"
                  >
                    {wishlist.user_name}
                  </Badge>
                ))}
            </div>
            {!statistics.recent_activity.reviews.length &&
              !statistics.recent_activity.wishlists.length && <Empty />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-primary" />
              {t('productShow.customers.title', 'Top customers')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statistics.top_customers.map((customer, index) => (
              <Link
                key={customer.user_id}
                to="/users/show/$id"
                params={{ id: String(customer.user_id) }}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-semibold">
                    {index + 1}. {customer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer.orders} {t('productShow.stats.orders', 'orders')}{' '}
                    · {customer.quantity}{' '}
                    {t('productShow.stats.units', 'units')}
                  </p>
                </div>
                <span className="font-semibold">{money(customer.revenue)}</span>
              </Link>
            ))}
            {!statistics.top_customers.length && <Empty />}
          </CardContent>
        </Card>

        <Card className="shadow-none xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="size-4 text-primary" />
              {t('productShow.activity.orders')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {statistics.recent_activity.orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/show/${order.id}` as never}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-semibold">#{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.user_name} · {date(order.created_at)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-semibold">{money(order.total)}</p>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
            {!statistics.recent_activity.orders.length && <Empty />}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InventoryMetric
          icon={Package}
          label={t('productShow.stats.currentStock', 'On-hand stock')}
          value={number(statistics.inventory.current_stock)}
        />
        <InventoryMetric
          icon={AlertTriangle}
          label={t('productShow.stats.stockValue')}
          value={money(statistics.inventory.stock_value)}
          suffix={<SARIcon className="size-4" />}
        />
        <InventoryMetric
          icon={DollarSign}
          label={t('productShow.stats.retailValue', 'Retail value')}
          value={money(statistics.inventory.retail_value)}
          suffix={<SARIcon className="size-4" />}
        />
        <InventoryMetric
          icon={CreditCard}
          label={t('productShow.stats.avgOrderQty')}
          value={number(statistics.sales.average_order_qty)}
        />
      </div>
    </div>
  )
}

function BreakdownCard({
  title,
  items,
  money,
  icon = 'orders',
}: {
  title: string
  items: ProductStatistics['order_status_breakdown']
  money: (value: number) => string
  icon?: 'orders' | 'payment'
}) {
  const Icon = icon === 'payment' ? CreditCard : ShoppingCart
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3"
          >
            <span className="font-medium capitalize">
              {item.name.replaceAll('_', ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.orders} orders · {item.quantity} units
            </span>
            <span className="font-semibold">{money(item.revenue)}</span>
          </div>
        ))}
        {!items.length && <Empty />}
      </CardContent>
    </Card>
  )
}

function AuditList({
  title,
  items,
  empty,
}: {
  title: string
  empty: string
  items: Array<{
    id: string
    title: string
    value: string
    detail: string
    date: string
    tone: string
  }>
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between rounded-lg border p-3"
        >
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.detail} · {item.date}
            </p>
          </div>
          <Badge variant={item.tone === 'negative' ? 'destructive' : 'outline'}>
            {item.value}
          </Badge>
        </div>
      ))}
      {!items.length && (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  )
}

function MetricRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  )
}

function InventoryMetric({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof Package
  label: string
  value: string
  suffix?: React.ReactNode
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="flex items-center gap-1 text-xl font-bold">
            {value}
            {suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Empty() {
  const { t } = useTranslation()
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">
      {t('Text.noResults')}
    </p>
  )
}
