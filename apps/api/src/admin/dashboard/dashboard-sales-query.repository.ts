import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardSalesQueryPort, DashboardDateRange } from './dashboard-query.port';
import { DashboardPrismaQueryRepository } from './dashboard-prisma-query.repository';

@Injectable()
export class DashboardSalesQueryRepository extends DashboardPrismaQueryRepository implements DashboardSalesQueryPort {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getOrderStats(range: DashboardDateRange, langId: string, compare: boolean) {
    const [total, byStatusRaw, periodRevenue, previousRevenue, revenue, topProductsRaw] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.paymentTransaction.aggregate({
        where: { paymentStatus: 'completed', createdAt: { gte: range.from, lte: range.to } },
        _sum: { amount: true },
      }),
      compare
        ? this.prisma.paymentTransaction.aggregate({
            where: { paymentStatus: 'completed', createdAt: this.previousRangeWhere(range) },
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: null } }),
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
        trend: compare
          ? this.percentageChange(
              this.decimalToNumber(periodRevenue._sum.amount),
              this.decimalToNumber(previousRevenue._sum.amount),
            )
          : 0,
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

  async getFinancialStats(range: DashboardDateRange) {
    const [totalRevenue, totalRefunds, periodRevenue, periodRefunds, todayRevenue, pendingPayments, refundedThisMonth] =
      await Promise.all([
        this.prisma.paymentTransaction.aggregate({ where: { paymentStatus: 'completed' }, _sum: { amount: true } }),
        this.prisma.paymentTransaction.aggregate({ where: { paymentStatus: 'refunded' }, _sum: { amount: true } }),
        this.prisma.paymentTransaction.aggregate({
          where: { paymentStatus: 'completed', createdAt: { gte: range.from, lte: range.to } },
          _sum: { amount: true },
        }),
        this.prisma.paymentTransaction.aggregate({
          where: { paymentStatus: 'refunded', createdAt: { gte: range.from, lte: range.to } },
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
    const allTimeRefunded = this.decimalToNumber(totalRefunds._sum.amount ?? 0);
    const rangeRevenue = this.decimalToNumber(periodRevenue._sum.amount ?? 0);
    const rangeRefunded = this.decimalToNumber(periodRefunds._sum.amount ?? 0);
    return {
      total_revenue: total,
      revenue_this_month: rangeRevenue,
      revenue_today: this.decimalToNumber(todayRevenue._sum.amount ?? 0),
      pending_payments: this.decimalToNumber(pendingPayments._sum.amount ?? 0),
      refunded_this_month: this.decimalToNumber(refundedThisMonth._sum.amount ?? 0),
      net_revenue: this.round(total - allTimeRefunded),
      range_revenue: rangeRevenue,
      range_refunds: rangeRefunded,
      range_net_revenue: this.round(rangeRevenue - rangeRefunded),
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
}
