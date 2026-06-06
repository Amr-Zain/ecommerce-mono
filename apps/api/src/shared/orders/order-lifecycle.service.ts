import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { I18nTranslations } from '@/generated/i18n.generated';
import { INVENTORY_REASONS } from '@/common/constants/commerce.constants';
import {
  ORDER_STATUS_ACTORS,
  PAYMENT_CURRENCIES,
  PAYMENT_STATUSES,
  REFUND_SOURCES,
} from '@/shared/payment/payment.constants';
import { PaymentService } from '@/shared/payment/payment.service';
import {
  IOrdersRepository,
  ORDERS_REPOSITORY,
  IPaymentTransactionsRepository,
  PAYMENT_TRANSACTIONS_REPOSITORY,
  IVariantsRepository,
  VARIANTS_REPOSITORY,
} from '@/common/interfaces';
import { DomainEventPublisher } from '@/common/events/domain-event-publisher.service';
import {
  createDomainEvent,
  DOMAIN_EVENTS,
  type OrderStatusChangedPayload,
  type OrderCancelledPayload,
  type PaymentCompletedPayload,
  type PaymentFailedPayload,
} from '@/common/events/domain-event';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

type ActorType = (typeof ORDER_STATUS_ACTORS)[keyof typeof ORDER_STATUS_ACTORS];

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly i18n: I18nService<I18nTranslations>,
    @Inject(ORDERS_REPOSITORY) private readonly ordersRepository: IOrdersRepository,
    @Inject(PAYMENT_TRANSACTIONS_REPOSITORY)
    private readonly paymentTransactionsRepository: IPaymentTransactionsRepository,
    @Inject(VARIANTS_REPOSITORY) private readonly variantsRepository: IVariantsRepository,
    private readonly domainEvents: DomainEventPublisher,
  ) { }

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
      const attempt = await this.paymentTransactionsRepository.create(
        {
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
        tx,
      );
      await this.ordersRepository.updateOrder(order.id, { paymentStatus: PAYMENT_STATUSES.processingPayment }, tx);

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
    const attempt = await this.paymentTransactionsRepository.findFirst({
      id: refundId,
      orderId,
      refundSource: REFUND_SOURCES.cancellation,
      paymentStatus: PAYMENT_STATUSES.requiresReview,
    });
    if (!attempt) throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
    const gateway = (attempt.gatewayResponse || {}) as Record<string, unknown>;
    const originalTransactionRef = String(gateway.originalTransactionRef || '');
    if (!originalTransactionRef || !attempt.idempotencyKey) {
      throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_invalid'));
    }
    await this.prisma.$transaction(async (tx) => {
      const claimed = await this.paymentTransactionsRepository.updateMany(
        {
          where: {
            id: attempt.id,
            orderId,
            refundSource: REFUND_SOURCES.cancellation,
            paymentStatus: PAYMENT_STATUSES.requiresReview,
          },
          data: { paymentStatus: PAYMENT_STATUSES.processingPayment, requestedById: adminId },
        },
        tx,
      );
      if (claimed.count !== 1) {
        throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
      }
      await this.ordersRepository.updateOrder(orderId, { paymentStatus: PAYMENT_STATUSES.processingPayment }, tx);
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
    await this.ordersRepository.updateOrder(orderId, { paymentStatus }, tx);
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
    const history = await this.ordersRepository.createStatusHistory(input, tx);
    const order = await this.ordersRepository.findLifecycleOrder(input.orderId, tx);
    await this.domainEvents.publish(
      createDomainEvent<OrderStatusChangedPayload | OrderCancelledPayload>({
        eventName: input.newStatus === 'cancelled' ? DOMAIN_EVENTS.orderCancelled : DOMAIN_EVENTS.orderStatusChanged,
        aggregateType: 'order',
        aggregateId: input.orderId.toString(),
        actor: { type: input.actorType, userId: input.actorUserId?.toString() },
        payload: {
          orderId: input.orderId.toString(),
          userId: order?.userId.toString(),
          previousStatus: input.previousStatus ?? null,
          newStatus: input.newStatus,
          reason: input.reason ?? null,
        },
      }),
      tx,
    );
    return history;
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
      const attempt = await this.paymentTransactionsRepository.findById(attemptId, tx);
      if (!attempt) throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
      await this.ordersRepository.lock(attempt.orderId, tx);
      const order = await this.ordersRepository.findLifecycleOrder(attempt.orderId, tx);
      if (!order) throw new NotFoundException(this.i18n.t('errors.order_not_found'));
      if (order.status === 'cancelled') return;

      await this.paymentTransactionsRepository.update(
        attempt.id,
        {
          paymentStatus: PAYMENT_STATUSES.refunded,
          gatewayResponse: toJson({
            originalTransactionRef: input.originalTransactionRef,
            refundResponse: refund.gatewayResponse || {},
          }),
          paidAt: new Date(),
        },
        tx,
      );
      await this.domainEvents.publish(
        createDomainEvent<PaymentCompletedPayload>({
          eventName: DOMAIN_EVENTS.paymentCompleted,
          aggregateType: 'order',
          aggregateId: order.id.toString(),
          actor: { type: input.actorType, userId: input.actorUserId?.toString() },
          payload: {
            orderId: order.id.toString(),
            userId: order.userId.toString(),
            status: PAYMENT_STATUSES.refunded,
            paymentId: attempt.id.toString(),
            amount: Number(attempt.amount),
            refundSource: REFUND_SOURCES.cancellation,
          },
        }),
        tx,
      );
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
      const attempt = await this.paymentTransactionsRepository.findById(attemptId, tx);
      if (!attempt) throw new NotFoundException(this.i18n.t('errors.order_cancellation_refund_not_found'));
      await this.paymentTransactionsRepository.update(
        attemptId,
        {
          paymentStatus: PAYMENT_STATUSES.requiresReview,
          gatewayResponse: toJson({
            originalTransactionRef,
            refundResponse,
          }),
        },
        tx,
      );
      await this.ordersRepository.updateOrder(attempt.orderId, { paymentStatus: PAYMENT_STATUSES.requiresReview }, tx);
      const order = await this.ordersRepository.findLifecycleOrder(attempt.orderId, tx);
      await this.domainEvents.publish(
        createDomainEvent<PaymentFailedPayload>({
          eventName: DOMAIN_EVENTS.paymentFailed,
          aggregateType: 'order',
          aggregateId: attempt.orderId.toString(),
          actor: { type: 'system' },
          payload: {
            orderId: attempt.orderId.toString(),
            userId: order?.userId.toString(),
            status: PAYMENT_STATUSES.requiresReview,
            paymentId: attemptId.toString(),
            refundSource: REFUND_SOURCES.cancellation,
          },
        }),
        tx,
      );
    });
  }

  private async finalizeCancellation(
    tx: Prisma.TransactionClient,
    order: Prisma.OrderGetPayload<{ include: { items: true; payments: true } }>,
    input: { actorType: ActorType; actorUserId?: bigint; reason?: string },
  ) {
    for (const item of order.items) {
      if (!item.variantId) continue;
      await this.variantsRepository.adjustStock(item.variantId, item.quantity, INVENTORY_REASONS.return, tx);
    }

    await this.paymentTransactionsRepository.updateMany(
      {
        where: {
          orderId: order.id,
          paymentStatus: { in: [PAYMENT_STATUSES.pending, PAYMENT_STATUSES.awaitingConfirmation] },
        },
        data: { paymentStatus: PAYMENT_STATUSES.failed },
      },
      tx,
    );
    const summary = this.paymentSummary(await this.paymentTransactionsRepository.findMany({ orderId: order.id }, tx));
    await this.ordersRepository.updateOrder(
      order.id,
      {
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
      tx,
    );
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
