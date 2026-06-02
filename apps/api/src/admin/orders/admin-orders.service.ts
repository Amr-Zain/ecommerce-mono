import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateOrderStatusDto, OrderRefundDto, AdminOrderQueryDto } from './dto/admin-order.dto';
import { PaymentService } from '@/shared/payment/payment.service';
import { AuthUserPayload } from '@/auth/auth.service';
import { INVENTORY_REASONS } from '@/common/constants/commerce.constants';
import { PAYMENT_CURRENCIES, PAYMENT_STATUSES } from '@/shared/payment/payment.constants';
import { Prisma } from '@prisma/client';

const ADMIN_ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

type AdminOrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        translations: true;
      };
    };
    payments: true;
    user: true;
  };
}>;

type RefundableOrder = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payments: true;
  };
}>;

type RestorableOrderItem = {
  variantId: bigint | null;
  quantity: number;
};

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async findAll(query: AdminOrderQueryDto, langId: string = 'en') {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            translations: { where: { langId } },
          },
        },
        payments: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.formatOrder(o));
  }

  async findOne(id: bigint, langId: string = 'en') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            translations: { where: { langId } },
          },
        },
        payments: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrder(order);
  }

  async updateStatus(id: bigint, dto: UpdateOrderStatusDto, adminUser: AuthUserPayload, langId: string = 'en') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const newStatus = dto.status.toLowerCase();

    if (order.status === newStatus) {
      return this.findOne(id, langId);
    }

    this.assertAllowedTransition(order.status, newStatus);

    if (newStatus === 'cancelled' && order.paymentStatus === PAYMENT_STATUSES.completed) {
      return this.refundPaidOrder(order, adminUser, langId, 'cancelled', 'Cancelled by admin with refund');
    }

    if (newStatus === 'refunded') {
      return this.refundPaidOrder(order, adminUser, langId, 'refunded', 'Refunded by admin');
    }

    return this.prisma.$transaction(async (tx) => {
      // If status is transitioning to cancelled, restore stock
      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        await this.restoreOrderStock(tx, order.items);

        // Fail pending transactions
        await tx.paymentTransaction.updateMany({
          where: {
            orderId: id,
            paymentStatus: { in: [PAYMENT_STATUSES.pending, PAYMENT_STATUSES.awaitingConfirmation] },
          },
          data: { paymentStatus: PAYMENT_STATUSES.failed },
        });
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          ...(newStatus === 'cancelled' ? { cancelledAt: new Date(), cancelReason: 'Cancelled by admin' } : {}),
        },
        include: {
          items: {
            include: {
              translations: { where: { langId } },
            },
          },
          payments: true,
          user: true,
        },
      });

      return this.formatOrder(updated);
    });
  }

  async confirmPayment(id: bigint, adminUser: AuthUserPayload, langId: string = 'en') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const pendingPayment = order.payments.find(
      (p) => p.paymentStatus === PAYMENT_STATUSES.awaitingConfirmation || p.paymentStatus === PAYMENT_STATUSES.pending,
    );
    if (!pendingPayment) {
      throw new BadRequestException('No pending payment found that requires confirmation');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update PaymentTransaction
      await tx.paymentTransaction.update({
        where: { id: pendingPayment.id },
        data: {
          paymentStatus: PAYMENT_STATUSES.completed,
          paidAt: new Date(),
          gatewayResponse: {
            verifiedBy: 'admin',
            verifiedAt: new Date().toISOString(),
            adminId: adminUser?.id ? adminUser.id.toString() : null,
          },
        },
      });

      // 2. Update Order payment status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: PAYMENT_STATUSES.completed,
        },
        include: {
          items: {
            include: {
              translations: { where: { langId } },
            },
          },
          payments: true,
          user: true,
        },
      });

      return this.formatOrder(updatedOrder);
    });
  }

  async refund(id: bigint, dto: OrderRefundDto, adminUser: AuthUserPayload, langId: string = 'en') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { payments: true, items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'refunded') {
      throw new BadRequestException('Order is already refunded');
    }

    const completedPayment = order.payments.find((p) => p.paymentStatus === PAYMENT_STATUSES.completed);
    if (!completedPayment) {
      throw new BadRequestException('Cannot refund an order without a completed payment');
    }

    return this.refundPaidOrder(order, adminUser, langId, 'refunded', dto.reason || 'Refunded by admin');
  }

  private assertAllowedTransition(currentStatus: string, nextStatus: string) {
    const allowed = ADMIN_ORDER_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(`Cannot change order status from "${currentStatus}" to "${nextStatus}"`);
    }
  }

  private async refundPaidOrder(
    order: RefundableOrder,
    adminUser: AuthUserPayload,
    langId: string,
    targetStatus: 'cancelled' | 'refunded',
    reason: string,
  ) {
    const completedPayment = order.payments.find((payment) => payment.paymentStatus === PAYMENT_STATUSES.completed);
    if (!completedPayment) {
      throw new BadRequestException('Cannot refund an order without a completed payment');
    }

    const refundResult = await this.paymentService.refundPayment(
      order.paymentMethod,
      completedPayment.transactionRef || '',
      Number(completedPayment.amount),
    );

    if (refundResult.status !== PAYMENT_STATUSES.refunded) {
      throw new BadRequestException('Payment refund failed');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: completedPayment.amount,
          paymentMethod: order.paymentMethod,
          paymentStatus: refundResult.status,
          transactionRef: completedPayment.transactionRef ? `ref_${completedPayment.transactionRef}` : 'refund',
          gatewayResponse: {
            ...refundResult.gatewayResponse,
            verifiedBy: 'admin',
            adminId: adminUser?.id ? adminUser.id.toString() : null,
          },
          currency: PAYMENT_CURRENCIES.sar,
          paidAt: new Date(),
        },
      });

      await this.restoreOrderStock(tx, order.items);

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          paymentStatus: PAYMENT_STATUSES.refunded,
          cancelReason: reason,
          cancelledAt: new Date(),
        },
        include: {
          items: {
            include: {
              translations: { where: { langId } },
            },
          },
          payments: true,
          user: true,
        },
      });

      return this.formatOrder(updatedOrder);
    });
  }

  private async restoreOrderStock(tx: Prisma.TransactionClient, items: RestorableOrderItem[]) {
    for (const item of items) {
      if (!item.variantId) {
        continue;
      }

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant) {
        continue;
      }

      const previousStock = variant.stockQuantity;
      const newStock = previousStock + item.quantity;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stockQuantity: newStock },
      });
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

  private formatOrder(order: AdminOrderWithRelations) {
    return {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId.toString(),
      userName: order.user?.name || 'Guest',
      userEmail: order.user?.email || null,
      userPhone: order.user?.phone || null,
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
        order.items?.map((item) => ({
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
        })) || [],
    };
  }
}
