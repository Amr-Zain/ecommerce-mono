import { CacheService } from '@/shared/cache/cache.service';
import { DashboardQueryHandler } from './dashboard-query.handler';
import {
  DashboardAnalyticsQueryPort,
  DashboardCatalogQueryPort,
  DashboardCustomerQueryPort,
  DashboardGeoActivityQueryPort,
  DashboardSalesQueryPort,
} from './dashboard-query.port';

describe('DashboardQueryHandler', () => {
  const customerQueries = {
    getUserStats: jest.fn(),
    getLoyaltyStats: jest.fn(),
  } as jest.Mocked<DashboardCustomerQueryPort>;
  const salesQueries = {
    getOrderStats: jest.fn(),
    getFinancialStats: jest.fn(),
  } as jest.Mocked<DashboardSalesQueryPort>;
  const catalogQueries = {
    getProductStats: jest.fn(),
    getReviewStats: jest.fn(),
  } as jest.Mocked<DashboardCatalogQueryPort>;
  const geoActivityQueries = {
    getGeoStats: jest.fn(),
    getRecentActivity: jest.fn(),
  } as jest.Mocked<DashboardGeoActivityQueryPort>;
  const analyticsQueries = {
    getAnalytics: jest.fn(),
  } as jest.Mocked<DashboardAnalyticsQueryPort>;
  const cache = {
    remember: jest.fn((_key: string, _ttl: number, _tags: string[], load: () => Promise<Record<string, unknown>>) =>
      load(),
    ),
  } as unknown as CacheService;

  const handler = new DashboardQueryHandler(
    customerQueries,
    salesQueries,
    catalogQueries,
    geoActivityQueries,
    analyticsQueries,
    cache,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    customerQueries.getUserStats.mockResolvedValue({ total: 10 });
    customerQueries.getLoyaltyStats.mockResolvedValue({ points_distributed: 20 });
    salesQueries.getOrderStats.mockResolvedValue({ total: 30 });
    salesQueries.getFinancialStats.mockResolvedValue({ total_revenue: 40 });
    catalogQueries.getProductStats.mockResolvedValue({ total: 50 });
    catalogQueries.getReviewStats.mockResolvedValue({ total: 60 });
    geoActivityQueries.getGeoStats.mockResolvedValue({ countries: [] });
    geoActivityQueries.getRecentActivity.mockResolvedValue({ orders: [] });
    analyticsQueries.getAnalytics.mockResolvedValue({ businessMetrics: { orders: 30 } });
  });

  it('assembles the existing aggregate home contract from focused query ports', async () => {
    const result = await handler.getHome({ preset: '30d' }, 'en');

    expect(result).toMatchObject({
      users: { total: 10 },
      orders: { total: 30 },
      products: { total: 50 },
      reviews: { total: 60 },
      loyalty: { points_distributed: 20 },
      financial: { total_revenue: 40 },
      geo: { countries: [] },
      recent_activity: { orders: [] },
      analytics: { businessMetrics: { orders: 30 } },
    });
    expect(cache.remember).toHaveBeenCalledTimes(1);
  });

  it('loads only the repositories required by a section request', async () => {
    await handler.getSection('geo', { preset: '30d' }, 'en');

    expect(geoActivityQueries.getGeoStats).toHaveBeenCalledTimes(1);
    expect(customerQueries.getUserStats).not.toHaveBeenCalled();
    expect(salesQueries.getOrderStats).not.toHaveBeenCalled();
    expect(analyticsQueries.getAnalytics).not.toHaveBeenCalled();
  });
});
