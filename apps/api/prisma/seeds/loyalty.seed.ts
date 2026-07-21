import { PrismaClient } from '@prisma/client';

const loyaltySettings = [
  ['loyalty_points_expiry_enabled', false, 'boolean', 'Enable points expiry'],
  ['loyalty_points_expiry_days', 365, 'integer', 'Points expiry days'],
  ['loyalty_max_reward_discount_percent', 50, 'integer', 'Max reward discount percent'],
  ['loyalty_one_reward_per_order', true, 'boolean', 'One reward per order'],
  ['loyalty_return_redeemed_points_on_refund', true, 'boolean', 'Return redeemed points on refund'],
  ['loyalty_reverse_earned_points_on_refund', true, 'boolean', 'Reverse earned points on refund'],
  ['loyalty_allow_negative_balance_on_reversal', true, 'boolean', 'Allow negative balance on reversal'],
  ['loyalty_order_earning_base', 'discounted_subtotal', 'string', 'Order earning base'],
] as const;

const tiers = [
  { id: 1, name: 'Bronze', multiplier: 1, minLifetimePoints: 0, color: '#CD7F32' },
  { id: 2, name: 'Silver', multiplier: 1.25, minLifetimePoints: 5000, color: '#C0C0C0' },
  { id: 3, name: 'Gold', multiplier: 1.5, minLifetimePoints: 10000, color: '#FFD700' },
  { id: 4, name: 'Platinum', multiplier: 1.75, minLifetimePoints: 20000, color: '#E5E4E2' },
  { id: 5, name: 'Diamond', multiplier: 2, minLifetimePoints: 50000, color: '#B9F2FF' },
] as const;

const earningRules = [
  {
    id: 1,
    eventKey: 'user_registered',
    name: 'Welcome Bonus',
    description: 'Get 100 points after verifying your account.',
    pointsType: 'fixed',
    pointsValue: 100,
    minOrderAmount: null,
  },
  {
    id: 2,
    eventKey: 'order_placed',
    name: 'Paid Order Reward',
    description: 'Earn 2% of the paid order value as points.',
    pointsType: 'percentage',
    pointsValue: 2,
    minOrderAmount: 50,
  },
  {
    id: 3,
    eventKey: 'first_purchase',
    name: 'First Paid Purchase',
    description: 'Earn 200 bonus points on your first paid order over SAR 100.',
    pointsType: 'fixed',
    pointsValue: 200,
    minOrderAmount: 100,
  },
  {
    id: 4,
    eventKey: 'product_review',
    name: 'Product Review Reward',
    description: 'Earn 25 points for reviewing a delivered product.',
    pointsType: 'fixed',
    pointsValue: 25,
    minOrderAmount: null,
  },
] as const;

const rewards = [
  {
    id: 1,
    name: 'SAR 10 Discount',
    description: 'Redeem 500 points for SAR 10 off your order.',
    pointsRequired: 500,
    rewardType: 'fixed',
    rewardValue: 10,
    maxDiscountAmount: null,
    minOrderAmount: 100,
    usageLimit: null,
    perUserLimit: 10,
  },
  {
    id: 2,
    name: '10% Discount',
    description: 'Redeem 1000 points for 10% off, capped at SAR 50.',
    pointsRequired: 1000,
    rewardType: 'percentage',
    rewardValue: 10,
    maxDiscountAmount: 50,
    minOrderAmount: 200,
    usageLimit: 500,
    perUserLimit: 5,
  },
  {
    id: 3,
    name: 'SAR 100 VIP Discount',
    description: 'Redeem 5000 points for SAR 100 off. Limited availability.',
    pointsRequired: 5000,
    rewardType: 'fixed',
    rewardValue: 100,
    maxDiscountAmount: 100,
    minOrderAmount: 500,
    usageLimit: 100,
    perUserLimit: 1,
  },
] as const;

export async function seedLoyalty(prisma: PrismaClient) {
  for (const [key, value, type, keyLabel] of loyaltySettings) {
    await prisma.appSetting.upsert({
      where: { key },
      update: {
        value: { value },
        group: 'loyalty',
        groupLabel: 'Loyalty',
        type,
        keyLabel,
      },
      create: {
        key,
        value: { value },
        group: 'loyalty',
        groupLabel: 'Loyalty',
        type,
        keyLabel,
      },
    });
  }

  for (const tier of tiers) {
    await prisma.loyaltyTier.upsert({
      where: { id: BigInt(tier.id) },
      update: {
        multiplier: tier.multiplier,
        minLifetimePoints: tier.minLifetimePoints,
        color: tier.color,
        isActive: true,
        translations: {
          deleteMany: {},
          create: [
            { langId: 'en', name: tier.name },
            { langId: 'ar', name: tier.name },
          ],
        },
      },
      create: {
        id: BigInt(tier.id),
        multiplier: tier.multiplier,
        minLifetimePoints: tier.minLifetimePoints,
        color: tier.color,
        isActive: true,
        translations: {
          create: [
            { langId: 'en', name: tier.name },
            { langId: 'ar', name: tier.name },
          ],
        },
      },
    });
  }

  for (const rule of earningRules) {
    await prisma.loyaltyEarningRule.upsert({
      where: { eventKey: rule.eventKey },
      update: {
        pointsType: rule.pointsType,
        pointsValue: rule.pointsValue,
        minOrderAmount: rule.minOrderAmount,
        isActive: true,
        translations: {
          deleteMany: {},
          create: [
            { langId: 'en', name: rule.name, description: rule.description },
            { langId: 'ar', name: rule.name, description: rule.description },
          ],
        },
      },
      create: {
        id: BigInt(rule.id),
        eventKey: rule.eventKey,
        pointsType: rule.pointsType,
        pointsValue: rule.pointsValue,
        minOrderAmount: rule.minOrderAmount,
        isActive: true,
        translations: {
          create: [
            { langId: 'en', name: rule.name, description: rule.description },
            { langId: 'ar', name: rule.name, description: rule.description },
          ],
        },
      },
    });
  }

  for (const reward of rewards) {
    await prisma.loyaltyReward.upsert({
      where: { id: BigInt(reward.id) },
      update: {
        pointsRequired: reward.pointsRequired,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        maxDiscountAmount: reward.maxDiscountAmount,
        minOrderAmount: reward.minOrderAmount,
        usageLimit: reward.usageLimit,
        perUserLimit: reward.perUserLimit,
        isActive: true,
        translations: {
          deleteMany: {},
          create: [
            { langId: 'en', name: reward.name, description: reward.description },
            { langId: 'ar', name: reward.name, description: reward.description },
          ],
        },
      },
      create: {
        id: BigInt(reward.id),
        pointsRequired: reward.pointsRequired,
        rewardType: reward.rewardType,
        rewardValue: reward.rewardValue,
        maxDiscountAmount: reward.maxDiscountAmount,
        minOrderAmount: reward.minOrderAmount,
        usageLimit: reward.usageLimit,
        perUserLimit: reward.perUserLimit,
        isActive: true,
        translations: {
          create: [
            { langId: 'en', name: reward.name, description: reward.description },
            { langId: 'ar', name: reward.name, description: reward.description },
          ],
        },
      },
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { id: BigInt(1) } });
  if (superAdminRole) {
    const permissions = [
      ...['earning-rules', 'rewards', 'tiers'].flatMap((resource) =>
        ['list', 'read', 'create', 'update', 'delete'].map((action) => ({ resource, action })),
      ),
      ...['settings'].flatMap((resource) => ['list', 'update'].map((action) => ({ resource, action }))),
    ];
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { resource_action: permission },
        update: { roles: { connect: { id: superAdminRole.id } } },
        create: { ...permission, roles: { connect: { id: superAdminRole.id } } },
      });
    }
  }

  console.log('Loyalty settings, tiers, earning rules, rewards, and permissions seeded');
}
