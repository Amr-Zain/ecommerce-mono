import type {
  DashboardAnalytics,
  DashboardStatistics,
} from '@/types/api/dashboard'

export function normalizeDashboardStatistics(
  data?: DashboardStatistics,
): DashboardStatistics | undefined {
  if (!data?.analytics) return data
  const value = asRecord(data.analytics)
  return {
    ...data,
    analytics: {
      ...data.analytics,
      salesTrend: arrayOfRecords(value.salesTrend ?? value.sales_trend).map(
        (item) => ({
          period: stringValue(item.period),
          revenue: numberValue(item.revenue),
          netRevenue: numberValue(item.netRevenue ?? item.net_revenue),
          orders: numberValue(item.orders),
          refunds: numberValue(item.refunds),
        }),
      ),
      ordersByStatus: nameValue(value.ordersByStatus ?? value.orders_by_status),
      ordersByPaymentMethod: nameValue(
        value.ordersByPaymentMethod ?? value.orders_by_payment_method,
      ),
      paymentHealth: nameValue(value.paymentHealth ?? value.payment_health),
      customerSegments: nameValue(
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
      businessMetrics: businessMetrics(
        asRecord(value.businessMetrics ?? value.business_metrics),
      ),
      operationalAlerts: operationalAlerts(
        asRecord(value.operationalAlerts ?? value.operational_alerts),
      ),
    } satisfies DashboardAnalytics,
  }
}

function businessMetrics(metrics: Record<string, unknown>) {
  return {
    grossRevenue: numberValue(metrics.grossRevenue ?? metrics.gross_revenue),
    netRevenue: numberValue(metrics.netRevenue ?? metrics.net_revenue),
    orders: numberValue(metrics.orders),
    averageOrderValue: numberValue(
      metrics.averageOrderValue ?? metrics.average_order_value,
    ),
    refundRate: numberValue(metrics.refundRate ?? metrics.refund_rate),
    repeatCustomerRate: numberValue(
      metrics.repeatCustomerRate ?? metrics.repeat_customer_rate,
    ),
    reviewApprovalRate: numberValue(
      metrics.reviewApprovalRate ?? metrics.review_approval_rate,
    ),
    inventoryAtRisk: numberValue(
      metrics.inventoryAtRisk ?? metrics.inventory_at_risk,
    ),
    pendingOperations: numberValue(
      metrics.pendingOperations ?? metrics.pending_operations,
    ),
  }
}

function operationalAlerts(alerts: Record<string, unknown>) {
  return {
    pendingPaymentsCount: numberValue(
      alerts.pendingPaymentsCount ?? alerts.pending_payments_count,
    ),
    pendingPaymentsAmount: numberValue(
      alerts.pendingPaymentsAmount ?? alerts.pending_payments_amount,
    ),
    pendingReviews: numberValue(
      alerts.pendingReviews ?? alerts.pending_reviews,
    ),
    openTickets: numberValue(alerts.openTickets ?? alerts.open_tickets),
    openReturns: numberValue(alerts.openReturns ?? alerts.open_returns),
    openExchanges: numberValue(alerts.openExchanges ?? alerts.open_exchanges),
    lowStockVariants: numberValue(
      alerts.lowStockVariants ?? alerts.low_stock_variants,
    ),
    outOfStockVariants: numberValue(
      alerts.outOfStockVariants ?? alerts.out_of_stock_variants,
    ),
    refundRequestsValue: numberValue(
      alerts.refundRequestsValue ?? alerts.refund_requests_value,
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

function nameValue(value: unknown) {
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
