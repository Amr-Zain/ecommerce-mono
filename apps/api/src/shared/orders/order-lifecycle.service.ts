import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { I18nTranslations } from '@/generated/i18n.generated';
import { INVENTORY_REASONS } from '@/common/constants/commerce.constants';
import {
  ONLINE_PAYMENT_METHODS,
  ORDER_STATUS_ACTORS,
  PAYMENT_CURRENCIES,
  PAYMENT_STATUSES,
  REFUND_SOURCES,
} from '@/shared/payment/payment.constants';
import { PaymentService } from '@/shared/payment/payment.service';
import { IOrdersRepository, ORDERS_REPOSITORY } from '@/common/interfaces';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

type ActorType = (typeof ORDER_STATUS_ACTORS)[keyof typeof ORDER_STATUS_ACTORS];

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly i18n: I18nService<I18nTranslations>,
    @Inject(ORDERS_REPOSITORY) private readonly ordersRepository: IOrdersRepository,
  ) {}

  paymentSummary(payments: { amount: Prisma.Decimal; paymentStatus: string; refundSource?: string | null }[]) {
    const paid = this.round(
      payments
        .filter((payment) => payment.paymentStatus === PAYMENT_STATUSES.completed)
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    );
    const refunded = this.round(
      payments
        .filter((payment) => payment.paymentStatus === PAYMENT_STATUSES.refunded)
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    );
    const reserved = this.round(
      payments
        .filter(
          (payment) =>
            Boolean(payment.refundSource) &&
            (payment.paymentStatus === PAYMENT_STATUSES.processingPayment ||
              payment.paymentStatus === PAYMENT_STATUSES.requiresReview),
        )
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    );
    return {
      originalPaidAmount: paid,
      refundedAmount: refunded,
      reservedRefundAmount: reserved,
      remainingRefundableAmount: this.round(Math.max(0, paid - refunded - reserved)),
    };
  }

  async cancelOrder(input: {
    orderId: bigint;
    allowedStatuses: readonly string[];
    actorType: ActorType;
    actorUserId?: bigint;
    reason?: string;
  }) {
    const reservation = await this.prisma.$transaction(async (tx) => {
      await this.ordersRepository.lock(input.orderId, tx);
      const order = await this.ordersRepository.findLifecycleOrder(input.orderId, tx);
      if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
      if (!input.allowedStatuses.includes(order.status)) {
        throw new BadRequestException(
          this.i18n.t('errors.order_cannot_cancel_status', { args: { status: order.status } }),
        );
      }

      const summary = this.paymentSummary(order.payments);
      const activeAttempt = order.payments.find(
        (payment) =>
          payment.refundSource === REFUND_SOURCES.cancellation &&
          ([PAYMENT_STATUSES.processingPayment, PAYMENT_STATUSES.requiresReview] as readonly string[]).includes(
            payment.paymentStatus,
          ),
      );
      if (activeAttempt) {
        throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_requires_review'));
      }

      if (summary.remainingRefundableAmount <= 0) {
        await this.finalizeCancellation(tx, order, input);
        return null;
      }

      const completedPayment = order.payments.find(
        (payment) => payment.paymentStatus === PAYMENT_STATUSES.completed && payment.transactionRef,
      );
      if (!completedPayment) {
        throw new BadRequestException(this.i18n.t('errors.order_completed_payment_not_found'));
      }

      const idempotencyKey = `cancel_order_${order.id.toString()}_${Date.now()}`;
      const attempt = await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: summary.remainingRefundableAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: PAYMENT_STATUSES.processingPayment,
          transactionRef: `cancel_refund_${order.id.toString()}`,
          gatewayResponse: toJson({ originalTransactionRef: completedPayment.transactionRef }),
          currency: completedPayment.currency || PAYMENT_CURRENCIES.sar,
          refundSource: REFUND_SOURCES.cancellation,
          refundReason: input.reason,
          idempotencyKey,
          requestedById: input.actorUserId,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: PAYMENT_STATUSES.processingPayment },
      });

      return {
        attemptId: attempt.id,
        method: order.paymentMethod,
        originalTransactionRef: completedPayment.transactionRef!,
        amount: summary.remainingRefundableAmount,
        idempotencyKey,
        actorType: input.actorType,
        actorUserId: input.actorUserId,
        reason: input.reason,
      };
    });

    if (!reservation) return;
    await this.processCancellationRefund(reservation.attemptId, reservation);
  }

  async retryCancellationRefund(orderId: bigint, refundId: bigint, adminId?: bigint) {
    const attempt = await this.prisma.paymentTransaction.findFirst({
      where: {
        id: refundId,
        orderId,
        refundSource: REFUND_SOURCES.cancellation,
        paymentStatus: PAYMENT_STATUSES.requiresReview,
      },
    });
    if (!attempt) throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
    const gateway = (attempt.gatewayResponse || {}) as Record<string, unknown>;
    const originalTransactionRef = String(gateway.originalTransactionRef || '');
    if (!originalTransactionRef || !attempt.idempotencyKey) {
      throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_invalid'));
    }
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.paymentTransaction.updateMany({
        where: {
          id: attempt.id,
          orderId,
          refundSource: REFUND_SOURCES.cancellation,
          paymentStatus: PAYMENT_STATUSES.requiresReview,
        },
        data: { paymentStatus: PAYMENT_STATUSES.processingPayment, requestedById: adminId },
      });
      if (claimed.count !== 1) {
        throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
      }
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PAYMENT_STATUSES.processingPayment },
      });
    });
    await this.processCancellationRefund(attempt.id, {
      method: attempt.paymentMethod,
      originalTransactionRef,
      amount: Number(attempt.amount),
      idempotencyKey: attempt.idempotencyKey,
      actorType: ORDER_STATUS_ACTORS.admin,
      actorUserId: adminId,
      reason: attempt.refundReason ?? undefined,
    });
  }

  async syncOrderPaymentStatus(tx: Prisma.TransactionClient, orderId: bigint) {
    const order = await this.ordersRepository.findOrderWithPayments(orderId, tx);
    if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    const summary = this.paymentSummary(order.payments);
    const paymentStatus =
      summary.refundedAmount <= 0
        ? order.paymentStatus
        : summary.remainingRefundableAmount <= 0
          ? PAYMENT_STATUSES.refunded
          : PAYMENT_STATUSES.partiallyRefunded;
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus } });
    return summary;
  }

  async assertRemainingRefundCapacity(orderId: bigint, amount: number) {
    const order = await this.ordersRepository.findOrderWithPayments(orderId);
    if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    if (amount > this.paymentSummary(order.payments).remainingRefundableAmount) {
      throw new BadRequestException(this.i18n.t('errors.refund_amount_exceeds_remaining_paid_amount'));
    }
  }

  async assertRemainingRefundCapacityTx(tx: Prisma.TransactionClient, orderId: bigint, amount: number) {
    await this.ordersRepository.lock(orderId, tx);
    const order = await this.ordersRepository.findOrderWithPayments(orderId, tx);
    if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    if (amount > this.paymentSummary(order.payments).remainingRefundableAmount) {
      throw new BadRequestException(this.i18n.t('errors.refund_amount_exceeds_remaining_paid_amount'));
    }
  }

  async createStatusHistory(
    tx: Prisma.TransactionClient,
    input: {
      orderId: bigint;
      previousStatus?: string | null;
      newStatus: string;
      actorType: ActorType;
      actorUserId?: bigint;
      reason?: string;
      metadata?: unknown;
    },
  ) {
    return tx.orderStatusHistory.create({
      data: {
        orderId: input.orderId,
        previousStatus: input.previousStatus,
        newStatus: input.newStatus,
        actorType: input.actorType,
        actorUserId: input.actorUserId,
        reason: input.reason,
        metadata: input.metadata ? toJson(input.metadata) : undefined,
      },
    });
  }

  private async processCancellationRefund(
    attemptId: bigint,
    input: {
      method: string;
      originalTransactionRef: string;
      amount: number;
      idempotencyKey: string;
      actorType: ActorType;
      actorUserId?: bigint;
      reason?: string;
    },
  ) {
    let refund: Awaited<ReturnType<PaymentService['refundPayment']>>;
    try {
      refund = await this.paymentService.refundPayment(input.method, input.originalTransactionRef, input.amount, {
        idempotencyKey: input.idempotencyKey,
      });
    } catch (error) {
      await this.markCancellationRefundRequiresReview(attemptId, input.originalTransactionRef, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_requires_review'));
    }
    if (refund.status !== PAYMENT_STATUSES.refunded) {
      await this.markCancellationRefundRequiresReview(
        attemptId,
        input.originalTransactionRef,
        refund.gatewayResponse || {},
      );
      throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_requires_review'));
    }

    await this.prisma.$transaction(async (tx) => {
      const attempt = await tx.paymentTransaction.findUnique({ where: { id: attemptId } });
      if (!attempt) throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
      await this.ordersRepository.lock(attempt.orderId, tx);
      const order = await this.ordersRepository.findLifecycleOrder(attempt.orderId, tx);
      if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
      if (order.status === 'cancelled') return;

      await tx.paymentTransaction.update({
        where: { id: attempt.id },
        data: {
          paymentStatus: PAYMENT_STATUSES.refunded,
          gatewayResponse: toJson({
            originalTransactionRef: input.originalTransactionRef,
            refundResponse: refund.gatewayResponse || {},
          }),
          paidAt: new Date(),
        },
      });
      await this.finalizeCancellation(tx, order, {
        actorType: input.actorType,
        actorUserId: input.actorUserId,
        reason: input.reason,
      });
    });
  }

  private async markCancellationRefundRequiresReview(
    attemptId: bigint,
    originalTransactionRef: string,
    refundResponse: unknown,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const attempt = await tx.paymentTransaction.findUniqueOrThrow({
        where: { id: attemptId },
        select: { orderId: true },
      });
      await tx.paymentTransaction.update({
        where: { id: attemptId },
        data: {
          paymentStatus: PAYMENT_STATUSES.requiresReview,
          gatewayResponse: toJson({
            originalTransactionRef,
            refundResponse,
          }),
        },
      });
      await tx.order.update({
        where: { id: attempt.orderId },
        data: { paymentStatus: PAYMENT_STATUSES.requiresReview },
      });
    });
  }

  private async finalizeCancellation(
    tx: Prisma.TransactionClient,
    order: Prisma.OrderGetPayload<{ include: { items: true; payments: true } }>,
    input: { actorType: ActorType; actorUserId?: bigint; reason?: string },
  ) {
    for (const item of order.items) {
      if (!item.variantId) continue;
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant) continue;
      const previousStock = variant.stockQuantity;
      const newStock = previousStock + item.quantity;
      await tx.productVariant.update({ where: { id: variant.id }, data: { stockQuantity: newStock } });
      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeAmount: item.quantity,
          previousStock,
          newStock,
          reason: INVENTORY_REASONS.return,
        },
      });
    }

    await tx.paymentTransaction.updateMany({
      where: {
        orderId: order.id,
        paymentStatus: { in: [PAYMENT_STATUSES.pending, PAYMENT_STATUSES.awaitingConfirmation] },
      },
      data: { paymentStatus: PAYMENT_STATUSES.failed },
    });
    const summary = this.paymentSummary(await tx.paymentTransaction.findMany({ where: { orderId: order.id } }));
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'cancelled',
        paymentStatus:
          summary.refundedAmount > 0
            ? PAYMENT_STATUSES.refunded
            : order.payments.some(
                  (payment) =>
                    payment.paymentStatus === PAYMENT_STATUSES.pending ||
                    payment.paymentStatus === PAYMENT_STATUSES.awaitingConfirmation,
                )
              ? PAYMENT_STATUSES.failed
              : order.paymentStatus,
        cancelledAt: new Date(),
        cancelReason: input.reason,
      },
    });
    await this.createStatusHistory(tx, {
      orderId: order.id,
      previousStatus: order.status,
      newStatus: 'cancelled',
      actorType: input.actorType,
      actorUserId: input.actorUserId,
      reason: input.reason,
    });
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
