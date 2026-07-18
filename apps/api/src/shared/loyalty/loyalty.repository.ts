import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { MediaService } from '@/media/media.service';
import { NotificationService } from '@/shared/notifications/notification.service';
import { AppSettingsService } from '@/shared/settings/settings.service';
import {
  DEFAULT_LOYALTY_SETTINGS,
  LOYALTY_EVENTS,
  LOYALTY_POINTS_TYPES,
  LOYALTY_REDEMPTION_STATUSES,
  LOYALTY_REFERENCE_TYPES,
  LOYALTY_REWARD_TYPES,
  LOYALTY_SETTINGS,
  LOYALTY_TRANSACTION_DIRECTIONS,
  LOYALTY_TRANSACTION_STATUSES,
  LOYALTY_TRANSACTION_TYPES,
} from './loyalty.constants';
import {
  CreateEarningRuleDto,
  CreateRewardDto,
  CreateTierDto,
  UpdateEarningRuleDto,
  UpdateRewardDto,
  UpdateTierDto,
} from './dto/loyalty.dto';

type LoyaltyDbClient = PrismaService | Prisma.TransactionClient;

type RewardForRedemption = Prisma.LoyaltyRewardGetPayload<{ include: { translations: true } }>;
type TierWithTranslations = Prisma.LoyaltyTierGetPayload<{ include: { translations: true } }>;

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class LoyaltyRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly notifications: NotificationService,
    private readonly settings: AppSettingsService,
  ) {}

  async listTiers(query: AdvancedQueryDto) {
    const where: Prisma.LoyaltyTierWhereInput = {};
    if (query.filters?.isActive !== undefined) where.isActive = this.toBool(query.filters.isActive);
    if (query.search) {
      where.translations = { some: { name: { contains: query.search, mode: 'insensitive' } } };
    }
    const orderBy = this.orderBy(query, { minLifetimePoints: 'asc' });
    const tiers = await this.prisma.loyaltyTier.findMany({
      where,
      include: { translations: true },
      orderBy,
    });
    const formatted = await Promise.all(tiers.map((tier) => this.formatTier(tier)));
    return query.paginate === false ? formatted : this.paginateArray(formatted, query, 'tiers');
  }

  async getTier(id: bigint) {
    const tier = await this.prisma.loyaltyTier.findUnique({ where: { id }, include: { translations: true } });
    if (!tier) throw new NotFoundException('Tier not found');
    return this.formatTier(tier);
  }

  async createTier(dto: CreateTierDto) {
    const tier = await this.prisma.loyaltyTier.create({
      data: {
        multiplier: dto.multiplier,
        minLifetimePoints: dto.minLifetimePoints,
        color: dto.color,
        isActive: dto.isActive ?? true,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
    await this.attachImage('tier', tier.id, 'icon', dto.icon);
    return this.getTier(tier.id);
  }

  async updateTier(id: bigint, dto: UpdateTierDto) {
    await this.assertTier(id);
    const tier = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.loyaltyTier.update({
        where: { id },
        data: {
          multiplier: dto.multiplier,
          minLifetimePoints: dto.minLifetimePoints,
          color: dto.color,
          isActive: dto.isActive,
          ...(dto.translations
            ? {
                translations: {
                  deleteMany: {},
                  create: dto.translations,
                },
              }
            : {}),
        },
        include: { translations: true },
      });
      return updated;
    });
    await this.attachImage('tier', tier.id, 'icon', dto.icon);
    await this.recalculateAllAccountTiers();
    return this.getTier(id);
  }

  async deleteTier(id: bigint) {
    await this.assertTier(id);
    await this.prisma.loyaltyTier.delete({ where: { id } });
    return { message: 'Tier deleted successfully' };
  }

  async listEarningRules(query: AdvancedQueryDto) {
    const where: Prisma.LoyaltyEarningRuleWhereInput = {};
    if (query.filters?.isActive !== undefined) where.isActive = this.toBool(query.filters.isActive);
    if (query.search) {
      where.translations = { some: { name: { contains: query.search, mode: 'insensitive' } } };
    }
    const rules = await this.prisma.loyaltyEarningRule.findMany({
      where,
      include: { translations: true },
      orderBy: this.orderBy(query, { createdAt: 'desc' }),
    });
    const formatted = await Promise.all(rules.map((rule) => this.formatEarningRule(rule)));
    return query.paginate === false ? formatted : this.paginateArray(formatted, query, 'earningRules');
  }

  async getEarningRule(id: bigint) {
    const rule = await this.prisma.loyaltyEarningRule.findUnique({ where: { id }, include: { translations: true } });
    if (!rule) throw new NotFoundException('Earning rule not found');
    return this.formatEarningRule(rule);
  }

  async createEarningRule(dto: CreateEarningRuleDto) {
    const rule = await this.prisma.loyaltyEarningRule.create({
      data: {
        eventKey: dto.eventKey,
        pointsType: dto.pointsType,
        pointsValue: dto.pointsValue,
        minOrderAmount: dto.minOrderAmount,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive ?? true,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
    await this.attachImage('earningrule', rule.id, 'image', dto.image);
    return this.getEarningRule(rule.id);
  }

  async updateEarningRule(id: bigint, dto: UpdateEarningRuleDto) {
    await this.assertEarningRule(id);
    const rule = await this.prisma.loyaltyEarningRule.update({
      where: { id },
      data: {
        pointsType: dto.pointsType,
        pointsValue: dto.pointsValue,
        minOrderAmount: dto.minOrderAmount,
        startsAt: dto.startsAt !== undefined ? (dto.startsAt ? new Date(dto.startsAt) : null) : undefined,
        endsAt: dto.endsAt !== undefined ? (dto.endsAt ? new Date(dto.endsAt) : null) : undefined,
        isActive: dto.isActive,
        ...(dto.translations
          ? {
              translations: {
                deleteMany: {},
                create: dto.translations,
              },
            }
          : {}),
      },
      include: { translations: true },
    });
    await this.attachImage('earningrule', rule.id, 'image', dto.image);
    return this.getEarningRule(id);
  }

  async deleteEarningRule(id: bigint) {
    await this.assertEarningRule(id);
    await this.prisma.loyaltyEarningRule.delete({ where: { id } });
    return { message: 'Earning rule deleted successfully' };
  }

  async listRewards(query: AdvancedQueryDto, clientOnly = false) {
    const where: Prisma.LoyaltyRewardWhereInput = {};
    if (clientOnly) where.isActive = true;
    if (query.filters?.isActive !== undefined) where.isActive = this.toBool(query.filters.isActive);
    if (query.filters?.rewardType) where.rewardType = String(query.filters.rewardType);
    if (query.search) {
      where.translations = { some: { name: { contains: query.search, mode: 'insensitive' } } };
    }
    const rewards = await this.prisma.loyaltyReward.findMany({
      where,
      include: { translations: true },
      orderBy: this.orderBy(query, { createdAt: 'desc' }),
    });
    const formatted = await Promise.all(rewards.map((reward) => this.formatReward(reward)));
    return query.paginate === false ? formatted : this.paginateArray(formatted, query, 'rewards');
  }

  async getReward(id: bigint) {
    const reward = await this.prisma.loyaltyReward.findUnique({ where: { id }, include: { translations: true } });
    if (!reward) throw new NotFoundException('Reward not found');
    return this.formatReward(reward);
  }

  async createReward(dto: CreateRewardDto) {
    this.assertRewardConfig(dto.rewardType, dto.maxDiscountAmount);
    const reward = await this.prisma.loyaltyReward.create({
      data: {
        pointsRequired: dto.pointsRequired,
        rewardType: dto.rewardType,
        rewardValue: dto.rewardValue,
        maxDiscountAmount: dto.maxDiscountAmount,
        minOrderAmount: dto.minOrderAmount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit ?? 1,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive ?? true,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
    await this.attachImage('reward', reward.id, 'image', dto.image);
    return this.getReward(reward.id);
  }

  async updateReward(id: bigint, dto: UpdateRewardDto) {
    const current = await this.prisma.loyaltyReward.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Reward not found');
    this.assertRewardConfig(
      dto.rewardType ?? current.rewardType,
      dto.maxDiscountAmount ?? Number(current.maxDiscountAmount || 0),
    );
    const reward = await this.prisma.loyaltyReward.update({
      where: { id },
      data: {
        pointsRequired: dto.pointsRequired,
        rewardType: dto.rewardType,
        rewardValue: dto.rewardValue,
        maxDiscountAmount: dto.maxDiscountAmount,
        minOrderAmount: dto.minOrderAmount,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        startsAt: dto.startsAt !== undefined ? (dto.startsAt ? new Date(dto.startsAt) : null) : undefined,
        endsAt: dto.endsAt !== undefined ? (dto.endsAt ? new Date(dto.endsAt) : null) : undefined,
        isActive: dto.isActive,
        ...(dto.translations
          ? {
              translations: {
                deleteMany: {},
                create: dto.translations,
              },
            }
          : {}),
      },
      include: { translations: true },
    });
    await this.attachImage('reward', reward.id, 'image', dto.image);
    return this.getReward(id);
  }

  async deleteReward(id: bigint) {
    await this.getReward(id);
    await this.prisma.loyaltyReward.delete({ where: { id } });
    return { message: 'Reward deleted successfully' };
  }

  async getClientSummary(userId: bigint, query: AdvancedQueryDto = {}) {
    const account = await this.getOrCreateAccount(userId);
    const [transactions, rewards] = await Promise.all([
      this.listClientTransactions(userId, query),
      this.listRewards({ paginate: false }, true),
    ]);
    const nextTier = await this.prisma.loyaltyTier.findFirst({
      where: { isActive: true, minLifetimePoints: { gt: account.lifetimePoints } },
      include: { translations: true },
      orderBy: { minLifetimePoints: 'asc' },
    });
    return {
      account: await this.formatAccount(account),
      nextTier: nextTier ? await this.formatTier(nextTier) : null,
      rewards,
      transactions,
    };
  }

  async listClientTransactions(userId: bigint, query: AdvancedQueryDto = {}) {
    const take = Number(query.limit || 10);
    const page = Number(query.page || 1);
    const [items, total] = await Promise.all([
      this.prisma.loyaltyPointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.loyaltyPointTransaction.count({ where: { userId } }),
    ]);
    return {
      items: items.map((transaction) => this.formatTransaction(transaction)),
      meta: this.meta(page, take, total),
    };
  }

  async previewReward(userId: bigint, input: { rewardId?: string | number | null; subtotal: number; total: number }) {
    if (!input.rewardId) return null;
    const reward = await this.findRewardForUse(BigInt(input.rewardId));
    const account = await this.getOrCreateAccount(userId);
    await this.assertRewardUsable(userId, account.availablePoints, reward, input.subtotal);
    const discountAmount = await this.calculateRewardDiscount(reward, input.subtotal, input.total);
    return {
      reward: await this.formatReward(reward),
      points: reward.pointsRequired,
      discountAmount,
      availablePoints: account.availablePoints,
      pendingPoints: account.pendingPoints,
    };
  }

  async reserveForCheckout(
    tx: LoyaltyDbClient,
    input: {
      userId: bigint;
      rewardId?: string | number | bigint | null;
      pendingCheckoutId: bigint;
      subtotal: number;
      total: number;
      discountAmount: number;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!input.rewardId || input.discountAmount <= 0) return null;
    const reward = await this.findRewardForUse(BigInt(input.rewardId), tx);
    const account = await this.getOrCreateAccount(input.userId, tx);
    await this.assertRewardUsable(input.userId, account.availablePoints, reward, input.subtotal, tx);

    const claim = await tx.loyaltyAccount.updateMany({
      where: { id: account.id, availablePoints: { gte: reward.pointsRequired }, status: 'active' },
      data: {
        availablePoints: { decrement: reward.pointsRequired },
        pendingPoints: { increment: reward.pointsRequired },
      },
    });
    if (claim.count !== 1) throw new BadRequestException('Insufficient loyalty points');

    const redemption = await tx.loyaltyRewardRedemption.create({
      data: {
        accountId: account.id,
        userId: input.userId,
        rewardId: reward.id,
        pendingCheckoutId: input.pendingCheckoutId,
        points: reward.pointsRequired,
        discountAmount: input.discountAmount,
        status: LOYALTY_REDEMPTION_STATUSES.held,
        rewardSnapshot: toJson(this.rewardSnapshot(reward, input.discountAmount)),
      },
    });

    return tx.loyaltyPointTransaction.create({
      data: {
        accountId: account.id,
        userId: input.userId,
        rewardId: reward.id,
        redemptionId: redemption.id,
        type: LOYALTY_TRANSACTION_TYPES.hold,
        direction: LOYALTY_TRANSACTION_DIRECTIONS.debit,
        points: reward.pointsRequired,
        availableDelta: -reward.pointsRequired,
        pendingDelta: reward.pointsRequired,
        status: LOYALTY_TRANSACTION_STATUSES.pending,
        referenceType: LOYALTY_REFERENCE_TYPES.pendingCheckout,
        referenceId: input.pendingCheckoutId.toString(),
        description: 'Loyalty reward checkout hold',
        metadata: toJson(input.metadata || {}),
      },
    });
  }

  async captureCheckoutRedemption(tx: LoyaltyDbClient, input: { pendingCheckoutId: bigint; orderId: bigint }) {
    const redemption = await tx.loyaltyRewardRedemption.findUnique({
      where: { pendingCheckoutId: input.pendingCheckoutId },
    });
    if (!redemption || redemption.status !== LOYALTY_REDEMPTION_STATUSES.held) return null;

    const claim = await tx.loyaltyAccount.updateMany({
      where: { id: redemption.accountId, pendingPoints: { gte: redemption.points } },
      data: { pendingPoints: { decrement: redemption.points } },
    });
    if (claim.count !== 1) {
      await tx.loyaltyRewardRedemption.update({
        where: { id: redemption.id },
        data: { status: LOYALTY_TRANSACTION_STATUSES.requiresReview },
      });
      throw new BadRequestException('Loyalty points hold could not be captured');
    }

    await tx.loyaltyReward.update({
      where: { id: redemption.rewardId },
      data: { usageCount: { increment: 1 } },
    });
    await tx.loyaltyPointTransaction.updateMany({
      where: {
        redemptionId: redemption.id,
        type: LOYALTY_TRANSACTION_TYPES.hold,
        status: LOYALTY_TRANSACTION_STATUSES.pending,
      },
      data: {
        type: LOYALTY_TRANSACTION_TYPES.redeem,
        status: LOYALTY_TRANSACTION_STATUSES.completed,
        referenceType: LOYALTY_REFERENCE_TYPES.order,
        referenceId: input.orderId.toString(),
        completedAt: new Date(),
      },
    });
    return tx.loyaltyRewardRedemption.update({
      where: { id: redemption.id },
      data: {
        orderId: input.orderId,
        status: LOYALTY_REDEMPTION_STATUSES.redeemed,
        redeemedAt: new Date(),
      },
    });
  }

  async releaseCheckoutRedemption(tx: LoyaltyDbClient, pendingCheckoutId: bigint) {
    const redemption = await tx.loyaltyRewardRedemption.findUnique({ where: { pendingCheckoutId } });
    if (!redemption || redemption.status !== LOYALTY_REDEMPTION_STATUSES.held) return null;

    await tx.loyaltyAccount.update({
      where: { id: redemption.accountId },
      data: {
        pendingPoints: { decrement: redemption.points },
        availablePoints: { increment: redemption.points },
      },
    });
    await tx.loyaltyPointTransaction.updateMany({
      where: { redemptionId: redemption.id, type: LOYALTY_TRANSACTION_TYPES.hold },
      data: {
        type: LOYALTY_TRANSACTION_TYPES.release,
        status: LOYALTY_TRANSACTION_STATUSES.released,
        availableDelta: redemption.points,
        pendingDelta: -redemption.points,
        completedAt: new Date(),
      },
    });
    return tx.loyaltyRewardRedemption.update({
      where: { id: redemption.id },
      data: { status: LOYALTY_REDEMPTION_STATUSES.released, releasedAt: new Date() },
    });
  }

  async redeemForOrder(
    tx: LoyaltyDbClient,
    input: {
      userId: bigint;
      rewardId?: string | number | bigint | null;
      orderId: bigint;
      subtotal: number;
      total: number;
      discountAmount: number;
    },
  ) {
    if (!input.rewardId || input.discountAmount <= 0) return null;
    const reward = await this.findRewardForUse(BigInt(input.rewardId), tx);
    const account = await this.getOrCreateAccount(input.userId, tx);
    await this.assertRewardUsable(input.userId, account.availablePoints, reward, input.subtotal, tx);

    const claim = await tx.loyaltyAccount.updateMany({
      where: { id: account.id, availablePoints: { gte: reward.pointsRequired }, status: 'active' },
      data: { availablePoints: { decrement: reward.pointsRequired } },
    });
    if (claim.count !== 1) throw new BadRequestException('Insufficient loyalty points');

    await tx.loyaltyReward.update({ where: { id: reward.id }, data: { usageCount: { increment: 1 } } });
    const redemption = await tx.loyaltyRewardRedemption.create({
      data: {
        accountId: account.id,
        userId: input.userId,
        rewardId: reward.id,
        orderId: input.orderId,
        points: reward.pointsRequired,
        discountAmount: input.discountAmount,
        status: LOYALTY_REDEMPTION_STATUSES.redeemed,
        redeemedAt: new Date(),
        rewardSnapshot: toJson(this.rewardSnapshot(reward, input.discountAmount)),
      },
    });
    return tx.loyaltyPointTransaction.create({
      data: {
        accountId: account.id,
        userId: input.userId,
        rewardId: reward.id,
        redemptionId: redemption.id,
        type: LOYALTY_TRANSACTION_TYPES.redeem,
        direction: LOYALTY_TRANSACTION_DIRECTIONS.debit,
        points: reward.pointsRequired,
        availableDelta: -reward.pointsRequired,
        status: LOYALTY_TRANSACTION_STATUSES.completed,
        referenceType: LOYALTY_REFERENCE_TYPES.order,
        referenceId: input.orderId.toString(),
        description: 'Loyalty reward redeemed for order',
        completedAt: new Date(),
      },
    });
  }

  async refundOrderRedemptions(tx: LoyaltyDbClient, orderId: bigint) {
    const settings = await this.getSettingsMap();
    if (!settings[LOYALTY_SETTINGS.returnRedeemedPointsOnRefund]) return;
    const redemptions = await tx.loyaltyRewardRedemption.findMany({
      where: { orderId, status: LOYALTY_REDEMPTION_STATUSES.redeemed },
    });
    for (const redemption of redemptions) {
      await tx.loyaltyAccount.update({
        where: { id: redemption.accountId },
        data: { availablePoints: { increment: redemption.points } },
      });
      await tx.loyaltyPointTransaction.create({
        data: {
          accountId: redemption.accountId,
          userId: redemption.userId,
          rewardId: redemption.rewardId,
          redemptionId: redemption.id,
          type: LOYALTY_TRANSACTION_TYPES.refund,
          direction: LOYALTY_TRANSACTION_DIRECTIONS.credit,
          points: redemption.points,
          availableDelta: redemption.points,
          status: LOYALTY_TRANSACTION_STATUSES.completed,
          referenceType: LOYALTY_REFERENCE_TYPES.order,
          referenceId: orderId.toString(),
          description: 'Redeemed loyalty points returned after order refund/cancellation',
          completedAt: new Date(),
        },
      });
      await tx.loyaltyRewardRedemption.update({
        where: { id: redemption.id },
        data: { status: LOYALTY_REDEMPTION_STATUSES.refunded, refundedAt: new Date() },
      });
      await this.notifications.createRenderedForUsers([redemption.userId], {
        eventId: `loyalty:return:${redemption.id.toString()}`,
        notificationType: 'loyalty.points_returned',
        title: 'Loyalty points returned',
        body: `${redemption.points} points were returned after an order refund or cancellation.`,
        data: { entity: { type: 'order', id: orderId.toString() }, points: redemption.points },
      });
    }
  }

  async awardWelcome(userId: bigint) {
    return this.awardEvent(userId, LOYALTY_EVENTS.userRegistered, {
      referenceType: LOYALTY_REFERENCE_TYPES.user,
      referenceId: userId.toString(),
      amount: 0,
    });
  }

  async awardReview(userId: bigint, reviewId: bigint) {
    return this.awardEvent(userId, LOYALTY_EVENTS.productReview, {
      referenceType: LOYALTY_REFERENCE_TYPES.review,
      referenceId: reviewId.toString(),
      amount: 0,
    });
  }

  async awardPaidOrder(orderId: bigint) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    const earningAmount = await this.orderEarningAmount(order);
    await this.awardEvent(order.userId, LOYALTY_EVENTS.orderPaid, {
      referenceType: LOYALTY_REFERENCE_TYPES.order,
      referenceId: order.id.toString(),
      amount: earningAmount,
      metadata: { orderNumber: order.orderNumber },
    });
    const previousPaidOrders = await this.prisma.order.count({
      where: {
        userId: order.userId,
        id: { not: order.id },
        paymentStatus: 'completed',
      },
    });
    if (previousPaidOrders === 0) {
      await this.awardEvent(order.userId, LOYALTY_EVENTS.firstPurchase, {
        referenceType: LOYALTY_REFERENCE_TYPES.order,
        referenceId: order.id.toString(),
        amount: earningAmount,
        metadata: { orderNumber: order.orderNumber },
      });
    }
  }

  async reverseOrderEarnings(tx: LoyaltyDbClient, orderId: bigint) {
    const settings = await this.getSettingsMap();
    if (!settings[LOYALTY_SETTINGS.reverseEarnedPointsOnRefund]) return;
    const allowNegative = settings[LOYALTY_SETTINGS.allowNegativeBalanceOnReversal] !== false;
    const earns = await tx.loyaltyPointTransaction.findMany({
      where: {
        referenceType: LOYALTY_REFERENCE_TYPES.order,
        referenceId: orderId.toString(),
        type: LOYALTY_TRANSACTION_TYPES.earn,
        status: LOYALTY_TRANSACTION_STATUSES.completed,
      },
    });
    for (const earn of earns) {
      const idempotencyKey = `reverse:${earn.id.toString()}`;
      const existing = await tx.loyaltyPointTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) continue;
      const accountClaim = allowNegative
        ? await tx.loyaltyAccount.updateMany({
            where: { id: earn.accountId },
            data: {
              availablePoints: { decrement: earn.points },
              lifetimePoints: { decrement: earn.lifetimeDelta },
            },
          })
        : await tx.loyaltyAccount.updateMany({
            where: { id: earn.accountId, availablePoints: { gte: earn.points } },
            data: {
              availablePoints: { decrement: earn.points },
              lifetimePoints: { decrement: earn.lifetimeDelta },
            },
          });
      if (accountClaim.count !== 1) {
        await tx.loyaltyPointTransaction.create({
          data: {
            accountId: earn.accountId,
            userId: earn.userId,
            earningRuleId: earn.earningRuleId,
            type: LOYALTY_TRANSACTION_TYPES.reverse,
            direction: LOYALTY_TRANSACTION_DIRECTIONS.debit,
            points: earn.points,
            availableDelta: -earn.points,
            lifetimeDelta: -earn.lifetimeDelta,
            status: LOYALTY_TRANSACTION_STATUSES.requiresReview,
            referenceType: LOYALTY_REFERENCE_TYPES.order,
            referenceId: orderId.toString(),
            idempotencyKey,
            description: 'Earned loyalty points reversal requires review',
            metadata: toJson({ reason: 'negative_balance_not_allowed' }),
          },
        });
        continue;
      }
      await tx.loyaltyPointTransaction.create({
        data: {
          accountId: earn.accountId,
          userId: earn.userId,
          earningRuleId: earn.earningRuleId,
          type: LOYALTY_TRANSACTION_TYPES.reverse,
          direction: LOYALTY_TRANSACTION_DIRECTIONS.debit,
          points: earn.points,
          availableDelta: -earn.points,
          lifetimeDelta: -earn.lifetimeDelta,
          status: LOYALTY_TRANSACTION_STATUSES.completed,
          referenceType: LOYALTY_REFERENCE_TYPES.order,
          referenceId: orderId.toString(),
          idempotencyKey,
          description: 'Earned loyalty points reversed after order refund/cancellation',
          completedAt: new Date(),
        },
      });
      await this.recalculateAccountTier(earn.accountId, tx);
      await this.notifications.createRenderedForUsers([earn.userId], {
        eventId: idempotencyKey,
        notificationType: 'loyalty.points_reversed',
        title: 'Loyalty points reversed',
        body: `${earn.points} points were reversed because an order was refunded or cancelled.`,
        data: { entity: { type: 'order', id: orderId.toString() }, points: earn.points },
      });
    }
  }

  async reverseOrderEarningsForRefund(
    tx: LoyaltyDbClient,
    orderId: bigint,
    refundAmount: number,
    input: { source: string; sourceId: bigint },
  ) {
    const settings = await this.getSettingsMap();
    if (!settings[LOYALTY_SETTINGS.reverseEarnedPointsOnRefund]) return;
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { subtotal: true, discountAmount: true, loyaltyDiscountAmount: true, totalPrice: true },
    });
    if (!order) return;
    const earningAmount = await this.orderEarningAmount(order);
    if (earningAmount <= 0 || refundAmount <= 0) return;
    const ratio = Math.min(1, refundAmount / earningAmount);
    const allowNegative = settings[LOYALTY_SETTINGS.allowNegativeBalanceOnReversal] !== false;
    const earns = await tx.loyaltyPointTransaction.findMany({
      where: {
        referenceType: LOYALTY_REFERENCE_TYPES.order,
        referenceId: orderId.toString(),
        type: LOYALTY_TRANSACTION_TYPES.earn,
        status: LOYALTY_TRANSACTION_STATUSES.completed,
      },
    });

    for (const earn of earns) {
      const idempotencyKey = `reverse:${earn.id.toString()}:${input.source}:${input.sourceId.toString()}`;
      const existing = await tx.loyaltyPointTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) continue;
      const previousReversals = await tx.loyaltyPointTransaction.aggregate({
        where: {
          accountId: earn.accountId,
          earningRuleId: earn.earningRuleId,
          referenceType: LOYALTY_REFERENCE_TYPES.order,
          referenceId: orderId.toString(),
          type: LOYALTY_TRANSACTION_TYPES.reverse,
          status: { in: [LOYALTY_TRANSACTION_STATUSES.completed, LOYALTY_TRANSACTION_STATUSES.requiresReview] },
        },
        _sum: { points: true, lifetimeDelta: true },
      });
      const remainingPoints = Math.max(0, earn.points - (previousReversals._sum.points ?? 0));
      const remainingLifetime = Math.max(0, earn.lifetimeDelta - Math.abs(previousReversals._sum.lifetimeDelta ?? 0));
      const points = Math.min(remainingPoints, Math.floor(earn.points * ratio));
      const lifetimeDelta = Math.min(remainingLifetime, Math.floor(earn.lifetimeDelta * ratio));
      if (points <= 0 && lifetimeDelta <= 0) continue;

      const accountClaim = allowNegative
        ? await tx.loyaltyAccount.updateMany({
            where: { id: earn.accountId },
            data: {
              availablePoints: { decrement: points },
              lifetimePoints: { decrement: lifetimeDelta },
            },
          })
        : await tx.loyaltyAccount.updateMany({
            where: { id: earn.accountId, availablePoints: { gte: points } },
            data: {
              availablePoints: { decrement: points },
              lifetimePoints: { decrement: lifetimeDelta },
            },
          });
      const completed = accountClaim.count === 1;
      await tx.loyaltyPointTransaction.create({
        data: {
          accountId: earn.accountId,
          userId: earn.userId,
          earningRuleId: earn.earningRuleId,
          type: LOYALTY_TRANSACTION_TYPES.reverse,
          direction: LOYALTY_TRANSACTION_DIRECTIONS.debit,
          points,
          availableDelta: -points,
          lifetimeDelta: -lifetimeDelta,
          status: completed ? LOYALTY_TRANSACTION_STATUSES.completed : LOYALTY_TRANSACTION_STATUSES.requiresReview,
          referenceType: LOYALTY_REFERENCE_TYPES.order,
          referenceId: orderId.toString(),
          idempotencyKey,
          description: completed
            ? 'Earned loyalty points reversed after partial refund'
            : 'Earned loyalty points reversal requires review',
          completedAt: completed ? new Date() : undefined,
          metadata: toJson({
            refundAmount,
            earningAmount,
            ratio,
            source: input.source,
            sourceId: input.sourceId.toString(),
            ...(completed ? {} : { reason: 'negative_balance_not_allowed' }),
          }),
        },
      });
      if (completed) await this.recalculateAccountTier(earn.accountId, tx);
      await this.notifications.createRenderedForUsers([earn.userId], {
        eventId: idempotencyKey,
        notificationType: 'loyalty.points_reversed',
        title: 'Loyalty points reversed',
        body: `${points} points were reversed because part of your order was refunded.`,
        data: {
          entity: { type: 'order', id: orderId.toString() },
          points,
          refundAmount,
          source: input.source,
          sourceId: input.sourceId.toString(),
        },
      });
    }
  }

  async getOrCreateAccount(userId: bigint, tx: LoyaltyDbClient = this.prisma) {
    const existing = await tx.loyaltyAccount.findUnique({
      where: { userId },
      include: { currentTier: { include: { translations: true } } },
    });
    if (existing) return existing;
    const tier = await tx.loyaltyTier.findFirst({
      where: { isActive: true, minLifetimePoints: { lte: 0 } },
      orderBy: { minLifetimePoints: 'desc' },
    });
    return tx.loyaltyAccount.create({
      data: {
        userId,
        currentTierId: tier?.id,
      },
      include: { currentTier: { include: { translations: true } } },
    });
  }

  private async awardEvent(
    userId: bigint,
    eventKey: string,
    input: { referenceType: string; referenceId: string; amount: number; metadata?: Record<string, unknown> },
  ) {
    const rule = await this.prisma.loyaltyEarningRule.findUnique({ where: { eventKey } });
    if (!rule || !rule.isActive || !this.isActiveWindow(rule.startsAt, rule.endsAt)) return null;
    if (rule.minOrderAmount !== null && input.amount < Number(rule.minOrderAmount)) return null;
    const basePoints =
      rule.pointsType === LOYALTY_POINTS_TYPES.percentage
        ? Math.floor(input.amount * (Number(rule.pointsValue) / 100))
        : Math.floor(Number(rule.pointsValue));
    if (basePoints <= 0) return null;
    const account = await this.getOrCreateAccount(userId);
    const multiplier = Number(account.currentTier?.multiplier || 1);
    const points = Math.floor(basePoints * multiplier);
    const idempotencyKey = `earn:${eventKey}:${input.referenceType}:${input.referenceId}`;
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.loyaltyPointTransaction.findUnique({ where: { idempotencyKey } });
      if (existing) return { transaction: existing, created: false, newTier: null as TierWithTranslations | null };
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          availablePoints: { increment: points },
          lifetimePoints: { increment: points },
        },
      });
      const transaction = await tx.loyaltyPointTransaction.create({
        data: {
          accountId: account.id,
          userId,
          earningRuleId: rule.id,
          type: LOYALTY_TRANSACTION_TYPES.earn,
          direction: LOYALTY_TRANSACTION_DIRECTIONS.credit,
          points,
          availableDelta: points,
          lifetimeDelta: points,
          status: LOYALTY_TRANSACTION_STATUSES.completed,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          idempotencyKey,
          description: `Loyalty points earned for ${eventKey}`,
          expiresAt: await this.resolveExpiryDate(),
          completedAt: new Date(),
          metadata: toJson({ basePoints, multiplier, ...(input.metadata || {}) }),
        },
      });
      const newTier = await this.recalculateAccountTier(account.id, tx);
      return { transaction, created: true, newTier };
    });

    if (!result.created) return result.transaction;

    await this.notifications.createRenderedForUsers([userId], {
      eventId: `loyalty.points_earned.${result.transaction.id.toString()}`,
      notificationType: 'loyalty.points_earned',
      title: 'Loyalty points added',
      body: `You earned ${points} loyalty points.`,
      data: {
        entity: { type: 'loyalty_transaction', id: result.transaction.id.toString() },
        points,
        eventKey,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });

    const oldMinLifetimePoints = account.currentTier?.minLifetimePoints ?? -1;
    if (result.newTier && result.newTier.minLifetimePoints > oldMinLifetimePoints) {
      await this.notifications.createRenderedForUsers([userId], {
        eventId: `loyalty.tier_upgraded.${userId.toString()}.${result.newTier.id.toString()}.${result.transaction.id.toString()}`,
        notificationType: 'loyalty.tier_upgraded',
        title: 'Congratulations, your tier is upgraded',
        body: `You reached ${this.tierName(result.newTier)}. Your earning multiplier is ${Number(result.newTier.multiplier)}x.`,
        data: {
          entity: { type: 'loyalty_tier', id: result.newTier.id.toString() },
          tierId: result.newTier.id.toString(),
          tierName: this.tierName(result.newTier),
          multiplier: Number(result.newTier.multiplier),
        },
      });
    }

    return result.transaction;
  }

  private async assertRewardUsable(
    userId: bigint,
    availablePoints: number,
    reward: RewardForRedemption,
    subtotal: number,
    tx: LoyaltyDbClient = this.prisma,
  ) {
    if (availablePoints < reward.pointsRequired) throw new BadRequestException('Insufficient loyalty points');
    if (reward.minOrderAmount !== null && subtotal < Number(reward.minOrderAmount)) {
      throw new BadRequestException('Order amount does not meet reward minimum');
    }
    if (reward.usageLimit !== null && reward.usageCount >= reward.usageLimit) {
      throw new BadRequestException('Reward usage limit reached');
    }
    const usedByUser = await tx.loyaltyRewardRedemption.count({
      where: {
        userId,
        rewardId: reward.id,
        status: { in: [LOYALTY_REDEMPTION_STATUSES.held, LOYALTY_REDEMPTION_STATUSES.redeemed] },
      },
    });
    if (usedByUser >= reward.perUserLimit) throw new BadRequestException('Reward per-user limit reached');
  }

  private async calculateRewardDiscount(reward: RewardForRedemption, subtotal: number, total: number) {
    let discount =
      reward.rewardType === LOYALTY_REWARD_TYPES.percentage
        ? subtotal * (Number(reward.rewardValue) / 100)
        : Number(reward.rewardValue);
    if (reward.maxDiscountAmount !== null) discount = Math.min(discount, Number(reward.maxDiscountAmount));
    const settings = await this.getSettingsMap();
    const capPercent = Number(settings[LOYALTY_SETTINGS.maxRewardDiscountPercent] ?? 100);
    if (capPercent > 0) discount = Math.min(discount, total * (capPercent / 100));
    return Number(Math.min(total, Math.max(0, discount)).toFixed(2));
  }

  private async findRewardForUse(id: bigint, tx: LoyaltyDbClient = this.prisma) {
    const reward = await tx.loyaltyReward.findUnique({ where: { id }, include: { translations: true } });
    if (!reward || !reward.isActive || !this.isActiveWindow(reward.startsAt, reward.endsAt)) {
      throw new NotFoundException('Reward not found or inactive');
    }
    return reward;
  }

  private async getSettingsMap() {
    return this.settings.getSettingsMap(DEFAULT_LOYALTY_SETTINGS);
  }

  private async resolveExpiryDate() {
    const settings = await this.getSettingsMap();
    if (!settings[LOYALTY_SETTINGS.pointsExpiryEnabled]) return null;
    const days = Number(settings[LOYALTY_SETTINGS.pointsExpiryDays] || 0);
    if (days <= 0) return null;
    return new Date(Date.now() + days * 24 * 60 * 60_000);
  }

  private async orderEarningAmount(
    order: Pick<Prisma.OrderGetPayload<object>, 'subtotal' | 'discountAmount' | 'loyaltyDiscountAmount' | 'totalPrice'>,
  ) {
    const settings = await this.getSettingsMap();
    const configuredBase = settings[LOYALTY_SETTINGS.orderEarningBase];
    const base = typeof configuredBase === 'string' ? configuredBase : 'discounted_subtotal';
    if (base === 'total_paid') return Math.max(0, Number(order.totalPrice));
    if (base === 'subtotal') return Math.max(0, Number(order.subtotal));
    return Math.max(0, Number(order.subtotal) - Number(order.discountAmount));
  }

  private async recalculateAllAccountTiers() {
    const accounts = await this.prisma.loyaltyAccount.findMany({ select: { id: true } });
    for (const account of accounts) await this.recalculateAccountTier(account.id);
  }

  private async recalculateAccountTier(accountId: bigint, tx: LoyaltyDbClient = this.prisma) {
    const account = await tx.loyaltyAccount.findUnique({ where: { id: accountId } });
    if (!account) return null;
    const tier = await tx.loyaltyTier.findFirst({
      where: { isActive: true, minLifetimePoints: { lte: account.lifetimePoints } },
      orderBy: { minLifetimePoints: 'desc' },
      include: { translations: true },
    });
    await tx.loyaltyAccount.update({ where: { id: accountId }, data: { currentTierId: tier?.id || null } });
    return tier;
  }

  private tierName(tier: TierWithTranslations) {
    return (
      tier.translations.find((translation) => translation.langId === 'en')?.name || tier.translations[0]?.name || 'Tier'
    );
  }

  private rewardSnapshot(reward: RewardForRedemption, discountAmount: number) {
    return {
      id: reward.id.toString(),
      pointsRequired: reward.pointsRequired,
      rewardType: reward.rewardType,
      rewardValue: Number(reward.rewardValue),
      maxDiscountAmount: reward.maxDiscountAmount === null ? null : Number(reward.maxDiscountAmount),
      discountAmount,
      translations: reward.translations,
    };
  }

  private assertRewardConfig(rewardType: string, maxDiscountAmount?: number | null) {
    if (rewardType === LOYALTY_REWARD_TYPES.percentage && (!maxDiscountAmount || maxDiscountAmount <= 0)) {
      throw new BadRequestException('Percentage rewards require max discount amount');
    }
  }

  private async assertTier(id: bigint) {
    const tier = await this.prisma.loyaltyTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Tier not found');
  }

  private async assertEarningRule(id: bigint) {
    const rule = await this.prisma.loyaltyEarningRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Earning rule not found');
  }

  private isActiveWindow(startsAt?: Date | null, endsAt?: Date | null) {
    const now = new Date();
    if (startsAt && startsAt > now) return false;
    if (endsAt && endsAt < now) return false;
    return true;
  }

  private async attachImage(model: string, modelId: bigint, collection: string, attachHash?: string | null) {
    if (!attachHash || attachHash.startsWith('http')) return;
    await this.mediaService.deleteByEntity(model, modelId, collection);
    await this.mediaService.attachTempMedia({ model, modelId: modelId.toString(), attachHash });
  }

  private async formatTier(tier: Prisma.LoyaltyTierGetPayload<{ include: { translations: true } }>) {
    const icon = await this.mediaService.findByEntity('tier', tier.id, 'icon');
    return {
      ...tier,
      id: tier.id.toString(),
      multiplier: Number(tier.multiplier),
      icon: icon[0] ?? null,
    };
  }

  private async formatEarningRule(rule: Prisma.LoyaltyEarningRuleGetPayload<{ include: { translations: true } }>) {
    const image = await this.mediaService.findByEntity('earningrule', rule.id, 'image');
    return {
      ...rule,
      id: rule.id.toString(),
      pointsValue: Number(rule.pointsValue),
      minOrderAmount: rule.minOrderAmount === null ? null : Number(rule.minOrderAmount),
      startDate: rule.startsAt,
      endDate: rule.endsAt,
      image: image[0] ?? null,
    };
  }

  private async formatReward(reward: Prisma.LoyaltyRewardGetPayload<{ include: { translations: true } }>) {
    const image = await this.mediaService.findByEntity('reward', reward.id, 'image');
    return {
      ...reward,
      id: reward.id.toString(),
      rewardValue: Number(reward.rewardValue),
      maxDiscountAmount: reward.maxDiscountAmount === null ? null : Number(reward.maxDiscountAmount),
      minOrderAmount: reward.minOrderAmount === null ? null : Number(reward.minOrderAmount),
      startDate: reward.startsAt,
      endDate: reward.endsAt,
      image: image[0] ?? null,
    };
  }

  private async formatAccount(
    account: Prisma.LoyaltyAccountGetPayload<{ include: { currentTier: { include: { translations: true } } } }>,
  ) {
    return {
      id: account.id.toString(),
      userId: account.userId.toString(),
      availablePoints: account.availablePoints,
      pendingPoints: account.pendingPoints,
      lifetimePoints: account.lifetimePoints,
      currentTier: account.currentTier ? await this.formatTier(account.currentTier) : null,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  private formatTransaction(transaction: Prisma.LoyaltyPointTransactionGetPayload<object>) {
    return {
      ...transaction,
      id: transaction.id.toString(),
      accountId: transaction.accountId.toString(),
      userId: transaction.userId.toString(),
      earningRuleId: transaction.earningRuleId?.toString() || null,
      rewardId: transaction.rewardId?.toString() || null,
      redemptionId: transaction.redemptionId?.toString() || null,
    };
  }

  private paginateArray<T>(items: T[], query: AdvancedQueryDto, collectionKey: string) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      [collectionKey]: items.slice(start, start + limit),
      meta: this.meta(page, limit, items.length),
    };
  }

  private meta(page: number, limit: number, total: number) {
    return {
      page,
      currentPage: page,
      limit,
      perPage: limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      lastPage: Math.max(1, Math.ceil(total / limit)),
      from: total === 0 ? 0 : (page - 1) * limit + 1,
      to: Math.min(total, page * limit),
    };
  }

  private orderBy(query: AdvancedQueryDto, fallback: Record<string, 'asc' | 'desc'>) {
    const sort = query.sort || {};
    const entries = Object.entries(sort);
    if (entries.length === 0) return fallback;
    return Object.fromEntries(entries.map(([key, value]) => [key, value === 'asc' ? 'asc' : 'desc']));
  }

  private toBool(value: string | number | boolean) {
    return value === true || value === '1' || value === 1 || value === 'true';
  }
}
