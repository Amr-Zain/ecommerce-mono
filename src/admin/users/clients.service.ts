import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, User as UserInterface } from '@/common/interfaces';
import { UsersRepository } from '@/core/users/users.repository';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(query: UserQueryDto, langId: string = 'en') {
    const result = await this.usersRepository.findAllClients(query, langId);

    if (Array.isArray(result)) {
      return Promise.all(result.map((user) => this.transformClientListItem(user)));
    }

    return {
      ...result,
      data: await Promise.all(result.data.map((user) => this.transformClientListItem(user))),
    };
  }

  async findOne(id: bigint) {
    const user = await this.usersRepository.findByIdAndType(id, 'client');

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.client_not_found', { args: { id: id.toString() } }));
    }

    return this.transformClientShow(user);
  }

  private async transformClientListItem(user: UserInterface) {
    const avatar = await this.mediaService.findByEntity('user', user.id, 'avatar');

    return {
      ...user,
      fullName: user.name,
      gender: user.gender ?? null,
      image: avatar[0] ?? null,
      isBan: false,
      points: 0,
      market: (user.settings as { market?: string } | null)?.market,
    };
  }

  private async transformClientShow(user: UserInterface) {
    const [baseUser, orderStats, orderCount, reviewStats, reviews, orders] = await Promise.all([
      this.transformClientListItem(user),
      this.prisma.orderPayment.aggregate({
        where: { order: { userId: user.id } },
        _sum: { totalPrice: true },
      }),
      this.prisma.order.count({
        where: { userId: user.id },
      }),
      this.prisma.review.aggregate({
        where: { userId: user.id },
        _count: { _all: true },
        _avg: { rating: true },
      }),
      this.prisma.review.findMany({
        where: { userId: user.id },
        include: {
          product: {
            include: {
              translations: {
                where: { langId: 'en' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.order.findMany({
        where: { userId: user.id },
        include: { payments: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      ...baseUser,
      gender: user.gender ?? null,
      birthDate: null,
      banReason: null,
      shopifyId: null,
      locale: this.getSettingsValue<string>(user.settings, 'locale', 'language') ?? 'en',
      allowNotifications:
        this.getSettingsValue<boolean>(user.settings, 'allowNotifications', 'allow_notifications') ?? true,
      lastLoginAt: null,
      lifetimePoints: 0,
      redeemedRewardsCount: 0,
      statistics: {
        totalOrders: orderCount,
        totalSpent: orderStats._sum.totalPrice ?? 0,
        activeCartItems: 0,
        activeCartTotal: 0,
        reviewsCount: reviewStats._count._all,
        averageRatingGiven: reviewStats._avg.rating,
        devicesCount: 0,
        addressesCount: user.addresses?.length ?? 0,
      },
      recentOrders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.id,
        status: order.status,
        total: order.payments.reduce((sum, payment) => sum + Number(payment.totalPrice), 0),
        createdAt: order.createdAt,
      })),
      recentReviews: reviews.map((review) => ({
        id: review.id,
        productName: review.product?.translations?.[0]?.name ?? null,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      devices: [],
      addresses: (user.addresses ?? []).map((address) => ({
        ...address,
        city: '',
      })),
    };
  }

  private getSettingsValue<T>(settings: unknown, ...keys: string[]): T | undefined {
    if (!settings || typeof settings !== 'object') return undefined;
    const record = settings as Record<string, T>;
    for (const key of keys) {
      if (record[key] !== undefined) return record[key];
    }
    return undefined;
  }
}
