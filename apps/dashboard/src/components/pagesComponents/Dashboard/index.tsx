import {
  Users,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  CreditCard,
  Gift,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  PlusCircle,
  UserX,
  Globe2,
} from 'lucide-react'
import { StatsCard } from '@/components/common/charts/StatsCard'
import { useTranslation } from 'react-i18next'
import {
  DashboardExportDataset,
  DashboardQueryParams,
  DashboardStatistics,
} from '@/types/api/dashboard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { SARIcon } from '@/components/common/Icons'
import { TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'
import { AnalyticsBarChart } from '@/components/common/charts/BarChart'
import { AnalyticsPieChart } from '@/components/common/charts/PieChart'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Variants, motion } from 'motion/react'
import { lazy, Suspense, useMemo, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { DashboardFilters } from './DashboardFilters'
import {
  BusinessMetricsGrid,
  CustomerGrowthChart,
  InventoryStockChart,
  LoyaltyTrendChart,
  OperationalAlertsCard,
  RadialBreakdownChart,
  RevenueLineChart,
  SalesTrendChart,
} from './AnalyticsCharts'

const GlobeTab = lazy(() =>
  import('./GlobeTab').then((m) => ({ default: m.GlobeTab })),
)

interface DashboardProps {
  data?: DashboardStatistics
  hasHomePermission: boolean
  filters?: DashboardQueryParams
}

export function Dashboard({
  data,
  hasHomePermission,
  filters,
}: DashboardProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { tab: activeTab = 'overview' } = useSearch({ from: '/_main/' })
  const exportDataset: DashboardExportDataset =
    activeTab === 'globe'
      ? 'geo'
      : (['overview', 'sales', 'customers', 'inventory', 'reviews', 'loyalty'].includes(
            activeTab,
          )
          ? activeTab
          : 'overview') as DashboardExportDataset
  // Latch: once true, keep Globe mounted (avoid WebGL teardown/rebuild on tab switch)
  const globeEverVisited = useRef(activeTab === 'globe')
  if (activeTab === 'globe') globeEverVisited.current = true

  const handleTabChange = useCallback(
    (value: string) => {
      navigate({
        to: '.',
        search: (prev: any) => ({ ...prev, tab: value }),
        replace: true,
      })
    },
    [navigate],
  )

  const handleFiltersChange = useCallback(
    (next: DashboardQueryParams) => {
      navigate({
        to: '.',
        search: (prev: any) => cleanSearchParams({ ...prev, ...next }),
        replace: true,
      })
    },
    [navigate],
  )

  const tabsItems = useMemo(
    () => [
      {
        id: 'overview',
        icon: LayoutDashboard,
        label: t('dashboard.tabs.overview'),
        color: 'text-primary',
      },
      {
        id: 'sales',
        icon: ShoppingCart,
        label: t('dashboard.tabs.sales'),
        color: 'text-emerald-500',
      },
      {
        id: 'customers',
        icon: Users,
        label: t('dashboard.tabs.customers'),
        color: 'text-blue-500',
      },
      {
        id: 'inventory',
        icon: Package,
        label: t('dashboard.tabs.inventory'),
        color: 'text-orange-500',
      },
      {
        id: 'reviews',
        icon: Star,
        label: t('dashboard.tabs.reviews'),
        color: 'text-yellow-500',
      },
      {
        id: 'loyalty',
        icon: Gift,
        label: t('dashboard.tabs.loyalty'),
        color: 'text-purple-500',
      },
      {
        id: 'globe',
        icon: Globe2,
        label: t('dashboard.tabs.globe'),
        color: 'text-cyan-500',
      },
    ],
    [t],
  )

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  }

  // Data for Charts
  const userTypeData = useMemo(
    () =>
      Object.entries(data?.users?.by_type || {})
        .filter(([name]) => name && name !== 'null' && name !== 'undefined')
        .map(([name, value], idx) => {
          const colors = [
            'var(--chart-1)',
            'var(--chart-2)',
            'var(--chart-3)',
            'var(--chart-4)',
            'var(--chart-5)',
          ]
          return {
            name: t(`users.${name}`),
            value,
            color: colors[idx % colors.length],
          }
        }),
    [data?.users?.by_type, t],
  )

  const orderStatusData = useMemo(
    () =>
      Object.entries(data?.orders?.by_status || {})
        .filter(([name]) => name && name !== 'null' && name !== 'undefined')
        .map(([name, value], idx) => {
          const colors = {
            open: 'var(--chart-1)',
            cancelled: 'var(--chart-5)',
            closed: 'var(--chart-2)',
            pending: 'var(--chart-3)',
          }
          return {
            name: t(`status.${name}`),
            value,
            color:
              colors[name as keyof typeof colors] ||
              `var(--chart-${(idx % 5) + 1})`,
          }
        }),
    [data?.orders?.by_status, t],
  )

  const ratingData = useMemo(
    () =>
      Object.entries(data?.reviews?.rating_distribution || {})
        .map(([rating, count]) => ({
          rating: `${rating} ${t('common.star')}`,
          count,
        }))
        .sort((a, b) => b.rating.localeCompare(a.rating)),
    [data?.reviews?.rating_distribution, t],
  )

  const analytics = useMemo(
    () => ({
      salesTrend: data?.analytics?.salesTrend ?? [],
      ordersByStatus: labelNameValuePoints(
        data?.analytics?.ordersByStatus,
        (name) =>
          translateWithFallback(t, `orders.status.${name}`, humanizeKey(name)),
      ),
      paymentHealth: labelNameValuePoints(
        data?.analytics?.paymentHealth,
        (name) =>
          translateWithFallback(
            t,
            `orders.paymentStatus.${name}`,
            humanizeKey(name),
          ),
      ),
      customerSegments: labelNameValuePoints(
        data?.analytics?.customerSegments,
        (name) => customerSegmentLabel(name, t),
      ),
      ordersByPaymentMethod: labelNameValuePoints(
        data?.analytics?.ordersByPaymentMethod,
        (name) =>
          translateWithFallback(
            t,
            `orders.paymentMethods.${name}`,
            humanizeKey(name),
          ),
      ),
      inventoryStockStates: (data?.analytics?.inventoryStockStates ?? []).map(
        (item) => ({
          ...item,
          state: translateWithFallback(
            t,
            `dashboard.stockStates.${item.state}`,
            humanizeKey(item.state),
          ),
        }),
      ),
      reviewRatings: data?.analytics?.reviewRatings ?? [],
      customerGrowth: data?.analytics?.customerGrowth ?? [],
      loyaltyPointsTrend: data?.analytics?.loyaltyPointsTrend ?? [],
      businessMetrics: data?.analytics?.businessMetrics,
      operationalAlerts: data?.analytics?.operationalAlerts,
    }),
    [data?.analytics, t],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.businessDesc')}</p>
        </div>
        {hasHomePermission && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('dashboard.revenueToday')}</p>
              <p className="mt-1 flex items-center gap-1 text-xl font-semibold tabular-nums">
                {data?.financial?.revenue_today}<SARIcon className="size-4 text-muted-foreground" />
              </p>
            </div>
            <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('dashboard.ordersToday')}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{data?.orders?.orders_today}</p>
            </div>
          </div>
        )}
      </div>

      {hasHomePermission && (
        <>
          <DashboardFilters
            value={filters ?? { preset: '30d', granularity: 'auto' }}
            onChange={handleFiltersChange}
            exportDataset={exportDataset}
          />
          <AnimatedTabs
            key={i18n.language}
            defaultValue="overview"
            value={activeTab}
            onValueChange={handleTabChange}
            items={tabsItems.map((t) => ({
              value: t.id,
              label: t.label,
              icon: t.icon,
              className: t.color,
            }))}
            renderTabsList={(itemsList) => (
              <>
                <div className="flex mb-4">
                  <TabsList
                    className={cn(
                      'bg-muted/50 border overflow-x-auto max-w-full relative h-10 gap-0 transition-opacity scroll-smooth snap-x snap-mandatory',
                    )}
                  >
                    {itemsList.map((tab) => {
                      const Icon = tabsItems.find(
                        (t) => t.id === tab.value,
                      )?.icon
                      const color = tab.className
                      return (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="min-w-fit gap-1.5 px-3 font-bold snap-start"
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                'h-4 w-4 transition-colors',
                                color,
                              )}
                            />
                          )}
                          <span>{tab.label}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>

                <>
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                          <StatsCard
                            title={t('dashboard.totalRevenue')}
                            value={data?.financial?.total_revenue}
                            change={
                              filters?.compare === false
                                ? undefined
                                : `${data?.orders?.revenue?.trend}%`
                            }
                            changeType={
                              (data?.orders?.revenue?.trend || 0) >= 0
                                ? 'increase'
                                : 'decrease'
                            }
                            icon={CreditCard}
                            iconColor="text-emerald-600 bg-emerald-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.totalOrders')}
                            value={data?.orders?.total}
                            change={`+${data?.orders?.orders_this_month} ${t('dashboard.newThisMonth')}`}
                            changeType="increase"
                            icon={ShoppingCart}
                            iconColor="text-blue-600 bg-blue-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.totalUsers')}
                            value={data?.users?.total}
                            change={
                              filters?.compare === false
                                ? undefined
                                : `${data?.users?.growth_trend}%`
                            }
                            changeType={
                              (data?.users?.growth_trend || 0) >= 0
                                ? 'increase'
                                : 'decrease'
                            }
                            icon={Users}
                            iconColor="text-violet-600 bg-violet-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.activeUsers')}
                            value={data?.users?.active}
                            change={`+${data?.users?.new_today} ${t('dashboard.newToday')}`}
                            changeType="increase"
                            icon={TrendingUp}
                            iconColor="text-orange-500 bg-orange-500/10"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <BusinessMetricsGrid
                            metrics={analytics.businessMetrics}
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 xl:grid-cols-7"
                        >
                          <RevenueLineChart
                            data={analytics.salesTrend}
                            className="xl:col-span-4"
                          />
                          <div className="xl:col-span-3 h-full">
                            <RadialBreakdownChart
                              title={t('dashboard.ordersByStatus')}
                              description={t('dashboard.distributionByStatus')}
                              data={analytics.ordersByStatus}
                            />
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 lg:grid-cols-2"
                        >
                          <div className="h-full">
                            <OperationalAlertsCard
                              alerts={analytics.operationalAlerts}
                            />
                          </div>
                          <div className="h-full">
                            <RadialBreakdownChart
                              title={t('dashboard.customerSegments')}
                              description={t('dashboard.customerSegmentsDesc')}
                              data={analytics.customerSegments}
                            />
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <RadialBreakdownChart
                            title={t('dashboard.paymentHealth')}
                            description={t('dashboard.paymentHealthDesc')}
                            data={analytics.paymentHealth}
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 grid-cols-1 md:grid-cols-2"
                        >
                          <Card className="shadow-sm border-muted/60 h-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {t('dashboard.recentOrders')}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {t('dashboard.latestTransactions')}
                                </p>
                              </div>
                              <Link to={'/orders' as any}>
                                <Badge
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-secondary/80"
                                >
                                  {t('dashboard.viewAll')}
                                </Badge>
                              </Link>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 overflow-y-auto max-h-[490px]!">
                                {data?.recent_activity?.orders?.map((order) => (
                                  <Link
                                    key={order.order_number}
                                    to={`/orders/show/${order.id}` as any}
                                    className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`p-2 rounded-lg ${order.status === 'open' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                                      >
                                        <Clock className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                                          #{order.order_number} -{' '}
                                          {order.user_name}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {order.created_at}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <p className="text-sm font-bold whitespace-nowrap flex items-center gap-1">
                                        {order.total}{' '}
                                        <SARIcon className="inline-block h-3 w-3 mb-0.5 opacity-60" />
                                      </p>
                                      <Badge
                                        variant={
                                          order.status === 'open'
                                            ? 'default'
                                            : 'secondary'
                                        }
                                        className="capitalize px-2 min-w-16 justify-center"
                                      >
                                        {order.status}
                                      </Badge>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          <div className="space-y-4 h-full">
                            <Card className="shadow-sm border-muted/60">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                  {t('dashboard.usersByType')}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(
                                    data?.users?.by_type || {},
                                  ).map(
                                    ([role, count]) =>
                                      role && (
                                        <Badge
                                          key={role}
                                          variant="outline"
                                          className="px-3 py-1 flex items-center gap-2"
                                        >
                                          <span className="font-bold">
                                            {count}
                                          </span>
                                          <span className="opacity-70 text-[10px] uppercase font-bold">
                                            {t(`users.${role}`)}
                                          </span>
                                        </Badge>
                                      ),
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="shadow-sm border-muted/60">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                  <CardTitle className="text-lg">
                                    {t('dashboard.recentUsers')}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {t('dashboard.newRegistrations')}
                                  </p>
                                </div>
                                <Link to={'/users'} search={{} as any}>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] cursor-pointer hover:bg-muted"
                                  >
                                    {t('dashboard.viewAll')}
                                  </Badge>
                                </Link>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4 overflow-y-auto h-[350px]!">
                                  {data?.recent_activity?.users
                                    ?.slice(0, 6)
                                    .map((user, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/users/show/${user.id}` as any}
                                        className="flex items-center gap-3 group"
                                      >
                                        <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                          {user.full_name
                                            ?.substring(0, 2)
                                            .toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {user.full_name}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground truncate">
                                            {user.email || t('common.guest')}
                                          </p>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                                          {user.created_at.split(' ')[0]}
                                        </p>
                                      </Link>
                                    ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-2"
                        >
                          <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle className="text-lg">
                                {t('dashboard.recentReviews')}
                              </CardTitle>
                              <Link to="/reviews" search={{} as any}>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] cursor-pointer hover:bg-muted font-bold"
                                >
                                  {t('dashboard.viewAll')}
                                </Badge>
                              </Link>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3 max-h-[490px] overflow-y-scroll">
                                {data?.recent_activity?.reviews?.map(
                                  (review, idx) => (
                                    <Link
                                      key={idx}
                                      to={`/reviews/show/${review.id}` as any}
                                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/20 border border-muted/40 transition-all hover:bg-muted/40 group"
                                    >
                                      <div className="bg-warning/10 p-2 rounded-full group-hover:bg-warning/20 transition-colors">
                                        <Star className="h-4 w-4 text-warning fill-warning" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-bold group-hover:text-primary transition-colors">
                                            {review.user_name}
                                          </p>
                                          <div className="flex items-center text-xs font-bold text-warning">
                                            {review.rating} ⭐
                                          </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                          {review.product_name ||
                                            t('common.deletedProduct')}
                                        </p>
                                        <div className="mt-2 text-[10px] flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant={
                                                review.is_approved
                                                  ? 'outline'
                                                  : 'secondary'
                                              }
                                              className="text-[8px] h-4"
                                            >
                                              {review.is_approved
                                                ? t('status.approved')
                                                : t('status.pending')}
                                            </Badge>
                                            <span className="text-muted-foreground font-medium">
                                              {review.created_at}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  ),
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="shadow-sm py-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle className="text-lg">
                                {t('dashboard.recentProducts')}
                              </CardTitle>
                              <Link to="/products" search={{} as any}>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] cursor-pointer hover:bg-muted font-bold"
                                >
                                  {t('dashboard.viewAll')}
                                </Badge>
                              </Link>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-3 max-h-[490px] overflow-y-scroll">
                                {data?.recent_activity?.products
                                  ?.slice(0, 4)
                                  .map((product, idx) => (
                                    <Link
                                      key={idx}
                                      to={`/products/show/${product.id}` as any}
                                      className="flex items-start gap-4 p-3 rounded-lg border border-transparent hover:border-border transition-colors group"
                                    >
                                      <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-bold truncate group-hover:text-primary transition-colors max-w-126">
                                            {product.name}
                                          </p>
                                          <p className="text-sm font-bold flex items-center gap-1">
                                            {product.price}{' '}
                                            <SARIcon className="inline size-3 mb-0.5 opacity-60" />
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                          <Badge
                                            variant={
                                              product.is_active
                                                ? 'default'
                                                : 'outline'
                                            }
                                            className="text-[8px] h-4"
                                          >
                                            {product.is_active
                                              ? t('status.active')
                                              : t('status.inactive')}
                                          </Badge>
                                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                            {t('table.columns.stock')}:{' '}
                                            {product.stock}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'sales' && (
                    <motion.div
                      key="sales"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                          <StatsCard
                            title={t('dashboard.netRevenue')}
                            value={
                              <div className="flex items-center gap-1">
                                {data?.financial?.range_net_revenue}{' '}
                                <SARIcon className="h-5 w-5 text-primary/60" />
                              </div>
                            }
                            icon={Wallet}
                            iconColor="text-emerald-600 bg-emerald-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.pendingPayments')}
                            value={
                              <div className="flex items-center gap-1">
                                {data?.financial?.pending_payments}{' '}
                                <SARIcon className="h-5 w-5 text-warning/60" />
                              </div>
                            }
                            icon={Clock}
                            iconColor="text-amber-500 bg-amber-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.refundedInPeriod')}
                            value={
                              <div className="flex items-center gap-1">
                                {data?.financial?.range_refunds}{' '}
                                <SARIcon className="h-5 w-5 text-destructive/60" />
                              </div>
                            }
                            icon={ArrowDownCircle}
                            iconColor="text-red-500 bg-red-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.averageOrderValue')}
                            value={
                              <div className="flex items-center gap-1">
                                {analytics.businessMetrics?.averageOrderValue}{' '}
                                <SARIcon className="h-5 w-5 text-success/60" />
                              </div>
                            }
                            icon={TrendingUp}
                            iconColor="text-teal-500 bg-teal-500/10"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <SalesTrendChart data={analytics.salesTrend} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Card className="shadow-sm border-muted/60 py-4">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.revenueBreakdown')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {t('common.today')}
                                  </p>
                                  <p className="text-lg font-black flex items-center gap-1">
                                    {data?.orders?.revenue?.today}{' '}
                                    <SARIcon className="inline size-4 mb-1 opacity-40" />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {t('dashboard.revenueThisWeek')}
                                  </p>
                                  <p className="text-lg font-black flex items-center gap-1">
                                    {data?.orders?.revenue?.this_week}{' '}
                                    <SARIcon className="inline size-4 mb-1 opacity-40" />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {t('dashboard.revenueThisMonth')}
                                  </p>
                                  <p className="text-lg font-black flex items-center gap-1">
                                    {data?.orders?.revenue?.this_month}{' '}
                                    <SARIcon className="inline size-4 mb-1 opacity-40" />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {t('dashboard.revenueThisYear')}
                                  </p>
                                  <p className="text-lg font-black flex items-center gap-1">
                                    {data?.orders?.revenue?.this_year}{' '}
                                    <SARIcon className="inline size-4 mb-1 opacity-40" />
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    {t('dashboard.totalRevenue')}
                                  </p>
                                  <p className="text-lg font-black flex items-center gap-1 text-primary">
                                    {data?.orders?.revenue?.total}{' '}
                                    <SARIcon className="inline size-4 mb-1 opacity-60" />
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-7"
                        >
                          <AnalyticsPieChart
                            className="col-span-3 shadow-sm border-muted/50"
                            title={t('dashboard.ordersByStatus')}
                            description={t('dashboard.distributionByStatus')}
                            data={orderStatusData}
                          />
                          <Card className="col-span-4 shadow-sm border-muted/50">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.topProducts')}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.bestSellingProducts')}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {data?.orders?.top_products?.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/products/show/${p.id}` as any}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                        {p.sold}
                                      </div>
                                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                        {p.name}
                                      </span>
                                    </div>
                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                      {p.revenue}{' '}
                                      <SARIcon className="inline size-3 mb-0.5 opacity-40" />
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'customers' && (
                    <motion.div
                      key="customers"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                        >
                          <StatsCard
                            title={t('dashboard.totalUsers')}
                            value={data?.users?.total}
                            icon={Users}
                            iconColor="text-violet-600 bg-violet-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.activeUsers')}
                            value={data?.users?.active}
                            icon={CheckCircle2}
                            iconColor="text-emerald-600 bg-emerald-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.bannedUsers')}
                            value={data?.users?.banned}
                            icon={UserX}
                            iconColor="text-red-500 bg-red-500/10"
                            className="text-destructive"
                          />
                          <StatsCard
                            title={t('dashboard.newToday')}
                            value={data?.users?.new_today}
                            icon={PlusCircle}
                            iconColor="text-blue-600 bg-blue-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.newThisMonth')}
                            value={data?.users?.new_this_month}
                            icon={TrendingUp}
                            iconColor="text-orange-500 bg-orange-500/10"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <CustomerGrowthChart data={analytics.customerGrowth} />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2"
                        >
                          <AnalyticsPieChart
                            title={t('dashboard.usersByType')}
                            description={t('dashboard.distributionByRole')}
                            data={userTypeData}
                            height={450}
                          />
                          <Card className="shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.loyaltyTiers')}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.usersInTiers')}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6 mt-2">
                                {data?.users?.by_tier?.map((tier) => (
                                  <div key={tier.tier_name}>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="font-medium">
                                        {tier.tier_name}
                                      </span>
                                      <span className="text-muted-foreground font-bold">
                                        {tier.count} {t('common.users')}
                                      </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                          width: `${(tier.count / (data?.users?.total || 1)) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'inventory' && (
                    <motion.div
                      key="inventory"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                          <StatsCard
                            title={t('dashboard.totalProducts')}
                            value={data?.products?.total}
                            icon={Package}
                            iconColor="text-indigo-600 bg-indigo-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.outOfStock')}
                            value={data?.products?.out_of_stock}
                            icon={XCircle}
                            iconColor="text-red-500 bg-red-500/10"
                            className="text-destructive"
                          />
                          <StatsCard
                            title={t('dashboard.lowStock')}
                            value={data?.products?.low_stock}
                            icon={AlertCircle}
                            iconColor="text-amber-500 bg-amber-500/10"
                            className="text-warning"
                          />
                          <StatsCard
                            title={t('dashboard.inventoryValue')}
                            value={
                              <div className="flex items-center gap-1">
                                {data?.products?.inventory_value?.toLocaleString()}{' '}
                                <SARIcon className="h-5 w-5 text-primary/60" />
                              </div>
                            }
                            icon={CreditCard}
                            iconColor="text-emerald-600 bg-emerald-500/10"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <InventoryStockChart
                            data={analytics.inventoryStockStates}
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Card className="shadow-sm border-muted/60">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.catalogUpdates')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-xl">
                                    <PlusCircle className="size-6 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">
                                      {t('dashboard.addedToday')}
                                    </p>
                                    <p className="text-2xl font-black">
                                      {data?.products?.added_today}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-xl">
                                    <PlusCircle className="size-6 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">
                                      {t('dashboard.addedThisWeek')}
                                    </p>
                                    <p className="text-2xl font-black">
                                      {data?.products?.added_this_week}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-xl">
                                    <PlusCircle className="size-6 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">
                                      {t('dashboard.addedThisMonth')}
                                    </p>
                                    <p className="text-2xl font-black">
                                      {data?.products?.added_this_month}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2"
                        >
                          <Card className="shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.mostViewed')}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.topProductsByViews')}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {data?.products?.most_viewed?.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/products/show/${p.id}` as any}
                                    className="flex items-center justify-between group"
                                  >
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate max-w-[70%]">
                                      {p.name}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="font-bold"
                                    >
                                      {p.views} {t('common.views')}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.mostWishlisted')}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {t('dashboard.topProductsByWishlist')}
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {data?.products?.most_wishlisted?.map((p) => (
                                  <Link
                                    key={p.id}
                                    to={`/products/show/${p.id}` as any}
                                    className="flex items-center justify-between group"
                                  >
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate max-w-[70%]">
                                      {p.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="font-bold border-primary/20 text-primary"
                                    >
                                      {p.wishlist_count}{' '}
                                      {t('common.wishlisted')}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                          <StatsCard
                            title={t('dashboard.totalReviews')}
                            value={data?.reviews?.total}
                            icon={Star}
                            iconColor="text-yellow-500 bg-yellow-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.averageRating')}
                            value={data?.reviews?.average_rating}
                            icon={Star}
                            iconColor="text-orange-500 bg-orange-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.thisMonth')}
                            value={data?.reviews?.this_month}
                            icon={Clock}
                            iconColor="text-blue-600 bg-blue-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.pendingApproval')}
                            value={data?.reviews?.pending_approval}
                            icon={AlertCircle}
                            iconColor="text-amber-500 bg-amber-500/10"
                            className="text-warning"
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-7"
                        >
                          <AnalyticsBarChart
                            className="col-span-3 shadow-sm"
                            title={t('dashboard.ratingDistribution')}
                            description={t('dashboard.reviewsByRating')}
                            data={ratingData}
                            xAxisKey="rating"
                            barConfig={{
                              dataKey: 'count',
                              fill: 'var(--chart-4)',
                              radius: [4, 4, 0, 0],
                            }}
                          />
                          <Card className="col-span-4 shadow-sm">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.mostReviewed')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {data?.reviews?.most_reviewed?.map((p, idx) => (
                                  <Link
                                    key={idx}
                                    to={`/products/show/${p.id}` as any}
                                    className="flex items-center justify-between p-2 rounded-lg border border-transparent hover:bg-muted/30 group"
                                  >
                                    <div className="flex-1 min-w-0 mr-4">
                                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                        {p.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {p.reviews_count} {t('menu.reviews')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-warning/10 px-2 py-1 rounded-md">
                                      <Star className="h-3 w-3 text-warning fill-warning" />
                                      <span className="text-xs font-bold text-warning-foreground">
                                        {p.average_rating}
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeTab === 'loyalty' && (
                    <motion.div
                      key="loyalty"
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        variants={containerVariants}
                        initial={false}
                        animate="show"
                        className="space-y-6"
                      >
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-3"
                        >
                          <StatsCard
                            title={t('dashboard.distributedPoints')}
                            value={data?.loyalty?.total_points_distributed}
                            icon={Gift}
                            iconColor="text-purple-600 bg-purple-500/10"
                          />
                          <StatsCard
                            title={t('dashboard.redeemedPoints')}
                            value={Math.abs(
                              data?.loyalty?.total_points_redeemed || 0,
                            )}
                            icon={CreditCard}
                            iconColor="text-red-500 bg-red-500/10"
                            className="text-destructive"
                          />
                          <StatsCard
                            title={t('dashboard.pointsThisMonth')}
                            value={data?.loyalty?.points_this_month}
                            icon={Clock}
                            iconColor="text-blue-600 bg-blue-500/10"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <LoyaltyTrendChart
                            data={analytics.loyaltyPointsTrend}
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="grid gap-4 md:grid-cols-3"
                        >
                          <StatsCard
                            title={t('dashboard.redeemedRewards')}
                            value={data?.loyalty?.total_redeemed_rewards}
                            icon={CheckCircle2}
                            iconColor="text-emerald-600 bg-emerald-500/10"
                          />
                          <Card className="shadow-sm overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Gift className="size-20 transform rotate-12" />
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                                {t('dashboard.loyaltyProgram')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-success flex items-center gap-2">
                                {Math.abs(
                                  (data?.loyalty?.total_points_distributed ||
                                    0) /
                                    (data?.loyalty?.total_points_redeemed || 1),
                                ).toFixed(1)}
                                x
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-normal tracking-wider"
                                >
                                  NET RATIO
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Card className="shadow-sm border-muted/60">
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {t('dashboard.usersByTier')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-6 md:grid-cols-3">
                                {data?.loyalty?.users_by_tier?.map((tier) => (
                                  <div
                                    key={tier.tier_name}
                                    className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-3xl border border-primary/10 relative overflow-hidden group"
                                  >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                      <Gift className="h-12 w-12" />
                                    </div>
                                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                      {tier.tier_name}
                                    </p>
                                    <p className="text-4xl font-black text-primary">
                                      {tier.count}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {t('common.users')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </>

                {/* GLOBE TAB – only mount WebGL after user first visits the tab */}
                {globeEverVisited.current && (
                  <div
                    style={{
                      display: activeTab === 'globe' ? undefined : 'none',
                    }}
                  >
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-[400px]">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        </div>
                      }
                    >
                      {data?.geo && (
                        <GlobeTab
                          countries={data?.geo?.countries || []}
                          containerVariants={containerVariants}
                          itemVariants={itemVariants}
                          isActive={activeTab === 'globe'}
                        />
                      )}
                    </Suspense>
                  </div>
                )}
              </>
            )}
          />
        </>
      )}
    </div>
  )
}

function labelNameValuePoints(
  items: Array<{ name: string; value: number }> | undefined,
  label: (name: string) => string,
) {
  return (items ?? []).map((item) => ({
    ...item,
    name: label(item.name),
  }))
}

function translateWithFallback(
  t: (key: string) => string,
  key: string,
  fallback: string,
) {
  const translated = t(key)
  return translated === key ? fallback : translated
}

function customerSegmentLabel(name: string, t: (key: string) => string) {
  const labels: Record<string, string> = {
    first_time_range: 'First-time customers',
    repeat_range: 'Repeat customers',
  }
  return (
    labels[name] ??
    translateWithFallback(
      t,
      `dashboard.customerSegments.${name}`,
      humanizeKey(name),
    )
  )
}

function humanizeKey(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function cleanSearchParams<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== '',
    ),
  )
}
