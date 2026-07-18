export type DashboardGranularity = 'day' | 'week' | 'month';
export type DashboardDateRange = { from: Date; to: Date; granularity: DashboardGranularity };
export type DashboardQueryResult = Record<string, unknown>;

export const DASHBOARD_CUSTOMER_QUERIES = Symbol('DashboardCustomerQueries');
export const DASHBOARD_SALES_QUERIES = Symbol('DashboardSalesQueries');
export const DASHBOARD_CATALOG_QUERIES = Symbol('DashboardCatalogQueries');
export const DASHBOARD_GEO_ACTIVITY_QUERIES = Symbol('DashboardGeoActivityQueries');
export const DASHBOARD_ANALYTICS_QUERIES = Symbol('DashboardAnalyticsQueries');

export interface DashboardCustomerQueryPort {
  getUserStats(range: DashboardDateRange, langId: string, compare: boolean): Promise<DashboardQueryResult>;
  getLoyaltyStats(range: DashboardDateRange, langId: string): Promise<DashboardQueryResult>;
}
export interface DashboardSalesQueryPort {
  getOrderStats(range: DashboardDateRange, langId: string, compare: boolean): Promise<DashboardQueryResult>;
  getFinancialStats(range: DashboardDateRange): Promise<DashboardQueryResult>;
}
export interface DashboardCatalogQueryPort {
  getProductStats(range: DashboardDateRange, langId: string): Promise<DashboardQueryResult>;
  getReviewStats(range: DashboardDateRange, langId: string): Promise<DashboardQueryResult>;
}
export interface DashboardGeoActivityQueryPort {
  getGeoStats(langId: string): Promise<DashboardQueryResult>;
  getRecentActivity(langId: string): Promise<DashboardQueryResult>;
}
export interface DashboardAnalyticsQueryPort {
  getAnalytics(range: DashboardDateRange): Promise<DashboardQueryResult>;
}
