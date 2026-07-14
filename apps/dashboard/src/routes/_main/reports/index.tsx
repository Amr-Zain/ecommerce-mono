import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { StatsCard } from '@/components/common/charts/StatsCard'
import { SARIcon } from '@/components/common/Icons'
import {
  CustomerGrowthChart,
  CustomerLineChart,
  BusinessMetricsGrid,
  InventoryStockChart,
  LoyaltyTrendChart,
  OperationalAlertsCard,
  OrdersDonutChart,
  RadialBreakdownChart,
  RevenueLineChart,
  ReviewRatingsChart,
  SalesTrendChart,
} from '@/components/pagesComponents/Dashboard/AnalyticsCharts'
import { DashboardFilters } from '@/components/pagesComponents/Dashboard/DashboardFilters'
import useFetch from '@/hooks/UseFetch'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { DashboardQueryParams, DashboardStatistics } from '@/types/api/dashboard'
import { ApiResponseBase } from '@/types/api/http'
import { queryKeys } from '@/util/queryKeysFactory'
import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { CreditCard, Gift, Package, ShoppingCart, Star, TrendingUp, Users } from 'lucide-react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod/v4'

const reportsSearchSchema = z.object({
  preset: z.enum(['today', '7d', '30d', '90d', 'year', 'custom']).optional().catch('30d'),
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
  granularity: z.enum(['auto', 'day', 'week', 'month']).optional().catch('auto'),
})

const reportSections = 'overview,sales,customers,inventory,reviews,loyalty,charts'

export const Route = createFileRoute('/_main/reports/')({
  validateSearch: (search) => reportsSearchSchema.parse(search),
  component: ReportsPage,
})

function ReportsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/_main/reports/' })
  const { data: user } = useDashboardProfile()
  const hasHomePermission = (
    user?.permissions['dashboard-home'] || []
  ).includes('index')
  const params: DashboardQueryParams = {
    preset: search.preset,
    from: search.from,
    to: search.to,
    granularity: search.granularity,
    sections: reportSections,
  }

  const { data } = useFetch<ApiResponseBase<DashboardStatistics>>({
    queryKey: queryKeys.dashboard.statistics({ report: true, ...params }),
    endpoint: 'dashboard/home',
    params,
    enabled: hasHomePermission,
  })

  const stats = data?.data
  const handleFiltersChange = useCallback((next: DashboardQueryParams) => {
    navigate({
      to: '.',
      search: (prev: any) => ({ ...prev, ...next }),
      replace: true,
    })
  }, [navigate])

  if (!hasHomePermission) {
    return (
      <>
        <SmartBreadcrumbs />
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">{t('dashboard.noReportsPermission')}</CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <SmartBreadcrumbs />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.reportsTitle')}</h1>
        <p className="text-muted-foreground">{t('dashboard.reportsDescription')}</p>
      </div>
      <DashboardFilters value={params} onChange={handleFiltersChange} />
      <BusinessMetricsGrid metrics={stats?.analytics?.businessMetrics} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title={t('dashboard.totalRevenue')} value={stats?.financial?.total_revenue ?? 0} icon={CreditCard} iconColor="text-emerald-600 bg-emerald-500/10" />
        <StatsCard title={t('dashboard.totalOrders')} value={stats?.orders?.total ?? 0} icon={ShoppingCart} iconColor="text-blue-600 bg-blue-500/10" />
        <StatsCard title={t('dashboard.totalUsers')} value={stats?.users?.total ?? 0} icon={Users} iconColor="text-violet-600 bg-violet-500/10" />
        <StatsCard title={t('dashboard.inventoryValue')} value={<span className="inline-flex items-center gap-1">{stats?.products?.inventory_value ?? 0} <SARIcon className="size-4" /></span>} icon={Package} iconColor="text-orange-500 bg-orange-500/10" />
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="sales">{t('dashboard.tabs.sales')}</TabsTrigger>
          <TabsTrigger value="customers">{t('dashboard.tabs.customers')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('dashboard.tabs.inventory')}</TabsTrigger>
          <TabsTrigger value="reviews">{t('dashboard.tabs.reviews')}</TabsTrigger>
          <TabsTrigger value="loyalty">{t('dashboard.tabs.loyalty')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-7">
            <RevenueLineChart data={stats?.analytics?.salesTrend ?? []} className="xl:col-span-4" />
            <div className="xl:col-span-3">
              <RadialBreakdownChart title={t('dashboard.paymentHealth')} description={t('dashboard.paymentHealthDesc')} data={stats?.analytics?.paymentHealth ?? []} />
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-7">
            <SalesTrendChart data={stats?.analytics?.salesTrend ?? []} className="xl:col-span-4" />
            <div className="xl:col-span-3">
              <RadialBreakdownChart title={t('dashboard.paymentMethods')} description={t('dashboard.paymentMethodsDesc')} data={stats?.analytics?.ordersByPaymentMethod ?? []} />
            </div>
          </div>
          <TopProductsCard stats={stats} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <CustomerLineChart data={stats?.analytics?.customerGrowth ?? []} />
            <RadialBreakdownChart title={t('dashboard.customerSegments')} description={t('dashboard.customerSegmentsDesc')} data={stats?.analytics?.customerSegments ?? []} />
            <CustomerGrowthChart data={stats?.analytics?.customerGrowth ?? []} />
            <TiersCard stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <InventoryStockChart data={stats?.analytics?.inventoryStockStates ?? []} />
            <RadialBreakdownChart title={t('dashboard.inventoryStockStates')} description={t('dashboard.inventoryStockStatesDesc')} data={(stats?.analytics?.inventoryStockStates ?? []).map((item) => ({ name: item.state, value: item.count }))} />
            <OperationalAlertsCard alerts={stats?.analytics?.operationalAlerts} />
            <InventorySummaryCard stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ReviewRatingsChart data={stats?.analytics?.reviewRatings ?? []} />
            <RadialBreakdownChart title={t('dashboard.ratingDistribution')} description={t('dashboard.reviewsByRating')} data={(stats?.analytics?.reviewRatings ?? []).map((item) => ({ name: item.rating, value: item.count }))} />
            <MostReviewedCard stats={stats} />
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <LoyaltyTrendChart data={stats?.analytics?.loyaltyPointsTrend ?? []} />
            <Card>
              <CardHeader><CardTitle>{t('dashboard.loyaltyProgram')}</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <StatsCard title={t('dashboard.distributedPoints')} value={stats?.loyalty?.total_points_distributed ?? 0} icon={Gift} iconColor="text-purple-600 bg-purple-500/10" />
                <StatsCard title={t('dashboard.redeemedPoints')} value={Math.abs(stats?.loyalty?.total_points_redeemed ?? 0)} icon={CreditCard} iconColor="text-red-500 bg-red-500/10" />
                <StatsCard title={t('dashboard.redeemedRewards')} value={stats?.loyalty?.total_redeemed_rewards ?? 0} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-500/10" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TopProductsCard({ stats }: { stats?: DashboardStatistics }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.topProducts')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {(stats?.orders?.top_products ?? []).map((product) => (
          <Link key={product.id} to={`/products/show/${product.id}` as any} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/40">
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">{product.sold} / {product.revenue}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function TiersCard({ stats }: { stats?: DashboardStatistics }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.loyaltyTiers')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {(stats?.users?.by_tier ?? []).map((tier) => (
          <div key={tier.tier_name} className="flex items-center justify-between rounded-md border p-3">
            <span className="font-medium">{tier.tier_name}</span>
            <span className="text-sm text-muted-foreground">{tier.count}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function InventorySummaryCard({ stats }: { stats?: DashboardStatistics }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.inventory')}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <StatsCard title={t('dashboard.totalProducts')} value={stats?.products?.total ?? 0} icon={Package} iconColor="text-indigo-600 bg-indigo-500/10" />
        <StatsCard title={t('dashboard.outOfStock')} value={stats?.products?.out_of_stock ?? 0} icon={Package} iconColor="text-red-500 bg-red-500/10" />
        <StatsCard title={t('dashboard.lowStock')} value={stats?.products?.low_stock ?? 0} icon={Package} iconColor="text-amber-500 bg-amber-500/10" />
        <StatsCard title={t('dashboard.inventoryValue')} value={stats?.products?.inventory_value ?? 0} icon={CreditCard} iconColor="text-emerald-600 bg-emerald-500/10" />
      </CardContent>
    </Card>
  )
}

function MostReviewedCard({ stats }: { stats?: DashboardStatistics }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader><CardTitle>{t('dashboard.mostReviewed')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {(stats?.reviews?.most_reviewed ?? []).map((product) => (
          <Link key={product.id} to={`/products/show/${product.id}` as any} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/40">
            <span className="font-medium">{product.name}</span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Star className="size-3" /> {product.average_rating}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export default ReportsPage
