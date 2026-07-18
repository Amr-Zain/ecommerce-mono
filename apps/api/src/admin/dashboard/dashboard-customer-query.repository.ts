import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DashboardCustomerQueryPort, DashboardDateRange } from './dashboard-query.port';
import { DashboardPrismaQueryRepository } from './dashboard-prisma-query.repository';

@Injectable()
export class DashboardCustomerQueryRepository
  extends DashboardPrismaQueryRepository
  implements DashboardCustomerQueryPort
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getUserStats(range: DashboardDateRange, langId: string, compare: boolean) {
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
      compare
        ? this.prisma.user.count({ where: { userType: 'client', createdAt: this.previousRangeWhere(range) } })
        : Promise.resolve(0),
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
      growth_trend: compare ? this.percentageChange(periodUsers, previousUsers) : 0,
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

  async getLoyaltyStats(range: DashboardDateRange, langId: string) {
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

  private async sumLoyaltyPoints(range: DashboardDateRange) {
    const result = await this.prisma.loyaltyPointTransaction.aggregate({
      where: { createdAt: { gte: range.from, lte: range.to } },
      _sum: { points: true },
    });
    return result._sum.points ?? 0;
  }
}
