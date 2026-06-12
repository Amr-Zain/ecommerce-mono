export const WALLET_STATUSES = {
  active: 'active',
  suspended: 'suspended',
} as const;

export const WALLET_TRANSACTION_TYPES = {
  deposit: 'deposit',
  withdrawal: 'withdrawal',
  purchase: 'purchase',
  refund: 'refund',
  adjustment: 'adjustment',
  hold: 'hold',
  release: 'release',
  capture: 'capture',
} as const;

export const WALLET_TRANSACTION_DIRECTIONS = {
  credit: 'credit',
  debit: 'debit',
} as const;

export const WALLET_TRANSACTION_STATUSES = {
  pending: 'pending',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
  expired: 'expired',
  reversed: 'reversed',
  requiresReview: 'requires_review',
} as const;

export const WALLET_WITHDRAWAL_STATUSES = {
  requested: 'requested',
  approved: 'approved',
  paid: 'paid',
  rejected: 'rejected',
  failed: 'failed',
  cancelledByClient: 'cancelled_by_client',
} as const;

export const WALLET_WITHDRAWAL_METHODS = {
  bankTransfer: 'bank_transfer',
} as const;

export const WALLET_REFERENCE_TYPES = {
  walletDeposit: 'wallet_deposit',
  walletWithdrawal: 'wallet_withdrawal',
  order: 'order',
  returnRequest: 'return_request',
  exchangeRequest: 'exchange_request',
  adminAdjustment: 'admin_adjustment',
} as const;

export const WALLET_PAYMENT_PURPOSES = {
  deposit: 'wallet_deposit',
} as const;

export const WALLET_LIMITS = {
  minDepositAmount: 1,
  minWithdrawalAmount: 1,
} as const;

export type WalletStatus = (typeof WALLET_STATUSES)[keyof typeof WALLET_STATUSES];
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[keyof typeof WALLET_TRANSACTION_TYPES];
export type WalletTransactionDirection =
  (typeof WALLET_TRANSACTION_DIRECTIONS)[keyof typeof WALLET_TRANSACTION_DIRECTIONS];
export type WalletTransactionStatus = (typeof WALLET_TRANSACTION_STATUSES)[keyof typeof WALLET_TRANSACTION_STATUSES];
export type WalletWithdrawalStatus = (typeof WALLET_WITHDRAWAL_STATUSES)[keyof typeof WALLET_WITHDRAWAL_STATUSES];
