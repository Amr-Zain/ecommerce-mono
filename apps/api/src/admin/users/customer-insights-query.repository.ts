import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, User as UserInterface } from '@/common/interfaces';
import { UsersRepository } from '@/core/users/users.repository';
import { UserQueryDto } from './dto/user-query.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { Prisma } from '@prisma/client';

type RecentOrderWithPayments = Prisma.OrderGetPayload<{ include: { payments: true } }>;
type LoyaltyAccountWithTier = Prisma.LoyaltyAccountGetPayload<{
  include: { currentTier: { include: { translations: true } } };
}>;

@Injectable()
export class CustomerInsightsQueryRepository {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(query: UserQueryDto, langId: string = 'en') {
    const result = await this.usersRepository.findAllClients(query, langId);

    if (Array.isArray(result)) return this.enrichClientList(result);

    return {
      ...result,
      data: await this.enrichClientList(result.data),
    };
  }

  async findOne(id: bigint) {
    const user = await this.usersRepository.findByIdAndType(id, 'client');

    if (!user) {
      throw new NotFoundException(this.i18n.t('errors.client_not_found', { args: { id: id.toString() } }));
    }

    return this.transformClientShow(user);
  }

  private async enrichClientList(users: UserInterface[]) {
    if (!users.length) return [];
    const ids = users.map((user) => user.id);
    const [avatars, accounts] = await Promise.all([
      this.mediaService.findByEntities('user', ids),
      this.prisma.loyaltyAccount.findMany({
        where: { userId: { in: ids } },
        include: { currentTier: { include: { translations: true } } },
      }),
    ]);
    const accountByUser = new Map(accounts.map((account) => [account.userId.toString(), account]));
    return users.map((user) =>
      this.transformClientListItem(
        user,
        avatars.get(user.id.toString())?.find((media) => media.collection === 'avatar') ?? null,
        accountByUser.get(user.id.toString()) ?? null,
      ),
    );
  }

  private transformClientListItem(
    user: UserInterface,
    avatar: unknown,
    loyaltyAccount: LoyaltyAccountWithTier | null,
  ) {
    return {
      ...user,
      fullName: user.name,
      gender: user.gender ?? null,
      image: avatar,
      isBan: false,
      points: loyaltyAccount?.availablePoints ?? 0,
      pendingPoints: loyaltyAccount?.pendingPoints ?? 0,
      lifetimePoints: loyaltyAccount?.lifetimePoints ?? 0,
      tier: loyaltyAccount?.currentTier
        ? {
            id: loyaltyAccount.currentTier.id.toString(),
            name:
              loyaltyAccount.currentTier.translations.find((translation) => translation.langId === 'en')?.name ||
              loyaltyAccount.currentTier.translations[0]?.name ||
              '',
            multiplier: Number(loyaltyAccount.currentTier.multiplier),
            minLifetimePoints: loyaltyAccount.currentTier.minLifetimePoints,
            color: loyaltyAccount.currentTier.color,
          }
        : null,
      market: (user.settings as { market?: string } | null)?.market,
    };
  }

  private async transformClientShow(user: UserInterface) {
    const [avatar, loyaltyAccount] = await Promise.all([
      this.mediaService.findByEntity('user', user.id, 'avatar'),
      this.prisma.loyaltyAccount.findUnique({
        where: { userId: user.id },
        include: { currentTier: { include: { translations: true } } },
      }),
    ]);
    const [orderStats, orderCount, reviewStats, reviews, orders, redeemedRewardsCount, loyaltyTransactions, cart, devices, addresses] =
      await Promise.all([
        this.prisma.paymentTransaction.aggregate({
          where: { order: { userId: user.id }, paymentStatus: 'completed' },
          _sum: { amount: true },
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
        this.prisma.loyaltyRewardRedemption.count({
          where: { userId: user.id, status: { in: ['redeemed', 'refunded'] } },
        }),
        this.prisma.loyaltyPointTransaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        this.prisma.cart.findUnique({
          where: { userId: user.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    variants: { where: { isActive: true }, select: { price: true }, orderBy: { id: 'asc' }, take: 1 },
                  },
                },
                variant: { select: { price: true } },
              },
            },
          },
        }),
        this.prisma.refreshToken.findMany({
          where: { userId: user.id, isRevoked: false, expiresAt: { gt: new Date() } },
          select: { id: true, deviceInfo: true, ipAddress: true, createdAt: true, expiresAt: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.address.findMany({
          where: { userId: user.id },
          include: { city: { include: { translations: { where: { langId: 'en' }, take: 1 } } } },
          orderBy: { isDefault: 'desc' },
        }),
      ]);

    const baseUser = this.transformClientListItem(user, avatar[0] ?? null, loyaltyAccount);
    const cartItems = cart?.items ?? [];

    return {
      ...baseUser,
      gender: user.gender ?? null,
      birthDate: null,
      banReason: null,
      shopifyId: null,
      locale: this.getSettingsValue<string>(user.settings, 'locale', 'language') ?? 'en',
      allowNotifications:
        this.getSettingsValue<boolean>(user.settings, 'allowNotifications', 'allow_notifications') ?? true,
      lastLoginAt: devices[0]?.createdAt ?? null,
      lifetimePoints: baseUser.lifetimePoints,
      redeemedRewardsCount,
      loyaltyTransactions: loyaltyTransactions.map((transaction) => ({
        ...transaction,
        id: transaction.id.toString(),
        accountId: transaction.accountId.toString(),
        userId: transaction.userId.toString(),
        earningRuleId: transaction.earningRuleId?.toString() ?? null,
        rewardId: transaction.rewardId?.toString() ?? null,
        redemptionId: transaction.redemptionId?.toString() ?? null,
      })),
      statistics: {
        totalOrders: orderCount,
        totalSpent: Number(orderStats._sum.amount ?? 0),
        activeCartItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        activeCartTotal: cartItems.reduce(
          (sum, item) => sum + Number(item.variant?.price ?? item.product.variants[0]?.price ?? 0) * item.quantity,
          0,
        ),
        reviewsCount: reviewStats._count._all,
        averageRatingGiven: reviewStats._avg.rating,
        devicesCount: devices.length,
        addressesCount: addresses.length,
      },
      recentOrders: orders.map((order: RecentOrderWithPayments) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.id.toString(),
        status: order.status,
        total: order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
        createdAt: order.createdAt,
      })),
      recentReviews: reviews.map((review) => ({
        id: review.id,
        productName: review.product?.translations?.[0]?.name ?? null,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      devices: devices.map((device) => ({ ...device, id: device.id.toString() })),
      addresses: addresses.map((address) => ({
        ...address,
        city: address.city?.translations[0]?.name ?? '',
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
