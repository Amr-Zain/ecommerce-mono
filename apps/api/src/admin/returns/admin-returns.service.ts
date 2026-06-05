import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { PaymentService } from '@/shared/payment/payment.service';
import { I18nTranslations } from '@/generated/i18n.generated';
import { INVENTORY_REASONS } from '@/common/constants/commerce.constants';
import {
  EXCHANGE_REQUEST_STATUSES,
  EXCHANGE_RESERVATION_MINUTES,
  ITEM_DISPOSITIONS,
  PRICE_ADJUSTMENT_STATUSES,
  REFUND_STATUSES,
  RETURN_REQUEST_STATUSES,
} from '@/common/constants/return-exchange.constants';
import { ONLINE_PAYMENT_METHODS, PAYMENT_CURRENCIES, PAYMENT_STATUSES } from '@/shared/payment/payment.constants';
import { REFUND_SOURCES } from '@/shared/payment/payment.constants';
import { OrderLifecycleService } from '@/shared/orders/order-lifecycle.service';
import {
  AdminExchangePaymentDto,
  AdminReceiveExchangeDto,
  AdminReceiveReturnDto,
  AdminRejectRequestDto,
  AdminReturnRefundDto,
  AdminVerifyExchangePaymentDto,
  AdminReturnExchangeQueryDto,
} from './dto/admin-return-exchange.dto';

const SETTLED_PRICE_STATUSES: readonly string[] = [
  PRICE_ADJUSTMENT_STATUSES.none,
  PRICE_ADJUSTMENT_STATUSES.paid,
  PRICE_ADJUSTMENT_STATUSES.refunded,
  PRICE_ADJUSTMENT_STATUSES.waived,
];

const ACTIVE_EXCHANGE_STOCK_STATUSES = [
  EXCHANGE_REQUEST_STATUSES.approved,
  EXCHANGE_REQUEST_STATUSES.itemReceived,
] as const;

type ReturnRequestWithRelations = Prisma.ReturnRequestGetPayload<{
  include: {
    order: true;
    user: true;
    items: { include: { orderItem: true } };
  };
}> & { history?: Array<{ previousStatus: string | null; newStatus: string; actorType: string; actorUserId: bigint | null; reason: string | null; createdAt: Date }> };

type ExchangeRequestWithRelations = Prisma.ExchangeRequestGetPayload<{
  include: {
    order: true;
    user: true;
    items: { include: { orderItem: true; newVariant: true } };
  };
}> & { history?: Array<{ previousStatus: string | null; newStatus: string; actorType: string; actorUserId: bigint | null; reason: string | null; createdAt: Date }> };

@Injectable()
export class AdminReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly orderLifecycleService: OrderLifecycleService,
  ) {}

  async findReturns(query: AdminReturnExchangeQueryDto = {}) {
    const where = this.requestWhere(query, RETURN_REQUEST_STATUSES);
    const requests = await this.prisma.returnRequest.findMany({
      where,
      include: { order: true, user: true, items: { include: { orderItem: true } }, history: { orderBy: { createdAt: 'asc' } } },
      orderBy: this.requestOrderBy(query),
      skip: query.paginate === false ? undefined : ((query.page ?? 1) - 1) * (query.limit ?? 10),
      take: query.paginate === false ? undefined : (query.limit ?? 10),
    });
    const data = requests.map((request) => this.formatReturnRequest(request));
    if (query.paginate === false) return data;
    return { data, meta: { page: query.page ?? 1, limit: query.limit ?? 10, total: await this.prisma.returnRequest.count({ where }) } };
  }

  async findReturn(id: bigint) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true, user: true, items: { include: { orderItem: true } }, history: { orderBy: { createdAt: 'asc' } } },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    return this.formatReturnRequest(request);
  }

  async findExchanges(query: AdminReturnExchangeQueryDto = {}) {
    const where = this.requestWhere(query, EXCHANGE_REQUEST_STATUSES);
    const requests = await this.prisma.exchangeRequest.findMany({
      where,
      include: { order: true, user: true, items: { include: { orderItem: true, newVariant: true } }, history: { orderBy: { createdAt: 'asc' } } },
      orderBy: this.requestOrderBy(query),
      skip: query.paginate === false ? undefined : ((query.page ?? 1) - 1) * (query.limit ?? 10),
      take: query.paginate === false ? undefined : (query.limit ?? 10),
    });
    const data = requests.map((request) => this.formatExchangeRequest(request));
    if (query.paginate === false) return data;
    return { data, meta: { page: query.page ?? 1, limit: query.limit ?? 10, total: await this.prisma.exchangeRequest.count({ where }) } };
  }

  async findExchange(id: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
      include: { order: true, user: true, items: { include: { orderItem: true, newVariant: true } }, history: { orderBy: { createdAt: 'asc' } } },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    return this.formatExchangeRequest(request);
  }

  async approveReturn(id: bigint, adminId?: bigint) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      const request = await tx.returnRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
      if (request.status !== RETURN_REQUEST_STATUSES.requested) throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
      await tx.returnRequest.update({ where: { id }, data: { status: RETURN_REQUEST_STATUSES.approved, approvedAt: new Date() } });
      await this.addHistory(tx, { returnRequestId: id, previousStatus: request.status, newStatus: RETURN_REQUEST_STATUSES.approved, actorUserId: adminId });
    });
    return this.findReturn(id);
  }

  async rejectReturn(id: bigint, dto: AdminRejectRequestDto, adminId?: bigint) {
    const request = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    if (request.status !== RETURN_REQUEST_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
    }
    await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      const current = await tx.returnRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== RETURN_REQUEST_STATUSES.requested) throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
      await tx.returnRequest.update({ where: { id }, data: { status: RETURN_REQUEST_STATUSES.rejected, rejectedAt: new Date(), adminNote: dto.note } });
      await this.addHistory(tx, { returnRequestId: id, previousStatus: current.status, newStatus: RETURN_REQUEST_STATUSES.rejected, actorUserId: adminId, reason: dto.note });
    });
    return this.findReturn(id);
  }

  async receiveReturn(id: bigint, dto: AdminReceiveReturnDto, adminId?: bigint) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true, items: { include: { orderItem: true } } },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    if (request.status !== RETURN_REQUEST_STATUSES.approved) {
      throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
    }

    const inputItems = new Map(dto.items.map((item) => [item.id, item]));
    if (inputItems.size !== request.items.length) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_all_items_required'));
    }

    const itemUpdates = request.items.map((item) => {
      const input = inputItems.get(item.id.toString());
      if (!input) throw new BadRequestException(this.i18n.t('errors.return_exchange_all_items_required'));
      if (input.acceptedQuantity > item.quantity) {
        throw new BadRequestException(this.i18n.t('errors.return_exchange_accepted_quantity_invalid'));
      }

      const calculatedRefundAmount = this.round(Number(item.oldNetUnitPrice) * input.acceptedQuantity);
      const calculatedVatRefundAmount = this.round(
        (Number(item.orderItem.vatShare) / item.orderItem.quantity) * input.acceptedQuantity,
      );
      const adjustedRefundAmount = input.adjustedRefundAmount ?? calculatedRefundAmount;
      const adjustedVatRefundAmount = input.adjustedVatRefundAmount ?? calculatedVatRefundAmount;

      this.assertRefundCeiling(adjustedRefundAmount, calculatedRefundAmount);
      this.assertRefundCeiling(adjustedVatRefundAmount, calculatedVatRefundAmount);
      if (
        (adjustedRefundAmount < calculatedRefundAmount || adjustedVatRefundAmount < calculatedVatRefundAmount) &&
        !input.refundAdjustmentReason
      ) {
        throw new BadRequestException(this.i18n.t('errors.return_refund_adjustment_reason_required'));
      }

      return {
        item,
        input,
        calculatedRefundAmount,
        calculatedVatRefundAmount,
        adjustedRefundAmount,
        adjustedVatRefundAmount,
      };
    });

    const shippingRefundAmount = dto.shippingRefundAmount ?? Number(request.suggestedShippingRefundAmount);
    const otherShippingRefunds = await this.prisma.returnRequest.aggregate({
      where: {
        orderId: request.orderId,
        id: { not: id },
        status: { notIn: [RETURN_REQUEST_STATUSES.rejected, RETURN_REQUEST_STATUSES.cancelledByClient] },
      },
      _sum: { shippingRefundAmount: true },
    });
    const remainingShippingRefund = Math.max(0, Number(request.order.shippingFee) - Number(otherShippingRefunds._sum.shippingRefundAmount ?? 0));
    if (shippingRefundAmount > remainingShippingRefund) {
      throw new BadRequestException(this.i18n.t('errors.return_shipping_refund_too_high'));
    }
    if (shippingRefundAmount !== Number(request.suggestedShippingRefundAmount) && !dto.shippingRefundReason) {
      throw new BadRequestException(this.i18n.t('errors.return_shipping_refund_reason_required'));
    }

    const adjustedRefundAmount = this.round(itemUpdates.reduce((sum, update) => sum + update.adjustedRefundAmount, 0));
    const adjustedVatRefundAmount = this.round(itemUpdates.reduce((sum, update) => sum + update.adjustedVatRefundAmount, 0));
    const calculatedRefundAmount = this.round(itemUpdates.reduce((sum, update) => sum + update.calculatedRefundAmount, 0));
    const calculatedVatRefundAmount = this.round(itemUpdates.reduce((sum, update) => sum + update.calculatedVatRefundAmount, 0));
    const finalRefundAmount = this.round(adjustedRefundAmount + adjustedVatRefundAmount + shippingRefundAmount);
    await this.assertRemainingRefundCapacity(request.orderId, finalRefundAmount);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      const current = await tx.returnRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== RETURN_REQUEST_STATUSES.approved) {
        throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
      }
      for (const update of itemUpdates) {
        if (update.input.disposition === ITEM_DISPOSITIONS.restock && update.item.oldVariantId && update.input.acceptedQuantity > 0) {
          await this.adjustStock(tx, update.item.oldVariantId, update.input.acceptedQuantity, INVENTORY_REASONS.return);
        }
        await tx.returnRequestItem.update({
          where: { id: update.item.id },
          data: {
            acceptedQuantity: update.input.acceptedQuantity,
            itemDisposition: update.input.disposition,
            adminNote: update.input.note,
            calculatedRefundAmount: update.calculatedRefundAmount,
            calculatedVatRefundAmount: update.calculatedVatRefundAmount,
            adjustedRefundAmount: update.adjustedRefundAmount,
            adjustedVatRefundAmount: update.adjustedVatRefundAmount,
            refundAdjustmentReason: update.input.refundAdjustmentReason,
          },
        });
      }

      const result = await tx.returnRequest.update({
        where: { id },
        data: {
          status: RETURN_REQUEST_STATUSES.itemReceived,
          itemReceivedAt: new Date(),
          refundStatus: finalRefundAmount > 0 ? REFUND_STATUSES.requiresRefund : REFUND_STATUSES.waived,
          calculatedRefundAmount,
          calculatedVatRefundAmount,
          adjustedRefundAmount,
          adjustedVatRefundAmount,
          shippingRefundAmount,
          finalRefundAmount,
          refundAdjustmentReason: itemUpdates
            .map((update) => update.input.refundAdjustmentReason)
            .filter(Boolean)
            .join('; ') || null,
          shippingRefundReason: dto.shippingRefundReason,
          adminNote: dto.note,
        },
        include: { order: true, user: true, items: { include: { orderItem: true } } },
      });
      await this.addHistory(tx, { returnRequestId: id, previousStatus: current.status, newStatus: RETURN_REQUEST_STATUSES.itemReceived, actorUserId: adminId, reason: dto.note });
      return result;
    });

    return this.formatReturnRequest(updated);
  }

  async refundReturn(id: bigint, dto: AdminReturnRefundDto, adminId?: bigint) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: { order: { include: { payments: true } }, items: true, payments: true },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    if (
      request.status !== RETURN_REQUEST_STATUSES.itemReceived ||
      ![REFUND_STATUSES.requiresRefund, REFUND_STATUSES.requiresReview].includes(request.refundStatus as never)
    ) {
      throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
    }

    const refundAmount = Number(request.finalRefundAmount);
    if (refundAmount <= 0) {
      const updated = await this.prisma.returnRequest.update({
        where: { id },
        data: {
          status: RETURN_REQUEST_STATUSES.refunded,
          refundStatus: REFUND_STATUSES.waived,
          refundedAt: new Date(),
          adminNote: dto.note,
        },
        include: { order: true, user: true, items: { include: { orderItem: true } } },
      });
      return this.formatReturnRequest(updated);
    }

    const completedPayment = request.order.payments.find((payment) => payment.paymentStatus === PAYMENT_STATUSES.completed);
    const isOnlinePayment = (ONLINE_PAYMENT_METHODS as readonly string[]).includes(request.order.paymentMethod);
    if (isOnlinePayment && !completedPayment?.transactionRef) {
      throw new BadRequestException(this.i18n.t('errors.order_completed_payment_not_found'));
    }

    const attempt = await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      const current = await tx.returnRequest.findUniqueOrThrow({ where: { id }, include: { payments: true } });
      if (
        current.status !== RETURN_REQUEST_STATUSES.itemReceived ||
        ![REFUND_STATUSES.requiresRefund, REFUND_STATUSES.requiresReview].includes(current.refundStatus as never)
      ) {
        throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
      }
      await this.orderLifecycleService.assertRemainingRefundCapacityTx(tx, request.orderId, refundAmount);
      const existing = current.payments.find((payment) =>
        payment.refundSource === REFUND_SOURCES.return &&
        [PAYMENT_STATUSES.processingPayment, PAYMENT_STATUSES.requiresReview].includes(payment.paymentStatus as never),
      );
      const idempotencyKey = existing?.idempotencyKey ?? `return_refund_${id.toString()}`;
      const payment = existing
        ? await tx.paymentTransaction.update({
            where: { id: existing.id },
            data: { paymentStatus: PAYMENT_STATUSES.processingPayment, requestedById: adminId },
          })
        : await tx.paymentTransaction.create({
            data: {
              orderId: request.orderId,
              returnRequestId: id,
              amount: refundAmount,
              paymentMethod: request.order.paymentMethod,
              paymentStatus: PAYMENT_STATUSES.processingPayment,
              transactionRef: `return_refund_${id.toString()}`,
              currency: completedPayment?.currency || PAYMENT_CURRENCIES.sar,
              refundSource: REFUND_SOURCES.return,
              refundReason: dto.note,
              idempotencyKey,
              requestedById: adminId,
            },
          });
      await tx.returnRequest.update({ where: { id }, data: { refundStatus: REFUND_STATUSES.processing } });
      return payment;
    });

    let gatewayResponse: unknown = { manual: true };
    if (isOnlinePayment) {
      try {
        const result = await this.paymentService.refundPayment(
          request.order.paymentMethod,
          completedPayment!.transactionRef!,
          refundAmount,
          { idempotencyKey: attempt.idempotencyKey! },
        );
        if (result.status !== PAYMENT_STATUSES.refunded) throw new Error('REFUND_NOT_CONFIRMED');
        gatewayResponse = result.gatewayResponse;
      } catch (error) {
        await this.markReturnRefundReview(id, attempt.id, error);
        throw new BadRequestException(this.i18n.t('errors.payment_refund_failed'));
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      await tx.paymentTransaction.update({
        where: { id: attempt.id },
        data: { paymentStatus: PAYMENT_STATUSES.refunded, gatewayResponse: gatewayResponse as Prisma.InputJsonValue, paidAt: new Date() },
      });
      await tx.returnRequest.update({
        where: { id },
        data: {
          status: RETURN_REQUEST_STATUSES.refunded,
          refundStatus: isOnlinePayment ? REFUND_STATUSES.refunded : REFUND_STATUSES.manualRefunded,
          refundedAt: new Date(),
          adminNote: dto.note,
        },
      });
      await this.addHistory(tx, { returnRequestId: id, previousStatus: request.status, newStatus: RETURN_REQUEST_STATUSES.refunded, actorUserId: adminId, reason: dto.note });
      await this.orderLifecycleService.syncOrderPaymentStatus(tx, request.orderId);
    });
    return this.findReturn(id);
  }

  async completeReturn(id: bigint, adminId?: bigint) {
    const request = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    if (request.status !== RETURN_REQUEST_STATUSES.refunded && request.refundStatus !== REFUND_STATUSES.waived) {
      throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
    }
    await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      const current = await tx.returnRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== RETURN_REQUEST_STATUSES.refunded && current.refundStatus !== REFUND_STATUSES.waived) {
        throw new BadRequestException(this.i18n.t('errors.return_request_invalid_transition'));
      }
      await tx.returnRequest.update({ where: { id }, data: { status: RETURN_REQUEST_STATUSES.completed, completedAt: new Date() } });
      await this.addHistory(tx, { returnRequestId: id, previousStatus: current.status, newStatus: RETURN_REQUEST_STATUSES.completed, actorUserId: adminId });
    });
    return this.findReturn(id);
  }

  async approveExchange(id: bigint, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.status !== EXCHANGE_REQUEST_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }

    const requiredByVariant = new Map<bigint, number>();
    for (const item of request.items) {
      requiredByVariant.set(item.newVariantId, (requiredByVariant.get(item.newVariantId) ?? 0) + item.quantity);
    }
    const availableVariants = await this.prisma.productVariant.findMany({
      where: { id: { in: [...requiredByVariant.keys()] }, isActive: true },
      select: { id: true, stockQuantity: true },
    });
    const available = new Map(availableVariants.map((variant) => [variant.id.toString(), variant.stockQuantity]));
    if ([...requiredByVariant].some(([variantId, quantity]) => (available.get(variantId.toString()) ?? 0) < quantity)) {
      await this.prisma.$transaction(async (tx) => {
        await this.lockExchange(tx, id);
        const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
        if (current.status !== EXCHANGE_REQUEST_STATUSES.requested) throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
        await tx.exchangeRequest.update({ where: { id }, data: { status: EXCHANGE_REQUEST_STATUSES.requiresReview } });
        await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.requiresReview, actorUserId: adminId });
      });
      return this.findExchange(id);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== EXCHANGE_REQUEST_STATUSES.requested) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      for (const [variantId, quantity] of requiredByVariant.entries()) {
        const reserved = await tx.productVariant.updateMany({
          where: { id: variantId, isActive: true, stockQuantity: { gte: quantity } },
          data: { stockQuantity: { decrement: quantity } },
        });
        if (reserved.count !== 1) {
          throw new BadRequestException(this.i18n.t('errors.insufficient_stock_units', { args: { available: 0 } }));
        }
        await this.createInventoryLogAfterDelta(tx, variantId, -quantity, INVENTORY_REASONS.reserve);
      }
      const result = await tx.exchangeRequest.update({
        where: { id },
        data: {
          status: EXCHANGE_REQUEST_STATUSES.approved,
          approvedAt: new Date(),
          replacementReservedAt: new Date(),
          replacementExpiresAt: new Date(Date.now() + EXCHANGE_RESERVATION_MINUTES * 60_000),
        },
        include: { order: true, user: true, items: { include: { orderItem: true, newVariant: true } } },
      });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.approved, actorUserId: adminId });
      return result;
    });

    return this.formatExchangeRequest(updated);
  }

  async rejectExchange(id: bigint, dto: AdminRejectRequestDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id }, include: { items: true } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (
      request.status !== EXCHANGE_REQUEST_STATUSES.requested &&
      request.status !== EXCHANGE_REQUEST_STATUSES.approved &&
      request.status !== EXCHANGE_REQUEST_STATUSES.requiresReview
    ) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (![EXCHANGE_REQUEST_STATUSES.requested, EXCHANGE_REQUEST_STATUSES.approved, EXCHANGE_REQUEST_STATUSES.requiresReview].includes(current.status as never)) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      if (ACTIVE_EXCHANGE_STOCK_STATUSES.includes(current.status as never)) {
        for (const item of request.items) {
          await this.adjustStock(tx, item.newVariantId, item.quantity, INVENTORY_REASONS.release);
        }
      }
      const result = await tx.exchangeRequest.update({
        where: { id },
        data: { status: EXCHANGE_REQUEST_STATUSES.rejected, rejectedAt: new Date(), adminNote: dto.note, replacementExpiresAt: null },
        include: { order: true, user: true, items: { include: { orderItem: true, newVariant: true } } },
      });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.rejected, actorUserId: adminId, reason: dto.note });
      return result;
    });
    return this.formatExchangeRequest(updated);
  }

  async receiveExchange(id: bigint, dto: AdminReceiveExchangeDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
      include: { order: true, items: true },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.status !== EXCHANGE_REQUEST_STATUSES.approved) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }
    if (request.replacementExpiresAt && request.replacementExpiresAt < new Date()) {
      await this.releaseExpiredExchangeReservation(id, adminId);
      throw new BadRequestException(this.i18n.t('errors.exchange_reservation_expired'));
    }

    const inputItems = new Map(dto.items.map((item) => [item.id, item]));
    if (inputItems.size !== request.items.length) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_all_items_required'));
    }

    const acceptedValues = request.items.map((item) => {
      const input = inputItems.get(item.id.toString());
      if (!input) throw new BadRequestException(this.i18n.t('errors.return_exchange_all_items_required'));
      if (input.acceptedQuantity > item.quantity) {
        throw new BadRequestException(this.i18n.t('errors.return_exchange_accepted_quantity_invalid'));
      }
      return {
        item,
        input,
        oldValue: this.round(Number(item.oldNetUnitPrice) * input.acceptedQuantity),
        newValue: this.round(Number(item.newUnitPriceSnapshot) * input.acceptedQuantity),
      };
    });
    const totalOldValue = this.round(acceptedValues.reduce((sum, value) => sum + value.oldValue, 0));
    const totalNewValue = this.round(acceptedValues.reduce((sum, value) => sum + value.newValue, 0));
    const totalPriceDifference = this.round(totalNewValue - totalOldValue);
    const replacementShippingFee = dto.replacementShippingFee ?? Number(request.suggestedReplacementShippingFee);
    const settlementAmount = this.round(totalPriceDifference + replacementShippingFee);
    const priceAdjustmentStatus = this.getPriceAdjustmentStatus(settlementAmount);

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== EXCHANGE_REQUEST_STATUSES.approved) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      for (const { item, input, oldValue, newValue } of acceptedValues) {
        if (input.disposition === ITEM_DISPOSITIONS.restock && item.oldVariantId && input.acceptedQuantity > 0) {
          await this.adjustStock(tx, item.oldVariantId, input.acceptedQuantity, INVENTORY_REASONS.return);
        }
        const unusedReservation = item.quantity - input.acceptedQuantity;
        if (unusedReservation > 0) {
          await this.adjustStock(tx, item.newVariantId, unusedReservation, INVENTORY_REASONS.release);
        }
        await tx.exchangeRequestItem.update({
          where: { id: item.id },
          data: {
            acceptedQuantity: input.acceptedQuantity,
            itemDisposition: input.disposition,
            adminNote: input.note,
            oldValue,
            newValue,
            priceDifference: this.round(newValue - oldValue),
          },
        });
      }

      const result = await tx.exchangeRequest.update({
        where: { id },
        data: {
          status: EXCHANGE_REQUEST_STATUSES.itemReceived,
          itemReceivedAt: new Date(),
          replacementShippingFee,
          totalOldValue,
          totalNewValue,
          totalPriceDifference,
          settlementAmount,
          priceAdjustmentStatus,
          shippingFeeReason: dto.shippingFeeReason,
          adminNote: dto.note,
          replacementExpiresAt: null,
        },
        include: { order: true, user: true, items: { include: { orderItem: true, newVariant: true } } },
      });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.itemReceived, actorUserId: adminId, reason: dto.note });
      return result;
    });

    return this.formatExchangeRequest(updated);
  }

  async createExchangePayment(id: bigint, dto: AdminExchangePaymentDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id }, include: { order: true, payments: true } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresPayment) {
      throw new BadRequestException(this.i18n.t('errors.exchange_payment_not_required'));
    }
    if (request.status !== EXCHANGE_REQUEST_STATUSES.itemReceived) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }
    const activePayment = request.payments.find((payment) =>
      !payment.refundSource &&
      [PAYMENT_STATUSES.pending, PAYMENT_STATUSES.awaitingConfirmation, PAYMENT_STATUSES.processingPayment].includes(
        payment.paymentStatus as never,
      ),
    );
    if (activePayment) {
      throw new BadRequestException(this.i18n.t('errors.exchange_payment_already_active'));
    }
    const amount = Number(request.settlementAmount);
    const init = await this.paymentService.initiatePayment(dto.paymentMethod, `exchange_${request.id.toString()}`, amount, {
      metadata: { exchangeRequestId: request.id.toString(), orderId: request.orderId.toString() },
    });
    await this.prisma.paymentTransaction.create({
      data: {
        orderId: request.orderId,
        exchangeRequestId: id,
        amount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: init.status,
        transactionRef: init.transactionRef,
        gatewayResponse: init.gatewayResponse as Prisma.InputJsonValue,
        currency: PAYMENT_CURRENCIES.sar,
        requestedById: adminId,
      },
    });
    return {
      exchangeRequestId: request.id.toString(),
      amount,
      paymentStatus: init.status,
      transactionRef: init.transactionRef,
      redirectUrl: init.redirectUrl,
      clientSecret: init.gatewayResponse?.clientSecret,
    };
  }

  async verifyExchangePayment(id: bigint, dto: AdminVerifyExchangePaymentDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresPayment) {
      throw new BadRequestException(this.i18n.t('errors.exchange_payment_not_required'));
    }
    const payment = await this.prisma.paymentTransaction.findFirst({
      where: {
        exchangeRequestId: id,
        transactionRef: dto.transactionRef,
        refundSource: null,
        amount: request.settlementAmount,
        paymentStatus: { in: [PAYMENT_STATUSES.pending, PAYMENT_STATUSES.awaitingConfirmation, PAYMENT_STATUSES.processingPayment] },
      },
    });
    if (!payment) throw new NotFoundException(this.i18n.t('errors.pending_checkout_transaction_missing'));
    const paymentId = payment.id;
    const verify = await this.paymentService.verifyPayment(payment.paymentMethod, dto.transactionRef, {});
    if (verify.status !== PAYMENT_STATUSES.completed) {
      throw new BadRequestException(this.i18n.t('errors.exchange_payment_not_completed'));
    }
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const claimed = await tx.exchangeRequest.updateMany({
        where: { id, priceAdjustmentStatus: PRICE_ADJUSTMENT_STATUSES.requiresPayment },
        data: { priceAdjustmentStatus: PRICE_ADJUSTMENT_STATUSES.paid },
      });
      if (claimed.count !== 1) throw new BadRequestException(this.i18n.t('errors.exchange_payment_not_required'));
      await tx.paymentTransaction.update({
        where: { id: paymentId },
        data: {
          paymentStatus: PAYMENT_STATUSES.completed,
          paidAt: new Date(),
          gatewayResponse: verify.gatewayResponse as Prisma.InputJsonValue,
          requestedById: adminId,
        },
      });
    });
    return this.findExchange(id);
  }

  async retryExchangeReservation(id: bigint, adminId?: bigint) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const request = await tx.exchangeRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
      if (request.status !== EXCHANGE_REQUEST_STATUSES.requiresReview) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      await tx.exchangeRequest.update({ where: { id }, data: { status: EXCHANGE_REQUEST_STATUSES.requested } });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: request.status, newStatus: EXCHANGE_REQUEST_STATUSES.requested, actorUserId: adminId });
    });
    return this.approveExchange(id, adminId);
  }

  async releaseExpiredExchangeReservations(adminId?: bigint) {
    const expired = await this.prisma.exchangeRequest.findMany({
      where: {
        status: EXCHANGE_REQUEST_STATUSES.approved,
        replacementExpiresAt: { lt: new Date() },
      },
      select: { id: true },
    });
    for (const request of expired) {
      await this.releaseExpiredExchangeReservation(request.id, adminId);
    }
    return { released: expired.length };
  }

  async refundExchangeDifference(id: bigint, dto: AdminReturnRefundDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
      include: { order: { include: { payments: true } }, payments: true },
    });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (
      request.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresRefund &&
      !request.payments.some((payment) => payment.paymentStatus === PAYMENT_STATUSES.requiresReview)
    ) {
      throw new BadRequestException(this.i18n.t('errors.exchange_refund_not_required'));
    }
    const amount = Math.abs(Number(request.settlementAmount));
    const completedPayment = request.order.payments.find((payment) => payment.paymentStatus === PAYMENT_STATUSES.completed);
    const isOnlinePayment = (ONLINE_PAYMENT_METHODS as readonly string[]).includes(request.order.paymentMethod);
    if (isOnlinePayment && !completedPayment?.transactionRef) {
      throw new BadRequestException(this.i18n.t('errors.order_completed_payment_not_found'));
    }

    const attempt = await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id }, include: { payments: true } });
      const existing = current.payments.find((payment) =>
        payment.refundSource === REFUND_SOURCES.exchange &&
        [PAYMENT_STATUSES.processingPayment, PAYMENT_STATUSES.requiresReview].includes(payment.paymentStatus as never),
      );
      if (current.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresRefund && !existing) {
        throw new BadRequestException(this.i18n.t('errors.exchange_refund_not_required'));
      }
      await this.orderLifecycleService.assertRemainingRefundCapacityTx(tx, request.orderId, amount);
      const idempotencyKey = existing?.idempotencyKey ?? `exchange_refund_${id.toString()}`;
      return existing
        ? tx.paymentTransaction.update({
            where: { id: existing.id },
            data: { paymentStatus: PAYMENT_STATUSES.processingPayment, requestedById: adminId },
          })
        : tx.paymentTransaction.create({
            data: {
              orderId: request.orderId,
              exchangeRequestId: id,
              amount,
              paymentMethod: request.order.paymentMethod,
              paymentStatus: PAYMENT_STATUSES.processingPayment,
              transactionRef: `exchange_refund_${id.toString()}`,
              currency: completedPayment?.currency || PAYMENT_CURRENCIES.sar,
              refundSource: REFUND_SOURCES.exchange,
              refundReason: dto.note,
              idempotencyKey,
              requestedById: adminId,
            },
          });
    });

    let gatewayResponse: unknown = { manual: true };
    if (isOnlinePayment) {
      try {
        const result = await this.paymentService.refundPayment(
          request.order.paymentMethod,
          completedPayment!.transactionRef!,
          amount,
          { idempotencyKey: attempt.idempotencyKey! },
        );
        if (result.status !== PAYMENT_STATUSES.refunded) throw new Error('REFUND_NOT_CONFIRMED');
        gatewayResponse = result.gatewayResponse;
      } catch (error) {
        await this.markExchangeRefundReview(id, attempt.id, error);
        throw new BadRequestException(this.i18n.t('errors.payment_refund_failed'));
      }
    }
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      await tx.paymentTransaction.update({
        where: { id: attempt.id },
        data: { paymentStatus: PAYMENT_STATUSES.refunded, gatewayResponse: gatewayResponse as Prisma.InputJsonValue, paidAt: new Date() },
      });
      await tx.exchangeRequest.update({
        where: { id },
        data: { priceAdjustmentStatus: PRICE_ADJUSTMENT_STATUSES.refunded, adminNote: dto.note },
      });
      await this.orderLifecycleService.syncOrderPaymentStatus(tx, request.orderId);
    });
    return this.findExchange(id);
  }

  async shipExchange(id: bigint, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.status !== EXCHANGE_REQUEST_STATUSES.itemReceived) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }
    if (!SETTLED_PRICE_STATUSES.includes(request.priceAdjustmentStatus)) {
      throw new BadRequestException(this.i18n.t('errors.exchange_price_not_settled'));
    }
    if (request.replacementExpiresAt && request.replacementExpiresAt < new Date()) {
      await this.releaseExpiredExchangeReservation(id, adminId);
      throw new BadRequestException(this.i18n.t('errors.exchange_reservation_expired'));
    }
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== EXCHANGE_REQUEST_STATUSES.itemReceived || !SETTLED_PRICE_STATUSES.includes(current.priceAdjustmentStatus)) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      await tx.exchangeRequest.update({ where: { id }, data: { status: EXCHANGE_REQUEST_STATUSES.replacementShipped, replacementShippedAt: new Date() } });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.replacementShipped, actorUserId: adminId });
    });
    return this.findExchange(id);
  }

  async completeExchange(id: bigint, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (request.status !== EXCHANGE_REQUEST_STATUSES.replacementShipped) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
    }
    if (!SETTLED_PRICE_STATUSES.includes(request.priceAdjustmentStatus)) {
      throw new BadRequestException(this.i18n.t('errors.exchange_price_not_settled'));
    }

    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== EXCHANGE_REQUEST_STATUSES.replacementShipped || !SETTLED_PRICE_STATUSES.includes(current.priceAdjustmentStatus)) {
        throw new BadRequestException(this.i18n.t('errors.exchange_request_invalid_transition'));
      }
      await tx.exchangeRequest.update({ where: { id }, data: { status: EXCHANGE_REQUEST_STATUSES.completed, completedAt: new Date() } });
      await this.addHistory(tx, { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.completed, actorUserId: adminId });
    });
    return this.findExchange(id);
  }

  async waiveExchangeAdjustment(id: bigint, dto: AdminRejectRequestDto, adminId?: bigint) {
    const request = await this.prisma.exchangeRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    if (
      request.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresPayment &&
      request.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresRefund
    ) {
      throw new BadRequestException(this.i18n.t('errors.exchange_adjustment_not_required'));
    }

    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const current = await tx.exchangeRequest.findUniqueOrThrow({ where: { id } });
      if (current.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresPayment && current.priceAdjustmentStatus !== PRICE_ADJUSTMENT_STATUSES.requiresRefund) {
        throw new BadRequestException(this.i18n.t('errors.exchange_adjustment_not_required'));
      }
      await tx.exchangeRequest.update({ where: { id }, data: { priceAdjustmentStatus: PRICE_ADJUSTMENT_STATUSES.waived, adminNote: dto.note } });
    });
    return this.findExchange(id);
  }

  private assertRefundCeiling(adjusted: number, calculated: number) {
    if (adjusted < 0 || adjusted > calculated) {
      throw new BadRequestException(this.i18n.t('errors.return_refund_exceeds_calculated'));
    }
  }

  private async assertRemainingRefundCapacity(orderId: bigint, amount: number) {
    await this.orderLifecycleService.assertRemainingRefundCapacity(orderId, amount);
  }

  private getPriceAdjustmentStatus(settlementAmount: number) {
    if (settlementAmount > 0) return PRICE_ADJUSTMENT_STATUSES.requiresPayment;
    if (settlementAmount < 0) return PRICE_ADJUSTMENT_STATUSES.requiresRefund;
    return PRICE_ADJUSTMENT_STATUSES.none;
  }

  private async adjustStock(tx: Prisma.TransactionClient, variantId: bigint, quantity: number, reason: string) {
    await tx.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: { increment: quantity } },
    });
    await this.createInventoryLogAfterDelta(tx, variantId, quantity, reason);
  }

  private async createInventoryLogAfterDelta(tx: Prisma.TransactionClient, variantId: bigint, changeAmount: number, reason: string) {
    const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    await tx.inventoryLog.create({
      data: {
        variantId,
        changeAmount,
        previousStock: variant.stockQuantity - changeAmount,
        newStock: variant.stockQuantity,
        reason,
      },
    });
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }

  private formatReturnRequest(request: ReturnRequestWithRelations) {
    return {
      id: request.id.toString(),
      orderId: request.orderId.toString(),
      userId: request.userId.toString(),
      userName: request.user.name,
      itemCount: request.items.length,
      status: request.status,
      refundStatus: request.refundStatus,
      calculatedRefundAmount: Number(request.calculatedRefundAmount),
      calculatedVatRefundAmount: Number(request.calculatedVatRefundAmount),
      adjustedRefundAmount: Number(request.adjustedRefundAmount),
      adjustedVatRefundAmount: Number(request.adjustedVatRefundAmount),
      maxShippingRefundAmount: Number(request.maxShippingRefundAmount),
      suggestedShippingRefundAmount: Number(request.suggestedShippingRefundAmount),
      shippingRefundAmount: Number(request.shippingRefundAmount),
      finalRefundAmount: Number(request.finalRefundAmount),
      refundAdjustmentReason: request.refundAdjustmentReason,
      shippingRefundReason: request.shippingRefundReason,
      adminNote: request.adminNote,
      clientNote: request.clientNote,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      history: (request.history ?? []).map((entry) => ({
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        actorType: entry.actorType,
        actorUserId: entry.actorUserId?.toString() || null,
        reason: entry.reason,
        createdAt: entry.createdAt,
      })),
      items: request.items.map((item) => ({
        id: item.id.toString(),
        orderItemId: item.orderItemId.toString(),
        oldVariantId: item.oldVariantId?.toString() || null,
        quantity: item.quantity,
        acceptedQuantity: item.acceptedQuantity,
        returnReason: item.returnReason,
        clientNote: item.clientNote,
        adminNote: item.adminNote,
        itemDisposition: item.itemDisposition,
        oldUnitPriceSnapshot: Number(item.oldUnitPriceSnapshot),
        oldNetUnitPrice: Number(item.oldNetUnitPrice),
        calculatedRefundAmount: Number(item.calculatedRefundAmount),
        calculatedVatRefundAmount: Number(item.calculatedVatRefundAmount),
        adjustedRefundAmount: Number(item.adjustedRefundAmount),
        adjustedVatRefundAmount: Number(item.adjustedVatRefundAmount),
        refundAdjustmentReason: item.refundAdjustmentReason,
      })),
    };
  }

  private formatExchangeRequest(request: ExchangeRequestWithRelations) {
    return {
      id: request.id.toString(),
      orderId: request.orderId.toString(),
      userId: request.userId.toString(),
      userName: request.user.name,
      itemCount: request.items.length,
      status: request.status,
      priceAdjustmentStatus: request.priceAdjustmentStatus,
      totalOldValue: Number(request.totalOldValue),
      totalNewValue: Number(request.totalNewValue),
      totalPriceDifference: Number(request.totalPriceDifference),
      suggestedReplacementShippingFee: Number(request.suggestedReplacementShippingFee),
      replacementShippingFee: Number(request.replacementShippingFee),
      settlementAmount: Number(request.settlementAmount),
      shippingFeeReason: request.shippingFeeReason,
      adminNote: request.adminNote,
      clientNote: request.clientNote,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      replacementExpiresAt: request.replacementExpiresAt,
      history: (request.history ?? []).map((entry) => ({
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        actorType: entry.actorType,
        actorUserId: entry.actorUserId?.toString() || null,
        reason: entry.reason,
        createdAt: entry.createdAt,
      })),
      items: request.items.map((item) => ({
        id: item.id.toString(),
        orderItemId: item.orderItemId.toString(),
        oldVariantId: item.oldVariantId?.toString() || null,
        newVariantId: item.newVariantId.toString(),
        quantity: item.quantity,
        acceptedQuantity: item.acceptedQuantity,
        exchangeReason: item.exchangeReason,
        clientNote: item.clientNote,
        adminNote: item.adminNote,
        itemDisposition: item.itemDisposition,
        oldUnitPriceSnapshot: Number(item.oldUnitPriceSnapshot),
        oldNetUnitPrice: Number(item.oldNetUnitPrice),
        newUnitPriceSnapshot: Number(item.newUnitPriceSnapshot),
        oldValue: Number(item.oldValue),
        newValue: Number(item.newValue),
        priceDifference: Number(item.priceDifference),
      })),
    };
  }

  private requestWhere(query: AdminReturnExchangeQueryDto, statuses: Record<string, string>) {
    const filters = query.filters ?? {};
    const status = query.status ?? (typeof filters.status === 'string' ? filters.status : undefined);
    if (status && !Object.values(statuses).includes(status)) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_invalid_status'));
    }
    return {
      ...(status ? { status } : {}),
      ...(typeof filters.order_id === 'string' || typeof filters.order_id === 'number'
        ? { orderId: BigInt(filters.order_id) }
        : {}),
      ...(query.search
        ? { OR: [{ clientNote: { contains: query.search, mode: 'insensitive' as const } }, { adminNote: { contains: query.search, mode: 'insensitive' as const } }] }
        : {}),
    };
  }

  private requestOrderBy(query: AdminReturnExchangeQueryDto) {
    const [field, direction] = Object.entries(query.sort ?? {})[0] ?? ['createdAt', 'desc'];
    const allowed = ['createdAt', 'updatedAt', 'status'];
    return { [allowed.includes(field) ? field : 'createdAt']: direction === 'asc' ? 'asc' : 'desc' } as Record<string, 'asc' | 'desc'>;
  }

  private async lockReturn(tx: Prisma.TransactionClient, id: bigint) {
    await tx.$queryRaw`SELECT id FROM return_requests WHERE id = ${id} FOR UPDATE`;
  }

  private async lockExchange(tx: Prisma.TransactionClient, id: bigint) {
    await tx.$queryRaw`SELECT id FROM exchange_requests WHERE id = ${id} FOR UPDATE`;
  }

  private async addHistory(
    tx: Prisma.TransactionClient,
    input: { returnRequestId?: bigint; exchangeRequestId?: bigint; previousStatus: string; newStatus: string; actorUserId?: bigint; reason?: string },
  ) {
    await tx.returnExchangeStatusHistory.create({
      data: { ...input, actorType: 'admin' },
    });
  }

  private async markReturnRefundReview(id: bigint, attemptId: bigint, error: unknown) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockReturn(tx, id);
      await tx.paymentTransaction.update({
        where: { id: attemptId },
        data: {
          paymentStatus: PAYMENT_STATUSES.requiresReview,
          gatewayResponse: { error: error instanceof Error ? error.message : String(error) },
        },
      });
      await tx.returnRequest.update({ where: { id }, data: { refundStatus: REFUND_STATUSES.requiresReview } });
    });
  }

  private async markExchangeRefundReview(id: bigint, attemptId: bigint, error: unknown) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      await tx.paymentTransaction.update({
        where: { id: attemptId },
        data: {
          paymentStatus: PAYMENT_STATUSES.requiresReview,
          gatewayResponse: { error: error instanceof Error ? error.message : String(error) },
        },
      });
      await tx.exchangeRequest.update({ where: { id }, data: { priceAdjustmentStatus: PRICE_ADJUSTMENT_STATUSES.requiresRefund } });
    });
  }

  private async releaseExpiredExchangeReservation(id: bigint, adminId?: bigint) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockExchange(tx, id);
      const request = await tx.exchangeRequest.findUnique({ where: { id }, include: { items: true } });
      if (
        !request ||
        request.status !== EXCHANGE_REQUEST_STATUSES.approved ||
        !request.replacementExpiresAt ||
        request.replacementExpiresAt >= new Date()
      ) {
        return;
      }
      for (const item of request.items) {
        await this.adjustStock(tx, item.newVariantId, item.quantity, INVENTORY_REASONS.release);
      }
      await tx.exchangeRequest.update({
        where: { id },
        data: { status: EXCHANGE_REQUEST_STATUSES.requiresReview, replacementExpiresAt: null },
      });
      await this.addHistory(tx, {
        exchangeRequestId: id,
        previousStatus: request.status,
        newStatus: EXCHANGE_REQUEST_STATUSES.requiresReview,
        actorUserId: adminId,
        reason: 'reservation_expired',
      });
    });
  }
}
