import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/prisma';
import { PricingService } from '@/core/products/pricing.service';
import { I18nTranslations } from '@/generated/i18n.generated';
import { ORDER_STATUSES } from '@/client/orders/order.constants';
import {
  EXCHANGE_REQUEST_STATUSES,
  ITEM_DISPOSITIONS,
  PRICE_ADJUSTMENT_STATUSES,
  RETURN_EXCHANGE_WINDOW_DAYS,
  RETURN_REQUEST_STATUSES,
} from '@/common/constants/return-exchange.constants';
import {
  CreateExchangeRequestDto,
  CreateExchangeRequestItemDto,
  CreateReturnRequestDto,
  CreateReturnRequestItemDto,
} from './dto/client-return-exchange.dto';

const ACTIVE_RETURN_STATUSES = [
  RETURN_REQUEST_STATUSES.requested,
  RETURN_REQUEST_STATUSES.approved,
  RETURN_REQUEST_STATUSES.itemReceived,
  RETURN_REQUEST_STATUSES.refunded,
  RETURN_REQUEST_STATUSES.completed,
];

const ACTIVE_EXCHANGE_STATUSES = [
  EXCHANGE_REQUEST_STATUSES.requested,
  EXCHANGE_REQUEST_STATUSES.approved,
  EXCHANGE_REQUEST_STATUSES.itemReceived,
  EXCHANGE_REQUEST_STATUSES.replacementShipped,
  EXCHANGE_REQUEST_STATUSES.completed,
  EXCHANGE_REQUEST_STATUSES.requiresReview,
];

type OrderItemForReturnExchange = Prisma.OrderItemGetPayload<{
  include: {
    order: true;
  };
}>;

type ReturnRequestWithItems = Prisma.ReturnRequestGetPayload<{
  include: {
    order: true;
    items: { include: { orderItem: true } };
  };
}>;

type ExchangeRequestWithItems = Prisma.ExchangeRequestGetPayload<{
  include: {
    order: true;
    items: { include: { orderItem: true; newVariant: true } };
  };
}>;

@Injectable()
export class ClientReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findReturns(userId: bigint) {
    const requests = await this.prisma.returnRequest.findMany({
      where: { userId },
      include: { order: true, items: { include: { orderItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((request) => this.formatReturnRequest(request));
  }

  async findExchanges(userId: bigint) {
    const requests = await this.prisma.exchangeRequest.findMany({
      where: { userId },
      include: { order: true, items: { include: { orderItem: true, newVariant: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((request) => this.formatExchangeRequest(request));
  }

  async createReturn(userId: bigint, dto: CreateReturnRequestDto) {
    const orderItems = await this.getEligibleOrderItems(
      userId,
      dto.items.map((item) => BigInt(item.orderItemId)),
    );
    this.assertOneOrder(orderItems);

    const items = await Promise.all(
      dto.items.map(async (item) => {
        const orderItem = this.findOrderItem(orderItems, item.orderItemId);
        await this.assertAvailableQuantity(orderItem, item.quantity);
        const calculatedRefundAmount = this.round(Number(orderItem.netUnitPrice) * item.quantity);
        const calculatedVatRefundAmount = this.round((Number(orderItem.vatShare) / orderItem.quantity) * item.quantity);
        return {
          orderItem,
          item,
          calculatedRefundAmount,
          calculatedVatRefundAmount,
        };
      }),
    );

    const order = orderItems[0].order;
    const calculatedRefundAmount = this.round(items.reduce((sum, item) => sum + item.calculatedRefundAmount, 0));
    const calculatedVatRefundAmount = this.round(items.reduce((sum, item) => sum + item.calculatedVatRefundAmount, 0));
    const suggestedShippingRefundAmount = this.suggestedShippingRefund(dto.items, Number(order.shippingFee));

    const request = await this.prisma.$transaction(async (tx) => {
      await this.lockAndAssertAvailableQuantities(tx, items.map(({ orderItem, item }) => ({ orderItem, quantity: item.quantity })));
      const created = await tx.returnRequest.create({
        data: {
        orderId: order.id,
        userId,
        status: RETURN_REQUEST_STATUSES.requested,
        clientNote: dto.note,
        calculatedRefundAmount,
        calculatedVatRefundAmount,
        adjustedRefundAmount: calculatedRefundAmount,
        adjustedVatRefundAmount: calculatedVatRefundAmount,
        maxShippingRefundAmount: order.shippingFee,
        suggestedShippingRefundAmount,
        shippingRefundAmount: suggestedShippingRefundAmount,
        finalRefundAmount: this.round(calculatedRefundAmount + calculatedVatRefundAmount + suggestedShippingRefundAmount),
        items: {
          create: items.map(({ orderItem, item, calculatedRefundAmount, calculatedVatRefundAmount }) => ({
            orderItemId: orderItem.id,
            oldVariantId: orderItem.variantId,
            quantity: item.quantity,
            acceptedQuantity: 0,
            returnReason: item.reason,
            clientNote: item.note,
            itemDisposition: this.defaultDispositionForReason(item.reason),
            oldUnitPriceSnapshot: orderItem.unitPriceSnapshot,
            oldNetUnitPrice: orderItem.netUnitPrice,
            calculatedRefundAmount,
            calculatedVatRefundAmount,
            adjustedRefundAmount: calculatedRefundAmount,
            adjustedVatRefundAmount: calculatedVatRefundAmount,
          })),
        },
        },
        include: { order: true, items: { include: { orderItem: true } } },
      });
      await tx.returnExchangeStatusHistory.create({
        data: { returnRequestId: created.id, newStatus: RETURN_REQUEST_STATUSES.requested, actorType: 'client', actorUserId: userId },
      });
      return created;
    });

    return this.formatReturnRequest(request);
  }

  async createExchange(userId: bigint, dto: CreateExchangeRequestDto) {
    const orderItems = await this.getEligibleOrderItems(
      userId,
      dto.items.map((item) => BigInt(item.orderItemId)),
    );
    this.assertOneOrder(orderItems);

    const replacementVariants = await this.prisma.productVariant.findMany({
      where: { id: { in: dto.items.map((item) => BigInt(item.newVariantId)) }, isActive: true },
      include: { product: true },
    });

    const items = await Promise.all(
      dto.items.map(async (item) => {
        const orderItem = this.findOrderItem(orderItems, item.orderItemId);
        await this.assertAvailableQuantity(orderItem, item.quantity);

        const replacementVariant = replacementVariants.find((variant) => variant.id === BigInt(item.newVariantId));
        if (!replacementVariant) {
          throw new NotFoundException(this.i18n.t('errors.product_variant_not_found'));
        }
        if (orderItem.productId && replacementVariant.productId !== orderItem.productId) {
          throw new BadRequestException(this.i18n.t('errors.exchange_variant_must_match_product'));
        }
        if (replacementVariant.stockQuantity < item.quantity) {
          throw new BadRequestException(
            this.i18n.t('errors.insufficient_stock_units', { args: { available: replacementVariant.stockQuantity } }),
          );
        }

        const replacementPrice = this.pricingService.computePrice(
          Number(replacementVariant.price),
          {
            type: replacementVariant.discountType,
            value: replacementVariant.discountValue ? Number(replacementVariant.discountValue) : null,
          },
          {
            type: replacementVariant.product.discountType,
            value: replacementVariant.product.discountValue ? Number(replacementVariant.product.discountValue) : null,
          },
        ).price;

        const oldValue = this.round(Number(orderItem.netUnitPrice) * item.quantity);
        const newValue = this.round(replacementPrice * item.quantity);
        const priceDifference = this.round(newValue - oldValue);

        return {
          orderItem,
          replacementVariant,
          item,
          replacementPrice,
          oldValue,
          newValue,
          priceDifference,
        };
      }),
    );

    const totalOldValue = this.round(items.reduce((sum, item) => sum + item.oldValue, 0));
    const totalNewValue = this.round(items.reduce((sum, item) => sum + item.newValue, 0));
    const totalPriceDifference = this.round(totalNewValue - totalOldValue);
    const suggestedReplacementShippingFee = this.suggestedReplacementShipping(dto.items, Number(orderItems[0].order.shippingFee));
    const settlementAmount = this.round(totalPriceDifference + suggestedReplacementShippingFee);
    const priceAdjustmentStatus = this.getPriceAdjustmentStatus(settlementAmount);

    const request = await this.prisma.$transaction(async (tx) => {
      await this.lockAndAssertAvailableQuantities(tx, items.map(({ orderItem, item }) => ({ orderItem, quantity: item.quantity })));
      const created = await tx.exchangeRequest.create({
        data: {
        orderId: orderItems[0].order.id,
        userId,
        status: EXCHANGE_REQUEST_STATUSES.requested,
        priceAdjustmentStatus,
        totalOldValue,
        totalNewValue,
        totalPriceDifference,
        suggestedReplacementShippingFee,
        replacementShippingFee: suggestedReplacementShippingFee,
        settlementAmount,
        clientNote: dto.note,
        items: {
          create: items.map(({ orderItem, replacementVariant, item, replacementPrice, oldValue, newValue, priceDifference }) => ({
            orderItemId: orderItem.id,
            oldVariantId: orderItem.variantId,
            newVariantId: replacementVariant.id,
            quantity: item.quantity,
            acceptedQuantity: 0,
            exchangeReason: item.reason,
            clientNote: item.note,
            itemDisposition: this.defaultDispositionForReason(item.reason),
            oldUnitPriceSnapshot: orderItem.unitPriceSnapshot,
            oldNetUnitPrice: orderItem.netUnitPrice,
            newUnitPriceSnapshot: replacementPrice,
            oldValue,
            newValue,
            priceDifference,
          })),
        },
        },
        include: { order: true, items: { include: { orderItem: true, newVariant: true } } },
      });
      await tx.returnExchangeStatusHistory.create({
        data: { exchangeRequestId: created.id, newStatus: EXCHANGE_REQUEST_STATUSES.requested, actorType: 'client', actorUserId: userId },
      });
      return created;
    });

    return this.formatExchangeRequest(request);
  }

  async cancelReturn(userId: bigint, id: bigint) {
    const request = await this.prisma.returnRequest.findFirst({ where: { id, userId } });
    if (!request) {
      throw new NotFoundException(this.i18n.t('errors.return_request_not_found'));
    }
    if (request.status !== RETURN_REQUEST_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.return_request_cannot_cancel'));
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM return_requests WHERE id = ${id} FOR UPDATE`;
      const current = await tx.returnRequest.findFirst({ where: { id, userId } });
      if (!current || current.status !== RETURN_REQUEST_STATUSES.requested) throw new BadRequestException(this.i18n.t('errors.return_request_cannot_cancel'));
      const result = await tx.returnRequest.update({
        where: { id },
        data: { status: RETURN_REQUEST_STATUSES.cancelledByClient, cancelledAt: new Date() },
        include: { order: true, items: { include: { orderItem: true } } },
      });
      await tx.returnExchangeStatusHistory.create({
        data: { returnRequestId: id, previousStatus: current.status, newStatus: RETURN_REQUEST_STATUSES.cancelledByClient, actorType: 'client', actorUserId: userId },
      });
      return result;
    });
    return this.formatReturnRequest(updated);
  }

  async cancelExchange(userId: bigint, id: bigint) {
    const request = await this.prisma.exchangeRequest.findFirst({ where: { id, userId } });
    if (!request) {
      throw new NotFoundException(this.i18n.t('errors.exchange_request_not_found'));
    }
    if (request.status !== EXCHANGE_REQUEST_STATUSES.requested) {
      throw new BadRequestException(this.i18n.t('errors.exchange_request_cannot_cancel'));
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM exchange_requests WHERE id = ${id} FOR UPDATE`;
      const current = await tx.exchangeRequest.findFirst({ where: { id, userId } });
      if (!current || current.status !== EXCHANGE_REQUEST_STATUSES.requested) throw new BadRequestException(this.i18n.t('errors.exchange_request_cannot_cancel'));
      const result = await tx.exchangeRequest.update({
        where: { id },
        data: { status: EXCHANGE_REQUEST_STATUSES.cancelledByClient, cancelledAt: new Date() },
        include: { order: true, items: { include: { orderItem: true, newVariant: true } } },
      });
      await tx.returnExchangeStatusHistory.create({
        data: { exchangeRequestId: id, previousStatus: current.status, newStatus: EXCHANGE_REQUEST_STATUSES.cancelledByClient, actorType: 'client', actorUserId: userId },
      });
      return result;
    });
    return this.formatExchangeRequest(updated);
  }

  private async getEligibleOrderItems(userId: bigint, orderItemIds: bigint[]) {
    const uniqueIds = [...new Set(orderItemIds.map((id) => id.toString()))].map((id) => BigInt(id));
    if (uniqueIds.length !== orderItemIds.length) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_duplicate_items'));
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: { id: { in: uniqueIds } },
      include: { order: true },
    });

    if (orderItems.length !== uniqueIds.length) {
      throw new NotFoundException(this.i18n.t('errors.order_item_not_found'));
    }

    for (const orderItem of orderItems) {
      if (orderItem.order.userId !== userId) {
        throw new NotFoundException(this.i18n.t('errors.order_item_not_found'));
      }
      if (orderItem.order.status !== ORDER_STATUSES.delivered) {
        throw new BadRequestException(this.i18n.t('errors.return_exchange_order_must_be_delivered'));
      }
      const deliveredAt = orderItem.order.deliveredAt || orderItem.order.updatedAt;
      const expiresAt = new Date(deliveredAt);
      expiresAt.setDate(expiresAt.getDate() + RETURN_EXCHANGE_WINDOW_DAYS);
      if (expiresAt < new Date()) {
        throw new BadRequestException(this.i18n.t('errors.return_exchange_window_expired'));
      }
    }

    return orderItems;
  }

  private assertOneOrder(orderItems: OrderItemForReturnExchange[]) {
    const orderIds = new Set(orderItems.map((item) => item.orderId.toString()));
    if (orderIds.size !== 1) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_same_order_required'));
    }
  }

  private findOrderItem(orderItems: OrderItemForReturnExchange[], orderItemId: string) {
    const orderItem = orderItems.find((item) => item.id === BigInt(orderItemId));
    if (!orderItem) {
      throw new NotFoundException(this.i18n.t('errors.order_item_not_found'));
    }
    return orderItem;
  }

  private async assertAvailableQuantity(orderItem: OrderItemForReturnExchange, requestedQuantity: number) {
    const [returnItems, exchangeItems] = await Promise.all([
      this.prisma.returnRequestItem.findMany({
        where: { orderItemId: orderItem.id, returnRequest: { status: { in: ACTIVE_RETURN_STATUSES } } },
        select: { quantity: true },
      }),
      this.prisma.exchangeRequestItem.findMany({
        where: { orderItemId: orderItem.id, exchangeRequest: { status: { in: ACTIVE_EXCHANGE_STATUSES } } },
        select: { quantity: true },
      }),
    ]);

    const usedQuantity = [...returnItems, ...exchangeItems].reduce((sum, item) => sum + item.quantity, 0);
    if (requestedQuantity > orderItem.quantity - usedQuantity) {
      throw new BadRequestException(this.i18n.t('errors.return_exchange_quantity_unavailable'));
    }
  }

  private async lockAndAssertAvailableQuantities(
    tx: Prisma.TransactionClient,
    items: Array<{ orderItem: OrderItemForReturnExchange; quantity: number }>,
  ) {
    for (const { orderItem, quantity } of items.sort((a, b) => Number(a.orderItem.id - b.orderItem.id))) {
      await tx.$queryRaw`SELECT id FROM order_items WHERE id = ${orderItem.id} FOR UPDATE`;
      const [returns, exchanges] = await Promise.all([
        tx.returnRequestItem.aggregate({
          where: { orderItemId: orderItem.id, returnRequest: { status: { in: ACTIVE_RETURN_STATUSES } } },
          _sum: { quantity: true },
        }),
        tx.exchangeRequestItem.aggregate({
          where: { orderItemId: orderItem.id, exchangeRequest: { status: { in: ACTIVE_EXCHANGE_STATUSES } } },
          _sum: { quantity: true },
        }),
      ]);
      const used = Number(returns._sum.quantity ?? 0) + Number(exchanges._sum.quantity ?? 0);
      if (quantity > orderItem.quantity - used) {
        throw new BadRequestException(this.i18n.t('errors.return_exchange_quantity_unavailable'));
      }
    }
  }

  private getPriceAdjustmentStatus(settlementAmount: number) {
    if (settlementAmount > 0) return PRICE_ADJUSTMENT_STATUSES.requiresPayment;
    if (settlementAmount < 0) return PRICE_ADJUSTMENT_STATUSES.requiresRefund;
    return PRICE_ADJUSTMENT_STATUSES.none;
  }

  private defaultDispositionForReason(reason: string) {
    const normalized = reason.toLowerCase();
    return normalized.includes('damage') || normalized.includes('defect')
      ? ITEM_DISPOSITIONS.quarantine
      : ITEM_DISPOSITIONS.restock;
  }

  private suggestedShippingRefund(items: CreateReturnRequestItemDto[], shippingFee: number) {
    return items.some((item) => this.isStoreFaultReason(item.reason)) ? shippingFee : 0;
  }

  private suggestedReplacementShipping(items: CreateExchangeRequestItemDto[], shippingFee: number) {
    return items.some((item) => this.isStoreFaultReason(item.reason)) ? 0 : shippingFee;
  }

  private isStoreFaultReason(reason: string) {
    const normalized = reason.toLowerCase();
    return normalized.includes('damage') || normalized.includes('defect') || normalized.includes('wrong_item');
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }

  private formatReturnRequest(request: ReturnRequestWithItems) {
    return {
      id: request.id.toString(),
      orderId: request.orderId.toString(),
      userId: request.userId.toString(),
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
      clientNote: request.clientNote,
      adminNote: request.adminNote,
      itemCount: request.items.length,
      requestedAt: request.requestedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
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

  private formatExchangeRequest(request: ExchangeRequestWithItems) {
    return {
      id: request.id.toString(),
      orderId: request.orderId.toString(),
      userId: request.userId.toString(),
      status: request.status,
      priceAdjustmentStatus: request.priceAdjustmentStatus,
      totalOldValue: Number(request.totalOldValue),
      totalNewValue: Number(request.totalNewValue),
      totalPriceDifference: Number(request.totalPriceDifference),
      suggestedReplacementShippingFee: Number(request.suggestedReplacementShippingFee),
      replacementShippingFee: Number(request.replacementShippingFee),
      settlementAmount: Number(request.settlementAmount),
      clientNote: request.clientNote,
      adminNote: request.adminNote,
      itemCount: request.items.length,
      requestedAt: request.requestedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
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
}
