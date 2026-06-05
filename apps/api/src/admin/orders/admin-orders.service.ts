import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateOrderStatusDto, AdminOrderQueryDto } from './dto/admin-order.dto';
import { AuthUserPayload } from '@/auth/auth.service';
import { MANUAL_PAYMENT_METHODS, ORDER_STATUS_ACTORS, PAYMENT_STATUSES } from '@/shared/payment/payment.constants';
import { Prisma } from '@prisma/client';
import { OrderLifecycleService } from '@/shared/orders/order-lifecycle.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IOrdersRepository, ORDERS_REPOSITORY } from '@/common/interfaces';

const ADMIN_ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
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
    statusHistory: true;
  };
}>;

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly i18n: I18nService<I18nTranslations>,
    @Inject(ORDERS_REPOSITORY) private readonly ordersRepository: IOrdersRepository,
  ) {}

  async findAll(query: AdminOrderQueryDto, langId: string = 'en') {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    const orders = await this.ordersRepository.findAdminOrders(where, langId);

    return orders.map((o) => this.formatOrder(o));
  }

  async findOne(id: bigint, langId: string = 'en') {
    const order = await this.ordersRepository.findAdminOrderById(id, langId);

    if (!order) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }

    return this.formatOrder(order);
  }

  async updateStatus(id: bigint, dto: UpdateOrderStatusDto, adminUser: AuthUserPayload, langId: string = 'en') {
    const order = await this.ordersRepository.findLifecycleOrder(id);

    if (!order) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }
    const newStatus = dto.status.toLowerCase();

    if (order.status === newStatus) {
      return this.findOne(id, langId);
    }

    if (
      order.payments.some(
        (payment) =>
          payment.refundSource === 'cancellation' &&
          (payment.paymentStatus === PAYMENT_STATUSES.processingPayment ||
            payment.paymentStatus === PAYMENT_STATUSES.requiresReview),
      )
    ) {
      throw new BadRequestException(this.i18n.t('errors.order_cancellation_refund_in_progress'));
    }

    this.assertAllowedTransition(order.status, newStatus);

    if (newStatus === 'cancelled') {
      await this.orderLifecycleService.cancelOrder({
        orderId: id,
        allowedStatuses: ['pending', 'processing'],
        actorType: ORDER_STATUS_ACTORS.admin,
        actorUserId: adminUser.id,
        reason: dto.reason,
      });
      return this.findOne(id, langId);
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          ...(newStatus === 'delivered' ? { deliveredAt: order.deliveredAt || new Date() } : {}),
        },
        include: {
          items: {
            include: {
              translations: { where: { langId } },
            },
          },
          payments: true,
          user: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });
      await this.orderLifecycleService.createStatusHistory(tx, {
        orderId: id,
        previousStatus: order.status,
        newStatus,
        actorType: ORDER_STATUS_ACTORS.admin,
        actorUserId: adminUser.id,
        reason: dto.reason,
      });

      return updated;
    });
    return this.findOne(id, langId);
  }

  async confirmPayment(id: bigint, adminUser: AuthUserPayload, langId: string = 'en') {
    const order = await this.ordersRepository.findOrderWithPayments(id);

    if (!order) {
      throw new NotFoundException(this.i18n.t('errors.order_not_found'));
    }
    if (!(MANUAL_PAYMENT_METHODS as readonly string[]).includes(order.paymentMethod)) {
      throw new BadRequestException(this.i18n.t('errors.order_manual_payment_confirmation_only'));
    }

    const pendingPayment = order.payments.find(
      (payment) =>
        !payment.refundSource &&
        (MANUAL_PAYMENT_METHODS as readonly string[]).includes(payment.paymentMethod) &&
        (payment.paymentStatus === PAYMENT_STATUSES.awaitingConfirmation ||
          payment.paymentStatus === PAYMENT_STATUSES.pending),
    );
    if (!pendingPayment) {
      throw new BadRequestException(this.i18n.t('errors.order_pending_payment_confirmation_not_found'));
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
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });

      return this.formatOrder(updatedOrder);
    });
  }

  async retryCancellationRefund(id: bigint, refundId: bigint, adminUser: AuthUserPayload, langId: string = 'en') {
    await this.orderLifecycleService.retryCancellationRefund(id, refundId, adminUser.id);
    return this.findOne(id, langId);
  }

  private assertAllowedTransition(currentStatus: string, nextStatus: string) {
    const allowed = ADMIN_ORDER_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(`Cannot change order status from "${currentStatus}" to "${nextStatus}"`);
    }
  }

  private formatOrder(order: AdminOrderWithRelations) {
    const paymentSummary = this.orderLifecycleService.paymentSummary(order.payments);
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
      deliveredAt: order.deliveredAt,
      cancelReason: order.cancelReason,
      ...paymentSummary,
      statusHistory: order.statusHistory.map((entry) => ({
        id: entry.id.toString(),
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        actorType: entry.actorType,
        actorUserId: entry.actorUserId?.toString() || null,
        reason: entry.reason,
        metadata: entry.metadata,
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
          refundSource: payment.refundSource,
          refundReason: payment.refundReason,
        })) || [],
    };
  }
}
