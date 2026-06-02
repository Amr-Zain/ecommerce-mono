import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CancelOrderDto, OrderQueryDto } from './dto/order.dto';
import { DEFAULT_LANGUAGE, INVENTORY_REASONS } from '@/common/constants/commerce.constants';
import { ORDER_STATUSES, UNCANCELABLE_ORDER_STATUSES } from './order.constants';
import { PAYMENT_STATUSES } from '@/shared/payment/payment.constants';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

@Injectable()
export class ClientOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async findAll(userId: bigint, query: OrderQueryDto, langId: string = DEFAULT_LANGUAGE) {
    const where: any = { userId };
    if (query.status) {
      where.status = query.status;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            translations: { where: { langId } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async findOne(userId: bigint, id: bigint, langId: string = DEFAULT_LANGUAGE) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            translations: { where: { langId } },
          },
        },
        payments: true,
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }

    return this.formatOrder(order);
  }

  async cancel(userId: bigint, id: bigint, dto: CancelOrderDto, langId: string = DEFAULT_LANGUAGE) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }

    if (UNCANCELABLE_ORDER_STATUSES.includes(order.status.toLowerCase() as any)) {
      throw new BadRequestException(
        this.i18n.t('errors.order_cannot_cancel_status', { args: { status: order.status } }),
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: ORDER_STATUSES.cancelled,
          cancelledAt: new Date(),
          cancelReason: dto.reason || this.i18n.t('errors.order_cancelled_by_client'),
        },
        include: {
          items: {
            include: {
              translations: { where: { langId } },
            },
          },
          payments: true,
        },
      });

      // 2. Restore stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (variant) {
            const previousStock = variant.stockQuantity;
            const newStock = previousStock + item.quantity;

            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stockQuantity: newStock },
            });

            // Log adjustment
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
        }
      }

      // 3. Update payment transactions status if pending
      await tx.paymentTransaction.updateMany({
        where: { orderId: id, paymentStatus: PAYMENT_STATUSES.pending },
        data: { paymentStatus: PAYMENT_STATUSES.failed },
      });

      return this.formatOrder(updatedOrder);
    });
  }

  private formatOrder(order: any) {
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
      cancelReason: order.cancelReason,
      items:
        order.items?.map((item: any) => ({
          id: item.id.toString(),
          productId: item.productId?.toString() || null,
          variantId: item.variantId?.toString() || null,
          quantity: item.quantity,
          unitPriceSnapshot: Number(item.unitPriceSnapshot),
          discountValueSnapshot: Number(item.discountValueSnapshot),
          discountTypeSnapshot: item.discountTypeSnapshot,
          productNameSnapshot: item.productNameSnapshot,
          variantInfoSnapshot: item.variantInfoSnapshot,
          imageSnapshot: item.imageSnapshot,
          totalPrice: Number(item.totalPrice),
        })) || [],
      payments:
        order.payments?.map((payment: any) => ({
          id: payment.id.toString(),
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionRef: payment.transactionRef,
          gatewayResponse: payment.gatewayResponse,
          currency: payment.currency,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })) || [],
    };
  }
}
