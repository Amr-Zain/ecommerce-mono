import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardAnalyticsQueryPort, DashboardDateRange } from './dashboard-query.port';
import { DashboardPrismaQueryRepository } from './dashboard-prisma-query.repository';

@Injectable()
export class DashboardAnalyticsQueryRepository
  extends DashboardPrismaQueryRepository
  implements DashboardAnalyticsQueryPort
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getAnalytics(range: DashboardDateRange) {
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
        this.prisma.review.groupBy({
          by: ['rating'],
          where: { createdAt: { gte: range.from, lte: range.to } },
          _count: { _all: true },
        }),
        this.prisma.review.findMany({
          where: { createdAt: { gte: range.from, lte: range.to } },
          select: { isVerified: true },
        }),
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
    const customerIds = [...new Set(orders.map((order) => order.userId))];
    const priorCustomers =
      customerIds.length > 0
        ? await this.prisma.order.findMany({
            where: { userId: { in: customerIds }, createdAt: { lt: range.from } },
            distinct: ['userId'],
            select: { userId: true },
          })
        : [];
    const priorCustomerIds = new Set(priorCustomers.map((order) => order.userId.toString()));
    const firstTimeCustomers = customerIds.filter((userId) => !priorCustomerIds.has(userId.toString())).length;
    const repeatCustomers = customerIds.length - firstTimeCustomers;
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
        repeatCustomerRate: this.round(customerIds.length > 0 ? (repeatCustomers / customerIds.length) * 100 : 0),
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
}
