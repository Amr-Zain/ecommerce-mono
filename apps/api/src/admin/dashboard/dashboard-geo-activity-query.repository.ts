import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardGeoActivityQueryPort } from './dashboard-query.port';
import { DashboardPrismaQueryRepository } from './dashboard-prisma-query.repository';

@Injectable()
export class DashboardGeoActivityQueryRepository
  extends DashboardPrismaQueryRepository
  implements DashboardGeoActivityQueryPort
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getGeoStats(langId: string) {
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

  async getRecentActivity(langId: string) {
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
}
