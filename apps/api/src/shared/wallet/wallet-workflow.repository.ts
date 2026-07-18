import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { I18nTranslations } from '@/generated/i18n.generated';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PAYMENT_CURRENCIES, PAYMENT_METHODS, PAYMENT_STATUSES } from '@/shared/payment/payment.constants';
import { PaymentService } from '@/shared/payment/payment.service';
import {
  WALLET_LIMITS,
  WALLET_PAYMENT_PURPOSES,
  WALLET_REFERENCE_TYPES,
  WALLET_STATUSES,
  WALLET_TRANSACTION_DIRECTIONS,
  WALLET_TRANSACTION_STATUSES,
  WALLET_TRANSACTION_TYPES,
  WALLET_WITHDRAWAL_STATUSES,
} from '@/common/constants/wallet.constants';
import {
  AdminMarkWithdrawalPaidDto,
  AdminWithdrawalActionDto,
  CreateWalletDepositDto,
  CreateWalletWithdrawalDto,
} from './dto/wallet.dto';
import {
  WalletRepository,
  WalletTransactionWithRelations,
  WalletWithdrawalWithRelations,
  WalletWithUser,
} from './wallet.repository';

const toPrismaJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
type WalletDbClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class WalletWorkflowRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletRepository: WalletRepository,
    private readonly paymentService: PaymentService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async getClientWallet(userId: bigint) {
    return this.formatWallet(await this.walletRepository.getOrCreateWallet(userId));
  }

  async reserveForCheckout(
    tx: WalletDbClient,
    input: { userId: bigint; amount: number; pendingCheckoutId: bigint; metadata?: Record<string, unknown> },
  ) {
    const amount = this.normalizeMoney(input.amount);
    if (amount <= 0) return null;

    const wallet = await this.getOrCreateWalletForUser(tx, input.userId);
    this.assertWalletActive(wallet.status);

    const lock = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        status: WALLET_STATUSES.active,
        availableBalance: { gte: amount },
      },
      data: {
        availableBalance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    });
    if (lock.count !== 1) {
      throw new BadRequestException(this.i18n.t('errors.wallet_insufficient_balance'));
    }

    return tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: input.userId,
        type: WALLET_TRANSACTION_TYPES.hold,
        direction: WALLET_TRANSACTION_DIRECTIONS.debit,
        amount,
        currency: wallet.currency,
        status: WALLET_TRANSACTION_STATUSES.pending,
        paymentMethod: PAYMENT_METHODS.wallet,
        referenceType: WALLET_REFERENCE_TYPES.pendingCheckout,
        referenceId: input.pendingCheckoutId.toString(),
        description: 'Wallet checkout hold',
        metadata: toPrismaJson({
          pendingCheckoutId: input.pendingCheckoutId.toString(),
          ...(input.metadata || {}),
        }),
      },
      include: { wallet: true, user: true },
    });
  }

  async captureCheckoutHold(
    tx: WalletDbClient,
    input: { pendingCheckoutId: bigint; orderId: bigint; metadata?: Record<string, unknown> },
  ) {
    const hold = await tx.walletTransaction.findFirst({
      where: {
        referenceType: WALLET_REFERENCE_TYPES.pendingCheckout,
        referenceId: input.pendingCheckoutId.toString(),
        type: WALLET_TRANSACTION_TYPES.hold,
        status: WALLET_TRANSACTION_STATUSES.pending,
      },
    });
    if (!hold) return null;

    const lock = await tx.wallet.updateMany({
      where: {
        id: hold.walletId,
        pendingBalance: { gte: hold.amount },
      },
      data: {
        pendingBalance: { decrement: hold.amount },
      },
    });
    if (lock.count !== 1) {
      await tx.walletTransaction.update({
        where: { id: hold.id },
        data: {
          status: WALLET_TRANSACTION_STATUSES.requiresReview,
          metadata: toPrismaJson({
            pendingCheckoutId: input.pendingCheckoutId.toString(),
            orderId: input.orderId.toString(),
            reason: 'wallet_pending_balance_capture_failed',
            ...(input.metadata || {}),
          }),
        },
      });
      throw new BadRequestException(this.i18n.t('errors.wallet_insufficient_balance'));
    }

    return tx.walletTransaction.update({
      where: { id: hold.id },
      data: {
        type: WALLET_TRANSACTION_TYPES.purchase,
        status: WALLET_TRANSACTION_STATUSES.completed,
        referenceType: WALLET_REFERENCE_TYPES.order,
        referenceId: input.orderId.toString(),
        description: 'Wallet order payment',
        completedAt: new Date(),
        metadata: toPrismaJson({
          pendingCheckoutId: input.pendingCheckoutId.toString(),
          orderId: input.orderId.toString(),
          ...(input.metadata || {}),
        }),
      },
      include: { wallet: true, user: true },
    });
  }

  async releaseCheckoutHold(
    tx: WalletDbClient,
    input: { pendingCheckoutId: bigint; status?: string; reason?: string; metadata?: Record<string, unknown> },
  ) {
    const hold = await tx.walletTransaction.findFirst({
      where: {
        referenceType: WALLET_REFERENCE_TYPES.pendingCheckout,
        referenceId: input.pendingCheckoutId.toString(),
        type: WALLET_TRANSACTION_TYPES.hold,
        status: WALLET_TRANSACTION_STATUSES.pending,
      },
    });
    if (!hold) return null;

    await tx.wallet.update({
      where: { id: hold.walletId },
      data: {
        pendingBalance: { decrement: hold.amount },
        availableBalance: { increment: hold.amount },
      },
    });

    const releasedStatus =
      input.status === PAYMENT_STATUSES.expired
        ? WALLET_TRANSACTION_STATUSES.expired
        : input.status === PAYMENT_STATUSES.failed
          ? WALLET_TRANSACTION_STATUSES.failed
          : WALLET_TRANSACTION_STATUSES.cancelled;

    return tx.walletTransaction.update({
      where: { id: hold.id },
      data: {
        type: WALLET_TRANSACTION_TYPES.release,
        status: releasedStatus,
        description: input.reason || 'Wallet checkout hold released',
        failedAt:
          releasedStatus === WALLET_TRANSACTION_STATUSES.failed ||
          releasedStatus === WALLET_TRANSACTION_STATUSES.expired
            ? new Date()
            : undefined,
        metadata: toPrismaJson({
          pendingCheckoutId: input.pendingCheckoutId.toString(),
          paymentStatus: input.status,
          ...(input.metadata || {}),
        }),
      },
      include: { wallet: true, user: true },
    });
  }

  async debitForOrder(
    tx: WalletDbClient,
    input: { userId: bigint; orderId: bigint; amount: number; metadata?: Record<string, unknown> },
  ) {
    const amount = this.normalizeMoney(input.amount);
    if (amount <= 0) return null;

    const wallet = await this.getOrCreateWalletForUser(tx, input.userId);
    this.assertWalletActive(wallet.status);

    const lock = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        status: WALLET_STATUSES.active,
        availableBalance: { gte: amount },
      },
      data: {
        availableBalance: { decrement: amount },
      },
    });
    if (lock.count !== 1) {
      throw new BadRequestException(this.i18n.t('errors.wallet_insufficient_balance'));
    }

    return tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: input.userId,
        type: WALLET_TRANSACTION_TYPES.purchase,
        direction: WALLET_TRANSACTION_DIRECTIONS.debit,
        amount,
        currency: wallet.currency,
        status: WALLET_TRANSACTION_STATUSES.completed,
        paymentMethod: PAYMENT_METHODS.wallet,
        referenceType: WALLET_REFERENCE_TYPES.order,
        referenceId: input.orderId.toString(),
        description: 'Wallet order payment',
        completedAt: new Date(),
        metadata: toPrismaJson({
          orderId: input.orderId.toString(),
          ...(input.metadata || {}),
        }),
      },
      include: { wallet: true, user: true },
    });
  }

  async creditRefund(
    tx: WalletDbClient,
    input: {
      userId: bigint;
      amount: number;
      referenceType: string;
      referenceId: string;
      description?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const amount = this.normalizeMoney(input.amount);
    if (amount <= 0) return null;

    const wallet = await this.getOrCreateWalletForUser(tx, input.userId);
    this.assertWalletActive(wallet.status);

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { availableBalance: { increment: amount } },
    });

    return tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: input.userId,
        type: WALLET_TRANSACTION_TYPES.refund,
        direction: WALLET_TRANSACTION_DIRECTIONS.credit,
        amount,
        currency: wallet.currency,
        status: WALLET_TRANSACTION_STATUSES.completed,
        paymentMethod: PAYMENT_METHODS.wallet,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description || 'Wallet refund',
        completedAt: new Date(),
        metadata: input.metadata ? toPrismaJson(input.metadata) : undefined,
      },
      include: { wallet: true, user: true },
    });
  }

  async createDeposit(userId: bigint, dto: CreateWalletDepositDto) {
    if (dto.amount < WALLET_LIMITS.minDepositAmount) {
      throw new BadRequestException(this.i18n.t('errors.wallet_deposit_min_amount'));
    }

    const wallet = await this.walletRepository.getOrCreateWallet(userId);
    this.assertWalletActive(wallet.status);
    await this.paymentService.assertPaymentMethodAvailable(dto.paymentMethod, {
      providerIdentifier: dto.providerIdentifier,
      currency: wallet.currency,
    });

    const transaction = await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: WALLET_TRANSACTION_TYPES.deposit,
        direction: WALLET_TRANSACTION_DIRECTIONS.credit,
        amount: dto.amount,
        currency: wallet.currency,
        status: WALLET_TRANSACTION_STATUSES.pending,
        paymentMethod: dto.paymentMethod,
        referenceType: WALLET_REFERENCE_TYPES.walletDeposit,
        description: 'Wallet online deposit',
      },
      include: { wallet: true, user: true },
    });

    const paymentInit = await this.paymentService.initiatePayment(
      dto.paymentMethod,
      transaction.id.toString(),
      dto.amount,
      {
        providerIdentifier: dto.providerIdentifier,
        walletTransactionId: transaction.id,
        currency: wallet.currency,
        metadata: {
          purpose: WALLET_PAYMENT_PURPOSES.deposit,
          walletTransactionId: transaction.id.toString(),
          walletId: wallet.id.toString(),
          userId: userId.toString(),
        },
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/wallet?deposit_id=${transaction.id.toString()}&deposit_status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/wallet?deposit_id=${transaction.id.toString()}&deposit_status=cancelled`,
      },
    );

    const transactionRef =
      paymentInit.transactionRef === 'error'
        ? `wallet_deposit_error_${transaction.id.toString()}`
        : paymentInit.transactionRef;

    const updated = await this.prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: {
        transactionRef,
        status: WALLET_TRANSACTION_STATUSES.pending,
        gatewayResponse: paymentInit.gatewayResponse ? toPrismaJson(paymentInit.gatewayResponse) : undefined,
      },
      include: { wallet: true, user: true },
    });

    if (paymentInit.status === PAYMENT_STATUSES.completed) {
      await this.completeDepositTransaction(updated.id, transactionRef, paymentInit.gatewayResponse || {});
    }

    return {
      ...this.formatTransaction(updated),
      redirectUrl: paymentInit.redirectUrl,
      clientSecret: paymentInit.gatewayResponse?.clientSecret,
    };
  }

  async getClientDeposit(userId: bigint, id: bigint) {
    const transaction = await this.walletRepository.findDepositForUser(userId, id, WALLET_TRANSACTION_TYPES.deposit);
    if (!transaction) throw new NotFoundException(this.i18n.t('errors.wallet_transaction_not_found'));
    return this.formatTransaction(transaction);
  }

  async verifyClientDeposit(userId: bigint, id: bigint) {
    const transaction = await this.walletRepository.findDepositForUser(userId, id, WALLET_TRANSACTION_TYPES.deposit);
    if (!transaction) throw new NotFoundException(this.i18n.t('errors.wallet_transaction_not_found'));

    if (transaction.status === WALLET_TRANSACTION_STATUSES.completed) {
      return this.formatTransaction(transaction);
    }
    if (!transaction.paymentMethod || !transaction.transactionRef) {
      throw new BadRequestException(this.i18n.t('errors.wallet_deposit_payment_missing'));
    }

    const verify = await this.paymentService.verifyPayment(transaction.paymentMethod, transaction.transactionRef, {});
    if (verify.status === PAYMENT_STATUSES.completed) {
      const completed = await this.completeDepositTransaction(
        transaction.id,
        transaction.transactionRef,
        verify.gatewayResponse || {},
      );
      return this.formatTransaction(completed);
    }

    if (verify.status === PAYMENT_STATUSES.failed) {
      const failed = await this.prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: WALLET_TRANSACTION_STATUSES.failed,
          failedAt: new Date(),
          gatewayResponse: verify.gatewayResponse ? toPrismaJson(verify.gatewayResponse) : undefined,
        },
        include: { wallet: true, user: true },
      });
      return this.formatTransaction(failed);
    }

    return this.formatTransaction(transaction);
  }

  async cancelClientDeposit(userId: bigint, id: bigint) {
    const transaction = await this.walletRepository.findDepositForUser(userId, id, WALLET_TRANSACTION_TYPES.deposit);
    if (!transaction) throw new NotFoundException(this.i18n.t('errors.wallet_transaction_not_found'));

    if (transaction.status === WALLET_TRANSACTION_STATUSES.completed) {
      return this.formatTransaction(transaction);
    }
    if (transaction.status !== WALLET_TRANSACTION_STATUSES.pending) {
      return this.formatTransaction(transaction);
    }

    let gatewayResponse: unknown = { cancelledByClient: true };
    if (transaction.paymentMethod && transaction.transactionRef) {
      gatewayResponse = await this.paymentService.cancelPayment(transaction.paymentMethod, transaction.transactionRef);
    }

    const cancelled = await this.prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: {
        status: WALLET_TRANSACTION_STATUSES.cancelled,
        failedAt: new Date(),
        gatewayResponse: toPrismaJson(gatewayResponse),
      },
      include: { wallet: true, user: true },
    });

    return this.formatTransaction(cancelled);
  }

  async completeDepositTransaction(id: bigint, transactionRef: string, gatewayResponse: unknown) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id },
        include: { wallet: true, user: true },
      });
      if (!transaction) {
        throw new NotFoundException(this.i18n.t('errors.wallet_transaction_not_found'));
      }
      if (transaction.status === WALLET_TRANSACTION_STATUSES.completed) {
        return transaction;
      }
      if (
        transaction.type !== WALLET_TRANSACTION_TYPES.deposit ||
        transaction.direction !== WALLET_TRANSACTION_DIRECTIONS.credit ||
        transaction.status !== WALLET_TRANSACTION_STATUSES.pending
      ) {
        throw new BadRequestException(this.i18n.t('errors.wallet_deposit_invalid_status'));
      }

      const claim = await tx.walletTransaction.updateMany({
        where: {
          id: transaction.id,
          status: WALLET_TRANSACTION_STATUSES.pending,
        },
        data: {
          status: WALLET_TRANSACTION_STATUSES.completed,
          transactionRef,
          gatewayResponse: toPrismaJson(gatewayResponse),
          completedAt: new Date(),
        },
      });
      if (claim.count !== 1) {
        return tx.walletTransaction.findUniqueOrThrow({
          where: { id: transaction.id },
          include: { wallet: true, user: true },
        });
      }

      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: { availableBalance: { increment: transaction.amount } },
      });

      return tx.walletTransaction.findUniqueOrThrow({
        where: { id: transaction.id },
        include: { wallet: true, user: true },
      });
    });
  }

  async markDepositFailedByTransactionRef(transactionRef: string, gatewayResponse: unknown) {
    const transaction = await this.prisma.walletTransaction.findUnique({
      where: { transactionRef },
      include: { wallet: true, user: true },
    });
    if (!transaction || transaction.status !== WALLET_TRANSACTION_STATUSES.pending) {
      return transaction;
    }
    return this.prisma.walletTransaction.update({
      where: { id: transaction.id },
      data: {
        status: WALLET_TRANSACTION_STATUSES.failed,
        failedAt: new Date(),
        gatewayResponse: toPrismaJson(gatewayResponse),
      },
      include: { wallet: true, user: true },
    });
  }

  async createWithdrawal(userId: bigint, dto: CreateWalletWithdrawalDto) {
    if (dto.amount < WALLET_LIMITS.minWithdrawalAmount) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_min_amount'));
    }

    const wallet = await this.walletRepository.getOrCreateWallet(userId);
    this.assertWalletActive(wallet.status);

    return this.prisma.$transaction(async (tx) => {
      const lock = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          status: WALLET_STATUSES.active,
          availableBalance: { gte: dto.amount },
        },
        data: {
          availableBalance: { decrement: dto.amount },
          pendingBalance: { increment: dto.amount },
        },
      });
      if (lock.count !== 1) {
        throw new BadRequestException(this.i18n.t('errors.wallet_insufficient_balance'));
      }

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: WALLET_TRANSACTION_TYPES.withdrawal,
          direction: WALLET_TRANSACTION_DIRECTIONS.debit,
          amount: dto.amount,
          currency: wallet.currency,
          status: WALLET_TRANSACTION_STATUSES.pending,
          referenceType: WALLET_REFERENCE_TYPES.walletWithdrawal,
          description: 'Wallet manual withdrawal',
        },
      });

      const withdrawal = await tx.walletWithdrawalRequest.create({
        data: {
          walletId: wallet.id,
          userId,
          transactionId: transaction.id,
          amount: dto.amount,
          currency: wallet.currency,
          method: dto.method,
          details: toPrismaJson(dto.details),
          status: WALLET_WITHDRAWAL_STATUSES.requested,
          clientNote: dto.note,
        },
        include: { wallet: true, user: true, transaction: true },
      });

      await tx.walletTransaction.update({
        where: { id: transaction.id },
        data: { referenceId: withdrawal.id.toString() },
      });

      return this.formatWithdrawal(withdrawal);
    });
  }

  async cancelClientWithdrawal(userId: bigint, id: bigint) {
    const withdrawal = await this.walletRepository.findWithdrawalForUser(userId, id);
    if (!withdrawal) throw new NotFoundException(this.i18n.t('errors.wallet_withdrawal_not_found'));
    if (withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_cannot_cancel'));
    }
    return this.returnPendingWithdrawalBalance(
      withdrawal,
      WALLET_WITHDRAWAL_STATUSES.cancelledByClient,
      WALLET_TRANSACTION_STATUSES.cancelled,
    );
  }

  async approveWithdrawal(id: bigint, dto: AdminWithdrawalActionDto) {
    const withdrawal = await this.findWithdrawalOrThrow(id);
    if (withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_invalid_transition'));
    }
    const updated = await this.prisma.walletWithdrawalRequest.update({
      where: { id },
      data: {
        status: WALLET_WITHDRAWAL_STATUSES.approved,
        approvedAt: new Date(),
        adminNote: dto.note,
      },
      include: { wallet: true, user: true, transaction: true },
    });
    return this.formatWithdrawal(updated);
  }

  async markWithdrawalPaid(id: bigint, dto: AdminMarkWithdrawalPaidDto) {
    const withdrawal = await this.findWithdrawalOrThrow(id);
    if (
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.requested &&
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.approved
    ) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_invalid_transition'));
    }

    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.walletWithdrawalRequest.updateMany({
        where: {
          id: withdrawal.id,
          status: { in: [WALLET_WITHDRAWAL_STATUSES.requested, WALLET_WITHDRAWAL_STATUSES.approved] },
        },
        data: {
          status: WALLET_WITHDRAWAL_STATUSES.paid,
          transferReference: dto.transferReference,
          adminNote: dto.note,
          paidAt: new Date(),
        },
      });
      if (claim.count !== 1) {
        return this.formatWithdrawal(await this.findWithdrawalOrThrow(id, tx));
      }

      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: { pendingBalance: { decrement: withdrawal.amount } },
      });
      await tx.walletTransaction.update({
        where: { id: withdrawal.transactionId },
        data: {
          status: WALLET_TRANSACTION_STATUSES.completed,
          completedAt: new Date(),
          metadata: toPrismaJson({ transferReference: dto.transferReference }),
        },
      });

      return this.formatWithdrawal(await this.findWithdrawalOrThrow(id, tx));
    });
  }

  async rejectWithdrawal(id: bigint, dto: AdminWithdrawalActionDto) {
    const withdrawal = await this.findWithdrawalOrThrow(id);
    if (
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.requested &&
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.approved
    ) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_invalid_transition'));
    }
    return this.returnPendingWithdrawalBalance(
      withdrawal,
      WALLET_WITHDRAWAL_STATUSES.rejected,
      WALLET_TRANSACTION_STATUSES.reversed,
      dto.note,
    );
  }

  async failWithdrawal(id: bigint, dto: AdminWithdrawalActionDto) {
    const withdrawal = await this.findWithdrawalOrThrow(id);
    if (
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.requested &&
      withdrawal.status !== WALLET_WITHDRAWAL_STATUSES.approved
    ) {
      throw new BadRequestException(this.i18n.t('errors.wallet_withdrawal_invalid_transition'));
    }
    return this.returnPendingWithdrawalBalance(
      withdrawal,
      WALLET_WITHDRAWAL_STATUSES.failed,
      WALLET_TRANSACTION_STATUSES.failed,
      dto.note,
    );
  }

  async listClientTransactions(userId: bigint, query: AdvancedQueryDto) {
    const result = await this.walletRepository.listTransactions(query, { userId });
    return this.mapResult(result, (transaction) => this.formatTransaction(transaction));
  }

  async listAdminTransactions(query: AdvancedQueryDto) {
    const result = await this.walletRepository.listTransactions(query);
    return this.mapResult(result, (transaction) => this.formatTransaction(transaction));
  }

  async listClientWithdrawals(userId: bigint, query: AdvancedQueryDto) {
    const result = await this.walletRepository.listWithdrawals(query, { userId });
    return this.mapResult(result, (withdrawal) => this.formatWithdrawal(withdrawal));
  }

  async listAdminWithdrawals(query: AdvancedQueryDto) {
    const result = await this.walletRepository.listWithdrawals(query);
    return this.mapResult(result, (withdrawal) => this.formatWithdrawal(withdrawal));
  }

  async getClientWithdrawal(userId: bigint, id: bigint) {
    const withdrawal = await this.walletRepository.findWithdrawalForUser(userId, id);
    if (!withdrawal) throw new NotFoundException(this.i18n.t('errors.wallet_withdrawal_not_found'));
    return this.formatWithdrawal(withdrawal);
  }

  async getAdminWithdrawal(id: bigint) {
    return this.formatWithdrawal(await this.findWithdrawalOrThrow(id));
  }

  async listAdminWallets(query: AdvancedQueryDto) {
    const result = await this.walletRepository.listWallets(query);
    return this.mapResult(result, (wallet) => this.formatWallet(wallet));
  }

  async getAdminWallet(id: bigint) {
    const wallet = await this.walletRepository.findWalletById(id);
    if (!wallet) throw new NotFoundException(this.i18n.t('errors.wallet_not_found'));
    return this.formatWallet(wallet);
  }

  private assertWalletActive(status: string) {
    if (status !== WALLET_STATUSES.active) {
      throw new BadRequestException(this.i18n.t('errors.wallet_not_active'));
    }
  }

  private normalizeMoney(amount: number) {
    return Number(Math.max(0, amount || 0).toFixed(2));
  }

  private async getOrCreateWalletForUser(tx: WalletDbClient, userId: bigint) {
    return tx.wallet.upsert({
      where: {
        userId_currency: {
          userId,
          currency: PAYMENT_CURRENCIES.sar,
        },
      },
      create: {
        userId,
        currency: PAYMENT_CURRENCIES.sar,
        availableBalance: 0,
        pendingBalance: 0,
        status: WALLET_STATUSES.active,
      },
      update: {},
      include: { user: true },
    });
  }

  private async findWithdrawalOrThrow(id: bigint, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    const withdrawal = await this.walletRepository.findWithdrawalById(id, tx);
    if (!withdrawal) throw new NotFoundException(this.i18n.t('errors.wallet_withdrawal_not_found'));
    return withdrawal;
  }

  private async returnPendingWithdrawalBalance(
    withdrawal: WalletWithdrawalWithRelations,
    withdrawalStatus: string,
    transactionStatus: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.walletWithdrawalRequest.updateMany({
        where: {
          id: withdrawal.id,
          status: withdrawal.status,
        },
        data: {
          status: withdrawalStatus,
          adminNote,
          rejectedAt: withdrawalStatus === WALLET_WITHDRAWAL_STATUSES.rejected ? new Date() : undefined,
          failedAt: withdrawalStatus === WALLET_WITHDRAWAL_STATUSES.failed ? new Date() : undefined,
          cancelledAt: withdrawalStatus === WALLET_WITHDRAWAL_STATUSES.cancelledByClient ? new Date() : undefined,
        },
      });
      if (claim.count !== 1) {
        return this.formatWithdrawal(await this.findWithdrawalOrThrow(withdrawal.id, tx));
      }

      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          pendingBalance: { decrement: withdrawal.amount },
          availableBalance: { increment: withdrawal.amount },
        },
      });
      await tx.walletTransaction.update({
        where: { id: withdrawal.transactionId },
        data: {
          status: transactionStatus,
          failedAt: transactionStatus === WALLET_TRANSACTION_STATUSES.failed ? new Date() : undefined,
        },
      });

      return this.formatWithdrawal(await this.findWithdrawalOrThrow(withdrawal.id, tx));
    });
  }

  private mapResult<T, R>(result: T[] | { data: T[] }, mapper: (item: T) => R) {
    if (Array.isArray(result)) return result.map(mapper);
    return { ...result, data: result.data.map(mapper) };
  }

  private formatWallet(wallet: WalletWithUser) {
    return {
      id: wallet.id.toString(),
      userId: wallet.userId.toString(),
      userName: wallet.user.name,
      userEmail: wallet.user.email,
      currency: wallet.currency,
      availableBalance: Number(wallet.availableBalance),
      pendingBalance: Number(wallet.pendingBalance),
      status: wallet.status,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  private formatTransaction(transaction: WalletTransactionWithRelations) {
    return {
      id: transaction.id.toString(),
      walletId: transaction.walletId.toString(),
      userId: transaction.userId.toString(),
      userName: transaction.user.name,
      userEmail: transaction.user.email,
      type: transaction.type,
      direction: transaction.direction,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      status: transaction.status,
      paymentMethod: transaction.paymentMethod,
      transactionRef: transaction.transactionRef,
      referenceType: transaction.referenceType,
      referenceId: transaction.referenceId,
      description: transaction.description,
      gatewayResponse: transaction.gatewayResponse,
      metadata: transaction.metadata,
      completedAt: transaction.completedAt,
      failedAt: transaction.failedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  private formatWithdrawal(withdrawal: WalletWithdrawalWithRelations) {
    return {
      id: withdrawal.id.toString(),
      walletId: withdrawal.walletId.toString(),
      userId: withdrawal.userId.toString(),
      userName: withdrawal.user.name,
      userEmail: withdrawal.user.email,
      transactionId: withdrawal.transactionId.toString(),
      amount: Number(withdrawal.amount),
      currency: withdrawal.currency,
      method: withdrawal.method,
      details: withdrawal.details,
      status: withdrawal.status,
      transferReference: withdrawal.transferReference,
      clientNote: withdrawal.clientNote,
      adminNote: withdrawal.adminNote,
      requestedAt: withdrawal.requestedAt,
      approvedAt: withdrawal.approvedAt,
      paidAt: withdrawal.paidAt,
      rejectedAt: withdrawal.rejectedAt,
      failedAt: withdrawal.failedAt,
      cancelledAt: withdrawal.cancelledAt,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
    };
  }
}
