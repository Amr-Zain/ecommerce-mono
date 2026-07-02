export const LOYALTY_EVENTS = {
  userRegistered: 'user_registered',
  orderPaid: 'order_placed',
  firstPurchase: 'first_purchase',
  productReview: 'product_review',
} as const;

export const LOYALTY_POINTS_TYPES = {
  fixed: 'fixed',
  percentage: 'percentage',
} as const;

export const LOYALTY_REWARD_TYPES = {
  fixed: 'fixed',
  percentage: 'percentage',
} as const;

export const LOYALTY_TRANSACTION_TYPES = {
  earn: 'earn',
  hold: 'hold',
  redeem: 'redeem',
  release: 'release',
  refund: 'refund',
  reverse: 'reverse',
  expire: 'expire',
  adjustment: 'adjustment',
} as const;

export const LOYALTY_TRANSACTION_DIRECTIONS = {
  credit: 'credit',
  debit: 'debit',
} as const;

export const LOYALTY_TRANSACTION_STATUSES = {
  pending: 'pending',
  completed: 'completed',
  released: 'released',
  reversed: 'reversed',
  expired: 'expired',
  requiresReview: 'requires_review',
} as const;

export const LOYALTY_REDEMPTION_STATUSES = {
  held: 'held',
  redeemed: 'redeemed',
  released: 'released',
  refunded: 'refunded',
} as const;

export const LOYALTY_REFERENCE_TYPES = {
  pendingCheckout: 'pending_checkout',
  order: 'order',
  review: 'review',
  user: 'user',
  rewardRedemption: 'reward_redemption',
} as const;

export const LOYALTY_SETTINGS = {
  pointsExpiryEnabled: 'loyalty_points_expiry_enabled',
  pointsExpiryDays: 'loyalty_points_expiry_days',
  maxRewardDiscountPercent: 'loyalty_max_reward_discount_percent',
  oneRewardPerOrder: 'loyalty_one_reward_per_order',
  returnRedeemedPointsOnRefund: 'loyalty_return_redeemed_points_on_refund',
  reverseEarnedPointsOnRefund: 'loyalty_reverse_earned_points_on_refund',
  allowNegativeBalanceOnReversal: 'loyalty_allow_negative_balance_on_reversal',
  orderEarningBase: 'loyalty_order_earning_base',
} as const;

export const DEFAULT_LOYALTY_SETTINGS: Record<
  string,
  { value: boolean | number | string; group: string; groupLabel: string; type: string; keyLabel: string }
> = {
  [LOYALTY_SETTINGS.pointsExpiryEnabled]: {
    value: false,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'boolean',
    keyLabel: 'Enable points expiry',
  },
  [LOYALTY_SETTINGS.pointsExpiryDays]: {
    value: 365,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'integer',
    keyLabel: 'Points expiry days',
  },
  [LOYALTY_SETTINGS.maxRewardDiscountPercent]: {
    value: 50,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'integer',
    keyLabel: 'Max reward discount percent',
  },
  [LOYALTY_SETTINGS.oneRewardPerOrder]: {
    value: true,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'boolean',
    keyLabel: 'One reward per order',
  },
  [LOYALTY_SETTINGS.returnRedeemedPointsOnRefund]: {
    value: true,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'boolean',
    keyLabel: 'Return redeemed points on refund',
  },
  [LOYALTY_SETTINGS.reverseEarnedPointsOnRefund]: {
    value: true,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'boolean',
    keyLabel: 'Reverse earned points on refund',
  },
  [LOYALTY_SETTINGS.allowNegativeBalanceOnReversal]: {
    value: true,
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'boolean',
    keyLabel: 'Allow negative balance on reversal',
  },
  [LOYALTY_SETTINGS.orderEarningBase]: {
    value: 'discounted_subtotal',
    group: 'loyalty',
    groupLabel: 'Loyalty',
    type: 'string',
    keyLabel: 'Order earning base',
  },
};
