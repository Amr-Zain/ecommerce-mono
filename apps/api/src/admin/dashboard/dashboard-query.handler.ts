import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CacheService } from '@/shared/cache/cache.service';
import { publicCacheTags } from '@/shared/cache/cache-tags';
import { DashboardHomeQueryDto, DASHBOARD_SECTIONS, DashboardSection } from './dto/dashboard-home-query.dto';
import {
  DASHBOARD_ANALYTICS_QUERIES,
  DASHBOARD_CATALOG_QUERIES,
  DASHBOARD_CUSTOMER_QUERIES,
  DASHBOARD_GEO_ACTIVITY_QUERIES,
  DASHBOARD_SALES_QUERIES,
  DashboardAnalyticsQueryPort,
  DashboardCatalogQueryPort,
  DashboardCustomerQueryPort,
  DashboardGeoActivityQueryPort,
  DashboardSalesQueryPort,
} from './dashboard-query.port';

type Granularity = 'day' | 'week' | 'month';
type DateRange = { from: Date; to: Date; granularity: Granularity };
type DashboardHomeSections = {
  filters?: unknown;
  users?: unknown;
  orders?: unknown;
  products?: unknown;
  reviews?: unknown;
  loyalty?: unknown;
  financial?: unknown;
  geo?: unknown;
  recent_activity?: unknown;
  analytics?: unknown;
};

@Injectable()
export class DashboardQueryHandler {
  private readonly dashboardCacheTtl = 60;

  constructor(
    @Inject(DASHBOARD_CUSTOMER_QUERIES)
    private readonly customerQueries: DashboardCustomerQueryPort,
    @Inject(DASHBOARD_SALES_QUERIES)
    private readonly salesQueries: DashboardSalesQueryPort,
    @Inject(DASHBOARD_CATALOG_QUERIES)
    private readonly catalogQueries: DashboardCatalogQueryPort,
    @Inject(DASHBOARD_GEO_ACTIVITY_QUERIES)
    private readonly geoActivityQueries: DashboardGeoActivityQueryPort,
    @Inject(DASHBOARD_ANALYTICS_QUERIES)
    private readonly analyticsQueries: DashboardAnalyticsQueryPort,
    private readonly cache: CacheService,
  ) {}

  async getHome(query: DashboardHomeQueryDto = {}, langId = 'en') {
    const range = this.resolveRange(query);
    const sections = this.resolveSections(query.sections);
    const cacheKey = this.cacheKey(query, range, sections, langId);

    return this.cache.remember(cacheKey, this.dashboardCacheTtl, [publicCacheTags.dashboardHome], () =>
      this.buildHome(query, langId, range, sections),
    );
  }

  async getSection(section: DashboardSection, query: DashboardHomeQueryDto = {}, langId = 'en') {
    const sectionQueries: Record<DashboardSection, string> = {
      overview: 'overview,geo,recent,charts',
      sales: 'sales,charts',
      customers: 'customers,charts',
      inventory: 'inventory,charts',
      reviews: 'reviews,charts',
      loyalty: 'loyalty,customers,charts',
      geo: 'geo',
      recent: 'recent',
      charts: 'charts',
    };
    return this.getHome({ ...query, sections: sectionQueries[section] }, langId);
  }

  private async buildHome(
    query: DashboardHomeQueryDto,
    langId: string,
    range: DateRange,
    sections: Set<DashboardSection>,
  ) {
    const [users, orders, products, reviews, loyalty, financial, geo, recentActivity, analytics] = await Promise.all([
      this.when(sections, ['overview', 'customers'], () =>
        this.customerQueries.getUserStats(range, langId, query.compare ?? true),
      ),
      this.when(sections, ['overview', 'sales'], () =>
        this.salesQueries.getOrderStats(range, langId, query.compare ?? true),
      ),
      this.when(sections, ['overview', 'inventory'], () => this.catalogQueries.getProductStats(range, langId)),
      this.when(sections, ['overview', 'reviews'], () => this.catalogQueries.getReviewStats(range, langId)),
      this.when(sections, ['overview', 'loyalty'], () => this.customerQueries.getLoyaltyStats(range, langId)),
      this.when(sections, ['overview', 'sales'], () => this.salesQueries.getFinancialStats(range)),
      this.when(sections, ['geo'], () => this.geoActivityQueries.getGeoStats(langId)),
      this.when(sections, ['overview', 'recent'], () => this.geoActivityQueries.getRecentActivity(langId)),
      this.when(sections, ['charts'], () => this.analyticsQueries.getAnalytics(range)),
    ]);

    return this.withDefaults({
      filters: {
        preset: query.preset ?? '30d',
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        granularity: range.granularity,
        compare: query.compare ?? true,
        sections: Array.from(sections),
        generated_at: new Date().toISOString(),
        cache_ttl_seconds: this.dashboardCacheTtl,
      },
      users,
      orders,
      products,
      reviews,
      loyalty,
      financial,
      geo,
      recent_activity: recentActivity,
      analytics,
    });
  }

  private cacheKey(query: DashboardHomeQueryDto, range: DateRange, sections: Set<DashboardSection>, langId: string) {
    const parts = [
      'admin:dashboard:home',
      `lang:${langId}`,
      `preset:${query.preset ?? '30d'}`,
      `from:${range.from.toISOString()}`,
      `to:${range.to.toISOString()}`,
      `granularity:${range.granularity}`,
      `compare:${query.compare ?? true}`,
      `sections:${Array.from(sections).sort().join(',')}`,
    ];
    return parts.join('|');
  }

  private resolveRange(query: DashboardHomeQueryDto): DateRange {
    const preset = query.preset ?? '30d';
    const now = new Date();
    let from: Date;
    let to = now;

    if (preset === 'custom') {
      if (!query.from || !query.to) {
        throw new BadRequestException('Custom dashboard range requires from and to dates.');
      }
      from = this.startOfDay(new Date(query.from));
      to = this.endOfDay(new Date(query.to));
    } else if (preset === 'today') {
      from = this.startOfDay(now);
      to = this.endOfDay(now);
    } else if (preset === '7d') {
      from = this.addDays(now, -6);
    } else if (preset === '90d') {
      from = this.addDays(now, -89);
    } else if (preset === 'year') {
      from = this.startOfYear(now);
    } else {
      from = this.addDays(now, -29);
    }

    if (from > to) {
      throw new BadRequestException('Dashboard from date must be before to date.');
    }

    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
    const granularity =
      query.granularity && query.granularity !== 'auto'
        ? query.granularity
        : days > 120
          ? 'month'
          : days > 45
            ? 'week'
            : 'day';
    return { from: this.startOfDay(from), to: this.endOfDay(to), granularity };
  }

  private resolveSections(value?: string): Set<DashboardSection> {
    if (!value) return new Set(DASHBOARD_SECTIONS);
    const requested = value
      .split(',')
      .map((section) => section.trim())
      .filter((section): section is DashboardSection => DASHBOARD_SECTIONS.includes(section as DashboardSection));
    return new Set(requested.length > 0 ? requested : DASHBOARD_SECTIONS);
  }

  private async when<T>(
    sections: Set<DashboardSection>,
    sectionNames: DashboardSection[],
    load: () => Promise<T>,
  ): Promise<T | undefined> {
    if (!sectionNames.some((section) => sections.has(section))) return undefined;
    return load();
  }

  private withDefaults(data: DashboardHomeSections) {
    return {
      filters: data.filters,
      users: data.users ?? {
        total: 0,
        active: 0,
        banned: 0,
        new_today: 0,
        new_this_week: 0,
        new_this_month: 0,
        growth_trend: 0,
        by_type: {},
        by_tier: [],
      },
      orders: data.orders ?? {
        total: 0,
        by_status: {},
        revenue: { total: 0, today: 0, this_week: 0, this_month: 0, this_year: 0, trend: 0 },
        average_order_value: 0,
        orders_today: 0,
        orders_this_week: 0,
        orders_this_month: 0,
        top_products: [],
      },
      products: data.products ?? {
        total: 0,
        active: 0,
        out_of_stock: 0,
        low_stock: 0,
        added_today: 0,
        added_this_week: 0,
        added_this_month: 0,
        inventory_value: 0,
        most_viewed: [],
        most_wishlisted: [],
        recent_products: [],
      },
      reviews: data.reviews ?? {
        total: 0,
        pending_approval: 0,
        average_rating: 0,
        this_month: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        most_reviewed: [],
      },
      loyalty: data.loyalty ?? {
        total_points_distributed: 0,
        total_points_redeemed: 0,
        active_rewards: 0,
        total_redeemed_rewards: 0,
        points_this_month: 0,
        users_by_tier: [],
        range_points: 0,
      },
      financial: data.financial ?? {
        total_revenue: 0,
        revenue_this_month: 0,
        revenue_today: 0,
        pending_payments: 0,
        refunded_this_month: 0,
        net_revenue: 0,
      },
      geo: data.geo ?? { generated_at: new Date().toISOString(), countries: [] },
      recent_activity: data.recent_activity ?? { orders: [], users: [], reviews: [], products: [] },
      analytics: data.analytics ?? {
        salesTrend: [],
        ordersByStatus: [],
        ordersByPaymentMethod: [],
        paymentHealth: [],
        customerSegments: [],
        customerGrowth: [],
        inventoryStockStates: [],
        reviewRatings: [],
        loyaltyPointsTrend: [],
        businessMetrics: {
          grossRevenue: 0,
          netRevenue: 0,
          orders: 0,
          averageOrderValue: 0,
          refundRate: 0,
          repeatCustomerRate: 0,
          reviewApprovalRate: 0,
          inventoryAtRisk: 0,
          pendingOperations: 0,
        },
        operationalAlerts: {
          pendingPaymentsCount: 0,
          pendingPaymentsAmount: 0,
          pendingReviews: 0,
          openTickets: 0,
          openReturns: 0,
          openExchanges: 0,
          lowStockVariants: 0,
          outOfStockVariants: 0,
          refundRequestsValue: 0,
        },
      },
    };
  }

  private startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private endOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  private startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
  }

  private addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }
}
