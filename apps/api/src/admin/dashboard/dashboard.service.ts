import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardHomeQueryDto, DASHBOARD_SECTIONS, DashboardSection } from './dto/dashboard-home-query.dto';
import { CacheService } from '@/shared/cache/cache.service';
import { publicCacheTags } from '@/shared/cache/cache-tags';

type Granularity = 'day' | 'week' | 'month';
type DateRange = { from: Date; to: Date; granularity: Granularity };
type Bucket = { period: string; start: Date; end: Date };
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
export class DashboardService {
  private readonly dashboardCacheTtl = 60;

  constructor(
    private readonly prisma: PrismaService,
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

  private async buildHome(
    query: DashboardHomeQueryDto,
    langId: string,
    range: DateRange,
    sections: Set<DashboardSection>,
  ) {
    const [users, orders, products, reviews, loyalty, financial, geo, recentActivity, analytics] = await Promise.all([
      this.when(sections, ['overview', 'customers'], () => this.getUserStats(range, langId)),
      this.when(sections, ['overview', 'sales'], () => this.getOrderStats(range, langId)),
      this.when(sections, ['overview', 'inventory'], () => this.getProductStats(range, langId)),
      this.when(sections, ['overview', 'reviews'], () => this.getReviewStats(range, langId)),
      this.when(sections, ['overview', 'loyalty'], () => this.getLoyaltyStats(range, langId)),
      this.when(sections, ['overview', 'sales'], () => this.getFinancialStats(range)),
      this.when(sections, ['geo'], () => this.getGeoStats(langId)),
      this.when(sections, ['overview', 'recent'], () => this.getRecentActivity(langId)),
      this.when(sections, ['charts'], () => this.getAnalytics(range)),
    ]);

    return this.withDefaults({
      filters: {
        preset: query.preset ?? '30d',
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        granularity: range.granularity,
        sections: Array.from(sections),
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

  private async getUserStats(range: DateRange, langId: string) {
    const [
      total,
      active,
      banned,
      newToday,
      newThisWeek,
      newThisMonth,
      byTypeRaw,
      byTierRaw,
      periodUsers,
      previousUsers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { userType: 'client' } }),
      this.prisma.user.count({ where: { userType: 'client', isActive: true } }),
      this.prisma.user.count({ where: { userType: 'client', isActive: false } }),
      this.prisma.user.count({ where: { userType: 'client', createdAt: { gte: this.startOfDay(new Date()) } } }),
      this.prisma.user.count({ where: { userType: 'client', createdAt: { gte: this.addDays(new Date(), -7) } } }),
      this.prisma.user.count({ where: { userType: 'client', createdAt: { gte: this.startOfMonth(new Date()) } } }),
      this.prisma.user.groupBy({ by: ['userType'], _count: { _all: true } }),
      this.prisma.loyaltyAccount.groupBy({ by: ['currentTierId'], _count: { _all: true } }),
      this.prisma.user.count({ where: { userType: 'client', createdAt: { gte: range.from, lte: range.to } } }),
      this.prisma.user.count({ where: { userType: 'client', createdAt: this.previousRangeWhere(range) } }),
    ]);

    const tiers = await this.prisma.loyaltyTier.findMany({
      where: { id: { in: byTierRaw.map((tier) => tier.currentTierId).filter((id): id is bigint => id !== null) } },
      include: { translations: true },
    });

    return {
      total,
      active,
      banned,
      new_today: newToday,
      new_this_week: newThisWeek,
      new_this_month: newThisMonth,
      growth_trend: this.percentageChange(periodUsers, previousUsers),
      by_type: Object.fromEntries(byTypeRaw.map((item) => [item.userType ?? 'unknown', item._count._all])),
      by_tier: byTierRaw.map((item) => {
        const tier = tiers.find((candidate) => candidate.id === item.currentTierId);
        return {
          id: item.currentTierId ? Number(item.currentTierId) : undefined,
          tier_name: this.translationName(tier?.translations, langId) || 'No tier',
          count: item._count._all,
        };
      }),
    };
  }

  private async getOrderStats(range: DateRange, langId: string) {
    const [total, byStatusRaw, periodOrders, previousOrders, revenue, topProductsRaw] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.count({ where: { createdAt: { gte: range.from, lte: range.to } } }),
      this.prisma.order.count({ where: { createdAt: this.previousRangeWhere(range) } }),
      this.getRevenueBuckets(),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { productId: { not: null }, order: { createdAt: { gte: range.from, lte: range.to } } },
        _sum: { quantity: true, netLineTotal: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const productIds = topProductsRaw.map((item) => item.productId).filter((id): id is bigint => id !== null);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { translations: true },
    });

    return {
      total,
      by_status: Object.fromEntries(byStatusRaw.map((item) => [item.status, item._count._all])),
      revenue: {
        ...revenue,
        trend: this.percentageChange(periodOrders, previousOrders),
      },
      average_order_value: total > 0 ? this.round(revenue.total / total) : 0,
      orders_today: await this.prisma.order.count({ where: { createdAt: { gte: this.startOfDay(new Date()) } } }),
      orders_this_week: await this.prisma.order.count({ where: { createdAt: { gte: this.addDays(new Date(), -7) } } }),
      orders_this_month: await this.prisma.order.count({
        where: { createdAt: { gte: this.startOfMonth(new Date()) } },
      }),
      top_products: topProductsRaw.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return {
          id: Number(item.productId ?? 0),
          name: this.translationName(product?.translations, langId) || 'Deleted product',
          sold: item._sum.quantity ?? 0,
          revenue: this.decimalToNumber(item._sum.netLineTotal ?? item._sum.totalPrice ?? 0),
        };
      }),
    };
  }

  private async getProductStats(range: DateRange, langId: string) {
    const [total, active, addedToday, addedThisWeek, addedThisMonth, variants, mostWishlistedRaw, recentProducts] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({ where: { createdAt: { gte: this.startOfDay(new Date()) } } }),
        this.prisma.product.count({ where: { createdAt: { gte: this.addDays(new Date(), -7) } } }),
        this.prisma.product.count({ where: { createdAt: { gte: this.startOfMonth(new Date()) } } }),
        this.prisma.productVariant.findMany({
          where: { isActive: true },
          select: { stockQuantity: true, price: true, costPrice: true },
        }),
        this.prisma.wishlistItem.groupBy({
          by: ['productId'],
          _count: { _all: true },
          orderBy: { _count: { productId: 'desc' } },
          take: 5,
        }),
        this.prisma.product.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { translations: true, variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] } },
        }),
      ]);

    const wishlistedProducts = await this.prisma.product.findMany({
      where: { id: { in: mostWishlistedRaw.map((item) => item.productId) } },
      include: { translations: true },
    });

    return {
      total,
      active,
      out_of_stock: variants.filter((variant) => variant.stockQuantity <= 0).length,
      low_stock: variants.filter((variant) => variant.stockQuantity > 0 && variant.stockQuantity <= 5).length,
      added_today: addedToday,
      added_this_week: addedThisWeek,
      added_this_month: addedThisMonth,
      inventory_value: this.round(
        variants.reduce(
          (sum, variant) => sum + variant.stockQuantity * this.decimalToNumber(variant.costPrice ?? variant.price),
          0,
        ),
      ),
      most_viewed: [],
      most_wishlisted: mostWishlistedRaw.map((item) => {
        const product = wishlistedProducts.find((candidate) => candidate.id === item.productId);
        return {
          id: Number(item.productId),
          name: this.translationName(product?.translations, langId) || 'Product',
          wishlist_count: item._count._all,
        };
      }),
      recent_products: recentProducts.map((product) => this.productListItem(product, langId)),
    };
  }

  private async getReviewStats(range: DateRange, langId: string) {
    const [total, pending, average, thisMonth, ratingRaw, mostReviewedRaw] = await Promise.all([
      this.prisma.review.count(),
      this.prisma.review.count({ where: { isVerified: false } }),
      this.prisma.review.aggregate({ _avg: { rating: true } }),
      this.prisma.review.count({ where: { createdAt: { gte: this.startOfMonth(new Date()) } } }),
      this.prisma.review.groupBy({ by: ['rating'], _count: { _all: true } }),
      this.prisma.review.groupBy({
        by: ['productId'],
        where: { createdAt: { gte: range.from, lte: range.to } },
        _count: { _all: true },
        _avg: { rating: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
    ]);

    const products = await this.prisma.product.findMany({
      where: { id: { in: mostReviewedRaw.map((item) => item.productId) } },
      include: { translations: true },
    });

    return {
      total,
      pending_approval: pending,
      average_rating: this.round(average._avg.rating ?? 0),
      this_month: thisMonth,
      rating_distribution: Object.fromEntries(
        [1, 2, 3, 4, 5].map((rating) => [rating, ratingRaw.find((item) => item.rating === rating)?._count._all ?? 0]),
      ),
      most_reviewed: mostReviewedRaw.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return {
          id: Number(item.productId),
          name: this.translationName(product?.translations, langId) || 'Product',
          reviews_count: item._count._all,
          average_rating: this.round(item._avg.rating ?? 0),
        };
      }),
    };
  }

  private async getLoyaltyStats(range: DateRange, langId: string) {
    const [distributed, redeemed, activeRewards, redeemedRewards, pointsThisMonth, usersByTier] = await Promise.all([
      this.prisma.loyaltyPointTransaction.aggregate({ where: { direction: 'earn' }, _sum: { points: true } }),
      this.prisma.loyaltyPointTransaction.aggregate({ where: { direction: 'redeem' }, _sum: { points: true } }),
      this.prisma.loyaltyReward.count({ where: { isActive: true } }),
      this.prisma.loyaltyRewardRedemption.count({ where: { status: { in: ['redeemed', 'refunded'] } } }),
      this.prisma.loyaltyPointTransaction.aggregate({
        where: { createdAt: { gte: this.startOfMonth(new Date()) } },
        _sum: { points: true },
      }),
      this.prisma.loyaltyAccount.groupBy({ by: ['currentTierId'], _count: { _all: true } }),
    ]);

    const tiers = await this.prisma.loyaltyTier.findMany({
      where: { id: { in: usersByTier.map((tier) => tier.currentTierId).filter((id): id is bigint => id !== null) } },
      include: { translations: true },
    });

    return {
      total_points_distributed: distributed._sum.points ?? 0,
      total_points_redeemed: redeemed._sum.points ?? 0,
      active_rewards: activeRewards,
      total_redeemed_rewards: redeemedRewards,
      points_this_month: pointsThisMonth._sum.points ?? 0,
      users_by_tier: usersByTier.map((item) => {
        const tier = tiers.find((candidate) => candidate.id === item.currentTierId);
        return {
          id: item.currentTierId ? Number(item.currentTierId) : undefined,
          tier_name: this.translationName(tier?.translations, langId) || 'No tier',
          count: item._count._all,
        };
      }),
      range_points: await this.sumLoyaltyPoints(range),
    };
  }

  private async getFinancialStats(range: DateRange) {
    const [totalRevenue, periodRevenue, todayRevenue, pendingPayments, refundedThisMonth] = await Promise.all([
      this.prisma.paymentTransaction.aggregate({ where: { paymentStatus: 'completed' }, _sum: { amount: true } }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: range.from, lte: range.to } },
        _sum: { amount: true },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: this.startOfDay(new Date()) } },
        _sum: { amount: true },
      }),
      this.prisma.paymentTransaction.aggregate({ where: { paymentStatus: 'pending' }, _sum: { amount: true } }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'refunded', createdAt: { gte: this.startOfMonth(new Date()) } },
        _sum: { amount: true },
      }),
    ]);

    const total = this.decimalToNumber(totalRevenue._sum.amount ?? 0);
    const refunded = this.decimalToNumber(refundedThisMonth._sum.amount ?? 0);
    return {
      total_revenue: total,
      revenue_this_month: this.decimalToNumber(periodRevenue._sum.amount ?? 0),
      revenue_today: this.decimalToNumber(todayRevenue._sum.amount ?? 0),
      pending_payments: this.decimalToNumber(pendingPayments._sum.amount ?? 0),
      refunded_this_month: refunded,
      net_revenue: this.round(total - refunded),
    };
  }

  private async getGeoStats(langId: string) {
    const countries = await this.prisma.country.findMany({ include: { translations: true } });
    const [orderGroups, userGroups] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['countryId'],
        where: { countryId: { not: null } },
        _count: { _all: true },
        _sum: { totalPrice: true },
      }),
      this.prisma.address.groupBy({
        by: ['countryId'],
        where: { countryId: { not: null } },
        _count: { userId: true },
      }),
    ]);

    return {
      generated_at: new Date().toISOString(),
      countries: countries.map((country) => {
        const order = orderGroups.find((item) => item.countryId === country.id);
        const users = userGroups.find((item) => item.countryId === country.id);
        const translation = country.translations.find((item) => item.langId === langId) ?? country.translations[0];
        return {
          country: {
            id: Number(country.id),
            code: translation?.shortName ?? country.phoneCode,
            name: translation?.name ?? 'Country',
          },
          orders_summary: {
            total: order?._count._all ?? 0,
            paid: order?._count._all ?? 0,
            revenue: this.decimalToNumber(order?._sum.totalPrice ?? 0),
          },
          users_summary: {
            total: users?._count.userId ?? 0,
            active: users?._count.userId ?? 0,
            banned: 0,
          },
        };
      }),
    };
  }

  private async getRecentActivity(langId: string) {
    const [orders, users, reviews, products] = await Promise.all([
      this.prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
      this.prisma.user.findMany({ where: { userType: 'client' }, orderBy: { createdAt: 'desc' }, take: 8 }),
      this.prisma.review.findMany({
        include: { user: true, product: { include: { translations: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { translations: true, variants: { orderBy: [{ isDefault: 'desc' }, { price: 'asc' }] } },
      }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: Number(order.id),
        order_number: Number(order.orderNumber) || order.id.toString(),
        user_name: order.user.name ?? order.user.email ?? 'Customer',
        total: this.decimalToNumber(order.totalPrice),
        status: order.status,
        created_at: this.formatDate(order.createdAt),
      })),
      users: users.map((user) => ({
        id: Number(user.id),
        full_name: user.name ?? 'Customer',
        email: user.email,
        is_active: user.isActive,
        created_at: this.formatDate(user.createdAt),
      })),
      reviews: reviews.map((review) => ({
        id: Number(review.id),
        user_name: review.user.name ?? review.user.email ?? 'Customer',
        product_name: this.translationName(review.product.translations, langId),
        rating: review.rating,
        is_approved: review.isVerified,
        created_at: this.formatDate(review.createdAt),
      })),
      products: products.map((product) => this.productListItem(product, langId)),
    };
  }

  private async getAnalytics(range: DateRange) {
    const buckets = this.makeBuckets(range);
    const [orders, payments, users, variants, reviews, allReviews, loyalty, returns, exchanges, openTickets] =
      await Promise.all([
        this.prisma.order.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { createdAt: true, totalPrice: true, status: true, userId: true, paymentStatus: true },
        }),
        this.prisma.paymentTransaction.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { createdAt: true, amount: true, paymentStatus: true, paymentMethod: true },
        }),
        this.prisma.user.findMany({
          where: { userType: 'client', createdAt: { gte: range.from, lte: range.to } },
          select: { createdAt: true, isActive: true },
        }),
        this.prisma.productVariant.findMany({ where: { isActive: true }, select: { stockQuantity: true } }),
        this.prisma.review.groupBy({ by: ['rating'], _count: { _all: true } }),
        this.prisma.review.findMany({ select: { isVerified: true } }),
        this.prisma.loyaltyPointTransaction.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { createdAt: true, direction: true, points: true },
        }),
        this.prisma.returnRequest.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { status: true, finalRefundAmount: true, calculatedRefundAmount: true },
        }),
        this.prisma.exchangeRequest.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { status: true, settlementAmount: true, totalPriceDifference: true },
        }),
        this.prisma.ticket.count({ where: { status: { notIn: ['closed', 'resolved', 'cancelled'] } } }),
      ]);

    const orderStatus = this.countBy(orders, (order) => order.status);
    const paymentMethod = this.countBy(
      payments.filter((payment) => payment.paymentStatus === 'completed'),
      (payment) => payment.paymentMethod,
    );
    const paymentHealth =
      orders.length > 0
        ? this.countBy(orders, (order) => order.paymentStatus || 'unknown')
        : this.countBy(payments, (payment) => payment.paymentStatus || 'unknown');
    const orderCountByUser = orders.reduce((acc, order) => {
      const key = order.userId.toString();
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
    const firstTimeCustomers = [...orderCountByUser.values()].filter((count) => count === 1).length;
    const repeatCustomers = [...orderCountByUser.values()].filter((count) => count > 1).length;
    const lowStockVariants = variants.filter(
      (variant) => variant.stockQuantity > 0 && variant.stockQuantity <= 5,
    ).length;
    const outOfStockVariants = variants.filter((variant) => variant.stockQuantity <= 0).length;
    const completedPayments = payments.filter((payment) => payment.paymentStatus === 'completed');
    const pendingPayments = payments.filter((payment) => payment.paymentStatus === 'pending');
    const refundedPayments = payments.filter((payment) => payment.paymentStatus === 'refunded');
    const grossRevenue = completedPayments.reduce((sum, payment) => sum + this.decimalToNumber(payment.amount), 0);
    const refunds = refundedPayments.reduce((sum, payment) => sum + this.decimalToNumber(payment.amount), 0);
    const pendingPaymentsAmount = pendingPayments.reduce(
      (sum, payment) => sum + this.decimalToNumber(payment.amount),
      0,
    );
    const pendingReviews = allReviews.filter((review) => !review.isVerified).length;
    const approvedReviews = allReviews.filter((review) => review.isVerified).length;
    const openReturnStatuses = new Set(['requested', 'approved', 'item_received', 'refund_pending']);
    const openExchangeStatuses = new Set([
      'requested',
      'approved',
      'item_received',
      'replacement_reserved',
      'replacement_shipped',
    ]);
    const openReturns = returns.filter((item) => openReturnStatuses.has(item.status));
    const openExchanges = exchanges.filter((item) => openExchangeStatuses.has(item.status));
    const refundRequestsValue = openReturns.reduce((sum, item) => {
      const amount = this.decimalToNumber(item.finalRefundAmount) || this.decimalToNumber(item.calculatedRefundAmount);
      return sum + amount;
    }, 0);
    const pendingOperations =
      pendingPayments.length + pendingReviews + openTickets + openReturns.length + openExchanges.length;

    return {
      salesTrend: buckets.map((bucket) => {
        const bucketOrders = orders.filter((order) => this.inBucket(order.createdAt, bucket));
        const bucketPayments = payments.filter((payment) => this.inBucket(payment.createdAt, bucket));
        const revenue = bucketPayments
          .filter((payment) => payment.paymentStatus === 'completed')
          .reduce((sum, payment) => sum + this.decimalToNumber(payment.amount), 0);
        const refunds = bucketPayments
          .filter((payment) => payment.paymentStatus === 'refunded')
          .reduce((sum, payment) => sum + this.decimalToNumber(payment.amount), 0);
        return {
          period: bucket.period,
          revenue: this.round(revenue),
          netRevenue: this.round(revenue - refunds),
          orders: bucketOrders.length,
          refunds: this.round(refunds),
        };
      }),
      ordersByStatus: Object.entries(orderStatus).map(([name, value]) => ({ name, value })),
      ordersByPaymentMethod: Object.entries(paymentMethod).map(([name, value]) => ({ name, value })),
      paymentHealth: Object.entries(paymentHealth).map(([name, value]) => ({ name, value })),
      customerSegments: [
        { name: 'first_time_range', value: firstTimeCustomers },
        { name: 'repeat_range', value: repeatCustomers },
      ],
      customerGrowth: buckets.map((bucket) => {
        const bucketUsers = users.filter((user) => this.inBucket(user.createdAt, bucket));
        return {
          period: bucket.period,
          newUsers: bucketUsers.length,
          activeUsers: bucketUsers.filter((user) => user.isActive).length,
        };
      }),
      inventoryStockStates: [
        { state: 'in_stock', count: variants.filter((variant) => variant.stockQuantity > 5).length },
        { state: 'low_stock', count: lowStockVariants },
        { state: 'out_of_stock', count: outOfStockVariants },
      ],
      reviewRatings: [1, 2, 3, 4, 5].map((rating) => ({
        rating: `${rating}`,
        count: reviews.find((item) => item.rating === rating)?._count._all ?? 0,
      })),
      loyaltyPointsTrend: buckets.map((bucket) => {
        const bucketPoints = loyalty.filter((item) => this.inBucket(item.createdAt, bucket));
        return {
          period: bucket.period,
          earned: bucketPoints.filter((item) => item.direction === 'earn').reduce((sum, item) => sum + item.points, 0),
          redeemed: bucketPoints
            .filter((item) => item.direction === 'redeem')
            .reduce((sum, item) => sum + item.points, 0),
        };
      }),
      businessMetrics: {
        grossRevenue: this.round(grossRevenue),
        netRevenue: this.round(grossRevenue - refunds),
        orders: orders.length,
        averageOrderValue: this.round(orders.length > 0 ? grossRevenue / orders.length : 0),
        refundRate: this.round(grossRevenue > 0 ? (refunds / grossRevenue) * 100 : 0),
        repeatCustomerRate: this.round(orderCountByUser.size > 0 ? (repeatCustomers / orderCountByUser.size) * 100 : 0),
        reviewApprovalRate: this.round(allReviews.length > 0 ? (approvedReviews / allReviews.length) * 100 : 0),
        inventoryAtRisk: lowStockVariants + outOfStockVariants,
        pendingOperations,
      },
      operationalAlerts: {
        pendingPaymentsCount: pendingPayments.length,
        pendingPaymentsAmount: this.round(pendingPaymentsAmount),
        pendingReviews,
        openTickets,
        openReturns: openReturns.length,
        openExchanges: openExchanges.length,
        lowStockVariants,
        outOfStockVariants,
        refundRequestsValue: this.round(refundRequestsValue),
      },
    };
  }

  private async getRevenueBuckets() {
    const [total, today, week, month, year] = await Promise.all([
      this.prisma.paymentTransaction.aggregate({ where: { paymentStatus: 'completed' }, _sum: { amount: true } }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: this.startOfDay(new Date()) } },
        _sum: { amount: true },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: this.addDays(new Date(), -7) } },
        _sum: { amount: true },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: this.startOfMonth(new Date()) } },
        _sum: { amount: true },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: this.startOfYear(new Date()) } },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: this.decimalToNumber(total._sum.amount ?? 0),
      today: this.decimalToNumber(today._sum.amount ?? 0),
      this_week: this.decimalToNumber(week._sum.amount ?? 0),
      this_month: this.decimalToNumber(month._sum.amount ?? 0),
      this_year: this.decimalToNumber(year._sum.amount ?? 0),
    };
  }

  private async sumLoyaltyPoints(range: DateRange) {
    const result = await this.prisma.loyaltyPointTransaction.aggregate({
      where: { createdAt: { gte: range.from, lte: range.to } },
      _sum: { points: true },
    });
    return result._sum.points ?? 0;
  }

  private productListItem(
    product: {
      id: bigint;
      translations: { langId: string; name: string }[];
      variants: { stockQuantity: number; price: unknown }[];
      isActive: boolean;
      createdAt: Date;
    },
    langId: string,
  ) {
    const variant = product.variants[0];
    return {
      id: Number(product.id),
      name: this.translationName(product.translations, langId) || 'Product',
      stock: variant?.stockQuantity ?? 0,
      price: this.decimalToNumber(variant?.price ?? 0),
      is_active: product.isActive,
      created_at: this.formatDate(product.createdAt),
    };
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

  private makeBuckets(range: DateRange): Bucket[] {
    const buckets: Bucket[] = [];
    let cursor = this.startOfDay(range.from);
    while (cursor <= range.to) {
      const start = new Date(cursor);
      const end =
        range.granularity === 'month'
          ? this.endOfMonth(start)
          : range.granularity === 'week'
            ? this.endOfDay(this.addDays(start, 6))
            : this.endOfDay(start);
      buckets.push({ period: this.bucketLabel(start, range.granularity), start, end: end > range.to ? range.to : end });
      cursor =
        range.granularity === 'month'
          ? this.addMonths(start, 1)
          : range.granularity === 'week'
            ? this.addDays(start, 7)
            : this.addDays(start, 1);
    }
    return buckets;
  }

  private inBucket(date: Date, bucket: Bucket) {
    return date >= bucket.start && date <= bucket.end;
  }

  private bucketLabel(date: Date, granularity: Granularity) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return granularity === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`;
  }

  private previousRangeWhere(range: DateRange) {
    const duration = range.to.getTime() - range.from.getTime();
    const previousTo = new Date(range.from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - duration);
    return { gte: previousFrom, lte: previousTo };
  }

  private countBy<T>(items: T[], key: (item: T) => string) {
    return items.reduce<Record<string, number>>((acc, item) => {
      const name = key(item) || 'unknown';
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});
  }

  private translationName(translations: { langId: string; name: string }[] | undefined, langId: string) {
    return translations?.find((translation) => translation.langId === langId)?.name ?? translations?.[0]?.name ?? '';
  }

  private decimalToNumber(value: unknown) {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value) || 0;
    if (typeof value === 'object') {
      const stringifier = (value as { toString?: () => string }).toString;
      if (typeof stringifier === 'function' && stringifier !== Object.prototype.toString) {
        return Number(stringifier.call(value)) || 0;
      }
    }
    return 0;
  }

  private percentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return this.round(((current - previous) / previous) * 100);
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
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

  private startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  private startOfYear(date: Date) {
    return new Date(date.getFullYear(), 0, 1);
  }

  private addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private addMonths(date: Date, months: number) {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + months);
    return copy;
  }
}
