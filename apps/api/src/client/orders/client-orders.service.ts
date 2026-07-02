import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CancelOrderDto, OrderQueryDto } from './dto/order.dto';
import { DEFAULT_LANGUAGE } from '@/common/constants/commerce.constants';
import { ORDER_STATUSES } from './order.constants';
import { ORDER_STATUS_ACTORS } from '@/shared/payment/payment.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { Prisma } from '@prisma/client';
import { OrderLifecycleService } from '@/shared/orders/order-lifecycle.service';
import { IOrdersRepository, ORDERS_REPOSITORY } from '@/common/interfaces';
import { MediaService } from '@/media/media.service';

type ClientOrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        translations: true;
      };
    };
    payments: true;
    statusHistory: true;
  };
}>;

@Injectable()
export class ClientOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly mediaService: MediaService,
    @Inject(ORDERS_REPOSITORY) private readonly ordersRepository: IOrdersRepository,
  ) {}

  async findAll(userId: bigint, query: OrderQueryDto, langId: string = DEFAULT_LANGUAGE) {
    const orders = await this.ordersRepository.findClientOrders(userId, query.status, langId);

    return this.formatOrders(orders);
  }

  async findOne(userId: bigint, id: bigint, langId: string = DEFAULT_LANGUAGE) {
    const order = await this.ordersRepository.findClientOrderById(userId, id, langId);

    if (!order) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }

    return (await this.formatOrders([order]))[0];
  }

  async cancel(userId: bigint, id: bigint, dto: CancelOrderDto, langId: string = DEFAULT_LANGUAGE) {
    const order = await this.ordersRepository.findLifecycleOrder(id);

    if (!order || order.userId !== userId) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }

    if (order.status.toLowerCase() !== ORDER_STATUSES.pending) {
      throw new BadRequestException(
        this.i18n.t('errors.order_cannot_cancel_status', { args: { status: order.status } }),
      );
    }

    await this.orderLifecycleService.cancelOrder({
      orderId: id,
      allowedStatuses: [ORDER_STATUSES.pending],
      actorType: ORDER_STATUS_ACTORS.client,
      actorUserId: userId,
      reason: dto.reason || this.i18n.t('errors.order_cancelled_by_client'),
    });
    return this.findOne(userId, id, langId);
  }

  private async formatOrders(orders: ClientOrderWithRelations[]) {
    const itemsWithProducts = orders.flatMap((order) =>
      order.items
        .filter((item) => item.productId)
        .map((item) => ({
          itemId: item.id.toString(),
          productId: item.productId!,
          variantId: item.variantId,
        })),
    );
    const images = await this.mediaService.findProductImagePaths(itemsWithProducts);
    const imageByItemId = new Map(itemsWithProducts.map((item, index) => [item.itemId, images[index]]));

    return orders.map((order) => this.formatOrder(order, imageByItemId));
  }

  private formatOrder(order: ClientOrderWithRelations, imageByItemId: Map<string, string | null>) {
    const paymentSummary = this.orderLifecycleService.paymentSummary(order.payments);
    return {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      addressId: order.addressId?.toString() || null,
      shippingAddressSnapshot: order.shippingAddressSnapshot,
      countryId: order.countryId?.toString() || null,
      countryNameSnapshot: order.countryNameSnapshot,
      cityNameSnapshot: order.cityNameSnapshot,
      shippingFee: Number(order.shippingFee),
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      loyaltyDiscountAmount: Number(order.loyaltyDiscountAmount),
      loyaltyPointsRedeemed: order.loyaltyPointsRedeemed,
      loyaltyRewardId: order.loyaltyRewardId?.toString() || null,
      loyaltyRewardSnapshot: order.loyaltyRewardSnapshot,
      couponId: order.couponId?.toString() || null,
      couponCodeSnapshot: order.couponCodeSnapshot,
      vatValue: Number(order.vatValue),
      vatType: order.vatType,
      totalPrice: Number(order.totalPrice),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      isActive: order.isActive,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancelledAt: order.cancelledAt,
      deliveredAt: order.deliveredAt,
      cancelReason: order.cancelReason,
      ...paymentSummary,
      statusHistory: order.statusHistory.map((entry) => ({
        newStatus: entry.newStatus,
        createdAt: entry.createdAt,
      })),
      items:
        order.items?.map((item) => ({
          id: item.id.toString(),
          productId: item.productId?.toString() || null,
          variantId: item.variantId?.toString() || null,
          quantity: item.quantity,
          unitPriceSnapshot: Number(item.unitPriceSnapshot),
          discountValueSnapshot: Number(item.discountValueSnapshot),
          discountTypeSnapshot: item.discountTypeSnapshot,
          lineSubtotalSnapshot: Number(item.lineSubtotalSnapshot),
          couponDiscountShare: Number(item.couponDiscountShare),
          netLineTotal: Number(item.netLineTotal),
          netUnitPrice: Number(item.netUnitPrice),
          vatShare: Number(item.vatShare),
          productNameSnapshot: item.productNameSnapshot,
          variantInfoSnapshot: item.variantInfoSnapshot,
          imageSnapshot: item.imageSnapshot || imageByItemId.get(item.id.toString()) || null,
          totalPrice: Number(item.totalPrice),
        })) || [],
      payments:
        order.payments?.map((payment) => ({
          id: payment.id.toString(),
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionRef: payment.transactionRef,
          gatewayResponse: payment.gatewayResponse,
          currency: payment.currency,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          refundSource: payment.refundSource,
          refundReason: payment.refundReason,
        })) || [],
    };
  }
}
