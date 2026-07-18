/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

type CustomerPerformanceRow = {
  userId: bigint;
  name: string | null;
  orders: number;
  quantity: number;
  revenue: unknown;
};

type BreakdownRow = {
  name: string;
  orders: number;
  quantity: number;
  revenue: unknown;
};

@Injectable()
export class ProductAnalyticsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(productId: number | bigint) {
    const id = BigInt(productId);
    const now = new Date();
    const periodFrom = this.startOfDay(this.addDays(now, -29));
    const previousFrom = this.addDays(periodFrom, -30);
    const previousTo = new Date(periodFrom.getTime() - 1);
    const startToday = this.startOfDay(now);
    const startWeek = this.addDays(startToday, -6);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const paidSaleWhere: Prisma.OrderItemWhereInput = {
      productId: id,
      isActive: true,
      order: {
        isActive: true,
        paymentStatus: 'completed',
        status: { not: 'cancelled' },
      },
    };
    const paidOrderWhere: Prisma.OrderWhereInput = {
      isActive: true,
      paymentStatus: 'completed',
      status: { not: 'cancelled' },
      items: { some: { productId: id, isActive: true } },
    };

    const [
      sales,
      orderCount,
      customers,
      currentPeriod,
      previousPeriod,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      yearRevenue,
      periodLines,
      variants,
      variantSales,
      reviewStats,
      ratingGroups,
      pendingReviews,
      wishlistCount,
      cartStats,
      cartCount,
      reservations,
      recentOrders,
      recentReviews,
      recentWishlists,
      inventoryLogs,
      priceHistory,
      returnItems,
      returnRequests,
      topCustomers,
      statusBreakdown,
      paymentBreakdown,
    ] = await Promise.all([
      this.prisma.orderItem.aggregate({
        where: paidSaleWhere,
        _sum: { quantity: true, netLineTotal: true },
      }),
      this.prisma.order.count({ where: paidOrderWhere }),
      this.prisma.order.groupBy({ by: ['userId'], where: paidOrderWhere, _count: { _all: true } }),
      this.saleAggregate(id, periodFrom, now),
      this.saleAggregate(id, previousFrom, previousTo),
      this.saleAggregate(id, startToday, now),
      this.saleAggregate(id, startWeek, now),
      this.saleAggregate(id, startMonth, now),
      this.saleAggregate(id, startYear, now),
      this.prisma.orderItem.findMany({
        where: { ...paidSaleWhere, createdAt: { gte: periodFrom, lte: now } },
        select: { orderId: true, quantity: true, netLineTotal: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.productVariant.findMany({
        where: { productId: id },
        include: {
          attributes: {
            include: {
              attribute: { include: { translations: true } },
              value: { include: { translations: true } },
            },
          },
        },
        orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.orderItem.groupBy({
        by: ['variantId'],
        where: paidSaleWhere,
        _sum: { quantity: true, netLineTotal: true },
        _count: { orderId: true },
      }),
      this.prisma.review.aggregate({
        where: { productId: id, isActive: true },
        _count: { _all: true },
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId: id, isActive: true },
        _count: { _all: true },
      }),
      this.prisma.review.count({ where: { productId: id, isActive: true, isVerified: false } }),
      this.prisma.wishlistItem.count({ where: { productId: id } }),
      this.prisma.cartItem.aggregate({ where: { productId: id }, _sum: { quantity: true } }),
      this.prisma.cartItem.count({ where: { productId: id } }),
      this.prisma.stockReservation.groupBy({
        by: ['variantId'],
        where: {
          variant: { productId: id },
          status: 'reserved',
          expiresAt: { gt: now },
        },
        _sum: { quantity: true },
      }),
      this.prisma.orderItem.findMany({
        where: { productId: id, isActive: true },
        distinct: ['orderId'],
        select: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalPrice: true,
              status: true,
              paymentStatus: true,
              createdAt: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.review.findMany({
        where: { productId: id },
        select: {
          id: true,
          rating: true,
          comment: true,
          isVerified: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.wishlistItem.findMany({
        where: { productId: id },
        select: { id: true, createdAt: true, user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.inventoryLog.findMany({
        where: { variant: { productId: id } },
        select: {
          id: true,
          changeAmount: true,
          previousStock: true,
          newStock: true,
          reason: true,
          createdAt: true,
          variant: { select: { id: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.priceHistory.findMany({
        where: { variant: { productId: id } },
        select: {
          id: true,
          oldPrice: true,
          newPrice: true,
          oldCompareAtPrice: true,
          newCompareAtPrice: true,
          createdAt: true,
          variant: { select: { id: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.returnRequestItem.aggregate({
        where: {
          orderItem: { productId: id },
          returnRequest: { status: { notIn: ['rejected', 'cancelled_by_client'] } },
        },
        _sum: { quantity: true, acceptedQuantity: true },
      }),
      this.prisma.returnRequestItem.findMany({
        where: { orderItem: { productId: id } },
        distinct: ['returnRequestId'],
        select: { returnRequestId: true, returnRequest: { select: { status: true } } },
      }),
      this.prisma.$queryRaw<CustomerPerformanceRow[]>(Prisma.sql`
        SELECT o.user_id AS "userId", u.name, COUNT(DISTINCT o.id)::int AS orders,
          COALESCE(SUM(oi.quantity), 0)::int AS quantity,
          COALESCE(SUM(oi.net_line_total), 0) AS revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN users u ON u.id = o.user_id
        WHERE oi.product_id = ${id} AND oi.is_active = true AND o.is_active = true
          AND o.payment_status = 'completed' AND o.status <> 'cancelled'
        GROUP BY o.user_id, u.name
        ORDER BY revenue DESC
        LIMIT 5
      `),
      this.breakdown(id, 'status'),
      this.breakdown(id, 'payment_method'),
    ]);

    const reservedByVariant = new Map(reservations.map((row) => [row.variantId.toString(), row._sum.quantity ?? 0]));
    const salesByVariant = new Map(variantSales.map((row) => [row.variantId?.toString() ?? '', row]));
    const currentStock = variants
      .filter((variant) => variant.isActive)
      .reduce((sum, variant) => sum + variant.stockQuantity, 0);
    const reservedStock = [...reservedByVariant.values()].reduce((sum, quantity) => sum + quantity, 0);
    const availableStock = Math.max(0, currentStock - reservedStock);
    const stockValue = variants.reduce(
      (sum, variant) => sum + variant.stockQuantity * Number(variant.costPrice ?? variant.price),
      0,
    );
    const retailValue = variants.reduce((sum, variant) => sum + variant.stockQuantity * Number(variant.price), 0);
    const totalSold = sales._sum.quantity ?? 0;
    const totalRevenue = Number(sales._sum.netLineTotal ?? 0);
    const currentRevenue = Number(currentPeriod._sum.netLineTotal ?? 0);
    const previousRevenue = Number(previousPeriod._sum.netLineTotal ?? 0);

    return {
      period: {
        from: periodFrom,
        to: now,
        comparison_from: previousFrom,
        comparison_to: previousTo,
        days: 30,
      },
      sales: {
        total_sold: totalSold,
        total_revenue: totalRevenue,
        orders_count: orderCount,
        customers_count: customers.length,
        revenue_breakdown: {
          today: Number(todayRevenue._sum.netLineTotal ?? 0),
          this_week: Number(weekRevenue._sum.netLineTotal ?? 0),
          this_month: Number(monthRevenue._sum.netLineTotal ?? 0),
          this_year: Number(yearRevenue._sum.netLineTotal ?? 0),
        },
        sales_trend: this.percentageChange(currentRevenue, previousRevenue),
        average_order_qty: orderCount ? this.round(totalSold / orderCount) : 0,
        average_order_value: orderCount ? this.round(totalRevenue / orderCount) : 0,
        average_selling_price: totalSold ? this.round(totalRevenue / totalSold) : 0,
      },
      engagement: {
        views_count: null,
        view_tracking_available: false,
        wishlist_count: wishlistCount,
        cart_additions: cartStats._sum.quantity ?? 0,
        carts_count: cartCount,
        conversion_rate: null,
      },
      reviews: {
        total_count: reviewStats._count._all,
        average_rating: this.round(reviewStats._avg.rating ?? 0),
        rating_distribution: Object.fromEntries(
          [1, 2, 3, 4, 5].map((rating) => [
            `${rating}_star`,
            ratingGroups.find((group) => group.rating === rating)?._count._all ?? 0,
          ]),
        ),
        pending_count: pendingReviews,
      },
      inventory: {
        current_stock: currentStock,
        reserved_stock: reservedStock,
        available_stock: availableStock,
        stock_value: this.round(stockValue),
        retail_value: this.round(retailValue),
        stock_status: availableStock <= 0 ? 'out_of_stock' : availableStock <= 5 ? 'low_stock' : 'in_stock',
        reorder_alert: availableStock <= 5,
        out_of_stock_variants: variants.filter((variant) => variant.isActive && variant.stockQuantity <= 0).length,
      },
      variations: {
        total_count: variants.length,
        active_count: variants.filter((variant) => variant.isActive).length,
        best_selling: this.bestSellingVariant(variants, salesByVariant),
        out_of_stock_count: variants.filter((variant) => variant.stockQuantity <= 0).length,
      },
      returns: {
        requests_count: returnRequests.length,
        requested_quantity: returnItems._sum.quantity ?? 0,
        accepted_quantity: returnItems._sum.acceptedQuantity ?? 0,
        by_status: Object.entries(
          returnRequests.reduce<Record<string, number>>((acc, item) => {
            const status = item.returnRequest.status;
            acc[status] = (acc[status] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([status, count]) => ({ status, count })),
      },
      sales_time_series: this.timeSeries(periodFrom, now, periodLines),
      order_status_breakdown: statusBreakdown.map(this.mapBreakdown),
      payment_method_breakdown: paymentBreakdown.map(this.mapBreakdown),
      variant_performance: variants.map((variant) => {
        const performance = salesByVariant.get(variant.id.toString());
        const reserved = reservedByVariant.get(variant.id.toString()) ?? 0;
        return {
          id: variant.id,
          sku: variant.sku,
          is_default: variant.isDefault,
          is_active: variant.isActive,
          attributes: variant.attributes.map((entry) => ({
            attribute:
              entry.attribute.translations.find((item) => item.langId === 'en')?.name ??
              entry.attribute.translations[0]?.name ??
              '',
            value:
              entry.value.translations.find((item) => item.langId === 'en')?.name ??
              entry.value.translations[0]?.name ??
              '',
          })),
          sold_quantity: performance?._sum.quantity ?? 0,
          revenue: Number(performance?._sum.netLineTotal ?? 0),
          order_lines: performance?._count.orderId ?? 0,
          current_stock: variant.stockQuantity,
          reserved_stock: reserved,
          available_stock: Math.max(0, variant.stockQuantity - reserved),
        };
      }),
      top_customers: topCustomers.map((customer) => ({
        user_id: customer.userId,
        name: customer.name || `Customer #${customer.userId.toString()}`,
        orders: Number(customer.orders),
        quantity: Number(customer.quantity),
        revenue: Number(customer.revenue),
      })),
      data_coverage: {
        sales: 'paid_non_cancelled_orders',
        views: 'not_tracked',
        cart: 'current_cart_state',
        wishlist: 'current_wishlist_state',
        product_edit_actors: 'not_tracked',
      },
      recent_activity: {
        orders: recentOrders.map(({ order }) => ({
          id: order.id,
          order_number: order.orderNumber,
          created_at: order.createdAt,
          total: Number(order.totalPrice),
          status: order.status,
          payment_status: order.paymentStatus,
          user_id: order.user.id,
          user_name: order.user.name || `Customer #${order.user.id.toString()}`,
        })),
        reviews: recentReviews.map((review) => ({
          id: review.id,
          user_id: review.user.id,
          user_name: review.user.name || `Customer #${review.user.id.toString()}`,
          rating: review.rating,
          comment: review.comment,
          is_approved: review.isVerified,
          created_at: review.createdAt,
        })),
        wishlists: recentWishlists.map((wishlist) => ({
          id: wishlist.id,
          user_id: wishlist.user?.id ?? null,
          user_name: wishlist.user?.name || 'Guest',
          created_at: wishlist.createdAt,
        })),
        inventory_logs: inventoryLogs,
        price_history: priceHistory,
      },
    };
  }

  private saleAggregate(productId: bigint, from: Date, to: Date) {
    return this.prisma.orderItem.aggregate({
      where: {
        productId,
        isActive: true,
        createdAt: { gte: from, lte: to },
        order: { isActive: true, paymentStatus: 'completed', status: { not: 'cancelled' } },
      },
      _sum: { quantity: true, netLineTotal: true },
    });
  }

  private breakdown(productId: bigint, field: 'status' | 'payment_method') {
    const column = field === 'status' ? Prisma.raw('o.status') : Prisma.raw('o.payment_method');
    return this.prisma.$queryRaw<BreakdownRow[]>(Prisma.sql`
      SELECT ${column} AS name, COUNT(DISTINCT o.id)::int AS orders,
        COALESCE(SUM(oi.quantity), 0)::int AS quantity,
        COALESCE(SUM(oi.net_line_total), 0) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ${productId} AND oi.is_active = true AND o.is_active = true
        AND o.payment_status = 'completed' AND o.status <> 'cancelled'
      GROUP BY ${column}
      ORDER BY revenue DESC
    `);
  }

  private readonly mapBreakdown = (row: BreakdownRow) => ({
    name: row.name,
    orders: Number(row.orders),
    quantity: Number(row.quantity),
    revenue: Number(row.revenue),
  });

  private timeSeries(
    from: Date,
    to: Date,
    lines: Array<{ orderId: bigint; quantity: number; netLineTotal: unknown; createdAt: Date }>,
  ) {
    const buckets = new Map<string, { date: string; quantity: number; revenue: number; orderIds: Set<string> }>();
    for (let cursor = new Date(from); cursor <= to; cursor = this.addDays(cursor, 1)) {
      const date = cursor.toISOString().slice(0, 10);
      buckets.set(date, { date, quantity: 0, revenue: 0, orderIds: new Set() });
    }
    for (const line of lines) {
      const date = line.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(date);
      if (!bucket) continue;
      bucket.quantity += line.quantity;
      bucket.revenue += Number(line.netLineTotal);
      bucket.orderIds.add(line.orderId.toString());
    }
    return [...buckets.values()].map((bucket) => ({
      date: bucket.date,
      quantity: bucket.quantity,
      revenue: this.round(bucket.revenue),
      orders: bucket.orderIds.size,
    }));
  }

  private bestSellingVariant(
    variants: Array<{ id: bigint; sku: string | null }>,
    sales: Map<string, { _sum: { quantity: number | null; netLineTotal: unknown } }>,
  ) {
    const best = [...variants]
      .map((variant) => ({ variant, performance: sales.get(variant.id.toString()) }))
      .sort((a, b) => (b.performance?._sum.quantity ?? 0) - (a.performance?._sum.quantity ?? 0))[0];
    if (!best || !best.performance || !best.performance._sum.quantity) return null;
    return {
      id: best.variant.id,
      sku: best.variant.sku,
      sold_quantity: best.performance._sum.quantity,
      revenue: Number(best.performance._sum.netLineTotal ?? 0),
    };
  }

  private percentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return this.round(((current - previous) / Math.abs(previous)) * 100);
  }

  private startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number) {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
