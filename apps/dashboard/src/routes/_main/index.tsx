import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod/v4'
import type { RouterContext } from '@/main'
import type {
  DashboardAnalytics,
  DashboardQueryParams,
  DashboardStatistics,
} from '@/types/api/dashboard'
import type { ApiResponseBase } from '@/types/api/http'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { Dashboard } from '@/components/pagesComponents/Dashboard'
import { DashboardSkeleton } from '@/components/pagesComponents/Dashboard/Skeleton'
import useFetch from '@/hooks/UseFetch'
import { hasPermission } from '@/lib/utils'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { prefetchOptions } from '@/util/preFetcher'
import { queryKeys } from '@/util/queryKeysFactory'

const dashboardSearchSchema = z.object({
  tab: z.string().optional().catch('overview'),
  preset: z
    .enum(['today', '7d', '30d', '90d', 'year', 'custom'])
    .optional()
    .catch('30d'),
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
  granularity: z
    .enum(['auto', 'day', 'week', 'month'])
    .optional()
    .catch('auto'),
})

export const Route = createFileRoute('/_main/')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: Index,
  pendingComponent: DashboardSkeleton,
  loader: async ({ context }) => {
    const { queryClient } = context as RouterContext
    const hasHomePermission = hasPermission('dashboard-home', 'index')
    if (!hasHomePermission) {
      return
    }
    await queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: queryKeys.dashboard.statistics({
          preset: '30d',
          granularity: 'auto',
          sections: 'overview,geo,recent,charts',
        }),
        endpoint: 'dashboard/home',
        params: {
          preset: '30d',
          granularity: 'auto',
          sections: 'overview,geo,recent,charts',
        },
      }),
    )
  },
})

function Index() {
  const { data: user } = useDashboardProfile()
  const hasHomePermission = (
    user?.permissions['dashboard-home'] || []
  ).includes('index')
  const search = useSearch({ from: '/_main/' })
  const dashboardParams: DashboardQueryParams = {
    preset: search.preset,
    from: search.from,
    to: search.to,
    granularity: search.granularity,
    sections: 'overview,geo,recent,charts',
  }
  const { data } = useFetch<ApiResponseBase<DashboardStatistics>>({
    queryKey: queryKeys.dashboard.statistics(dashboardParams),
    endpoint: 'dashboard/home',
    params: dashboardParams,
    // suspense: true,
    enabled: hasHomePermission,
  })
  const dashboardResponse = data as
    | ApiResponseBase<DashboardStatistics>
    | undefined

  return (
    <>
      <SmartBreadcrumbs />
      <Dashboard
        data={normalizeDashboardStatistics(dashboardResponse?.data)}
        hasHomePermission={hasHomePermission}
        filters={dashboardParams}
      />
    </>
  )
}

export default Index

function normalizeDashboardStatistics(
  data?: DashboardStatistics,
): DashboardStatistics | undefined {
  if (!data?.analytics) return data
  return {
    ...data,
    analytics: normalizeAnalytics(data.analytics),
  }
}

function normalizeAnalytics(analytics: DashboardAnalytics): DashboardAnalytics {
  const value = asRecord(analytics)
  return {
    ...analytics,
    salesTrend: arrayOfRecords(value.salesTrend ?? value.sales_trend).map(
      (item) => ({
        period: stringValue(item.period),
        revenue: numberValue(item.revenue),
        netRevenue: numberValue(item.netRevenue ?? item.net_revenue),
        orders: numberValue(item.orders),
        refunds: numberValue(item.refunds),
      }),
    ),
    ordersByStatus: normalizeNameValuePoints(
      value.ordersByStatus ?? value.orders_by_status,
    ),
    ordersByPaymentMethod: normalizeNameValuePoints(
      value.ordersByPaymentMethod ?? value.orders_by_payment_method,
    ),
    paymentHealth: normalizeNameValuePoints(
      value.paymentHealth ?? value.payment_health,
    ),
    customerSegments: normalizeNameValuePoints(
      value.customerSegments ?? value.customer_segments,
    ),
    customerGrowth: arrayOfRecords(
      value.customerGrowth ?? value.customer_growth,
    ).map((item) => ({
      period: stringValue(item.period),
      newUsers: numberValue(item.newUsers ?? item.new_users),
      activeUsers: numberValue(item.activeUsers ?? item.active_users),
    })),
    inventoryStockStates: arrayValue(
      value.inventoryStockStates ?? value.inventory_stock_states,
    ),
    reviewRatings: arrayValue(value.reviewRatings ?? value.review_ratings),
    loyaltyPointsTrend: arrayOfRecords(
      value.loyaltyPointsTrend ?? value.loyalty_points_trend,
    ).map((item) => ({
      period: stringValue(item.period),
      earned: numberValue(item.earned),
      redeemed: numberValue(item.redeemed),
    })),
    businessMetrics: normalizeBusinessMetrics(
      asRecord(value.businessMetrics ?? value.business_metrics),
    ),
    operationalAlerts: normalizeOperationalAlerts(
      asRecord(value.operationalAlerts ?? value.operational_alerts),
    ),
  }
}

function normalizeBusinessMetrics(metrics: Record<string, unknown> = {}) {
  return {
    grossRevenue: Number(metrics.grossRevenue ?? metrics.gross_revenue ?? 0),
    netRevenue: Number(metrics.netRevenue ?? metrics.net_revenue ?? 0),
    orders: Number(metrics.orders ?? 0),
    averageOrderValue: Number(
      metrics.averageOrderValue ?? metrics.average_order_value ?? 0,
    ),
    refundRate: Number(metrics.refundRate ?? metrics.refund_rate ?? 0),
    repeatCustomerRate: Number(
      metrics.repeatCustomerRate ?? metrics.repeat_customer_rate ?? 0,
    ),
    reviewApprovalRate: Number(
      metrics.reviewApprovalRate ?? metrics.review_approval_rate ?? 0,
    ),
    inventoryAtRisk: Number(
      metrics.inventoryAtRisk ?? metrics.inventory_at_risk ?? 0,
    ),
    pendingOperations: Number(
      metrics.pendingOperations ?? metrics.pending_operations ?? 0,
    ),
  }
}

function normalizeOperationalAlerts(alerts: Record<string, unknown> = {}) {
  return {
    pendingPaymentsCount: Number(
      alerts.pendingPaymentsCount ?? alerts.pending_payments_count ?? 0,
    ),
    pendingPaymentsAmount: Number(
      alerts.pendingPaymentsAmount ?? alerts.pending_payments_amount ?? 0,
    ),
    pendingReviews: Number(
      alerts.pendingReviews ?? alerts.pending_reviews ?? 0,
    ),
    openTickets: Number(alerts.openTickets ?? alerts.open_tickets ?? 0),
    openReturns: Number(alerts.openReturns ?? alerts.open_returns ?? 0),
    openExchanges: Number(alerts.openExchanges ?? alerts.open_exchanges ?? 0),
    lowStockVariants: Number(
      alerts.lowStockVariants ?? alerts.low_stock_variants ?? 0,
    ),
    outOfStockVariants: Number(
      alerts.outOfStockVariants ?? alerts.out_of_stock_variants ?? 0,
    ),
    refundRequestsValue: Number(
      alerts.refundRequestsValue ?? alerts.refund_requests_value ?? 0,
    ),
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function arrayValue<T>(value: unknown): Array<T> {
  return Array.isArray(value) ? (value as Array<T>) : []
}

function arrayOfRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(asRecord) : []
}

function normalizeNameValuePoints(value: unknown) {
  return arrayOfRecords(value).map((item) => ({
    name: stringValue(item.name),
    value: numberValue(item.value),
  }))
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown) {
  return Number(value ?? 0)
}
