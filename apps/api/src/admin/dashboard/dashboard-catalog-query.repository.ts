import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardCatalogQueryPort, DashboardDateRange } from './dashboard-query.port';
import { DashboardPrismaQueryRepository } from './dashboard-prisma-query.repository';

@Injectable()
export class DashboardCatalogQueryRepository
  extends DashboardPrismaQueryRepository
  implements DashboardCatalogQueryPort
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getProductStats(range: DashboardDateRange, langId: string) {
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

  async getReviewStats(range: DashboardDateRange, langId: string) {
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
}
