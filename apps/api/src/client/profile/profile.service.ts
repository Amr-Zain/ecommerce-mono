import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY, IUsersRepository } from '@/common/interfaces';
import { PrismaService } from '@/prisma/prisma.service';
import { MediaService } from '@/media/media.service';
import { UpdateProfileDto, UpdateProfileImageDto } from './dto/profile.dto';
import { RefreshTokensRepository } from '@/auth/repositories/refresh-tokens.repository';
import { PaymentTransaction, Prisma } from '@prisma/client';

type PaymentSessionQuery = {
  page?: string | number;
  limit?: string | number;
  type?: string;
  status?: string;
  product_id?: string | number;
  productId?: string | number;
};

type ClientPaymentRecord = PaymentTransaction & {
  order: Prisma.OrderGetPayload<{ include: { items: true } }>;
};

@Injectable()
export class ProfileService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepo: IUsersRepository,
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async getProfile(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        userType: true,
        addresses: true,
        loyaltyAccount: {
          include: {
            currentTier: {
              include: { translations: true },
            },
          },
        },
      },
    });
    const userWithMedia = user ? await this.usersRepo.findById(userId) : null;
    if (!userWithMedia) throw new NotFoundException('User not found');
    const { password: _, ...result } = userWithMedia as unknown as Record<string, unknown>;
    const tier = user?.loyaltyAccount?.currentTier
      ? {
          id: user.loyaltyAccount.currentTier.id.toString(),
          name:
            user.loyaltyAccount.currentTier.translations.find((translation) => translation.langId === 'en')?.name ||
            user.loyaltyAccount.currentTier.translations[0]?.name ||
            '',
          multiplier: Number(user.loyaltyAccount.currentTier.multiplier),
          minLifetimePoints: user.loyaltyAccount.currentTier.minLifetimePoints,
          color: user.loyaltyAccount.currentTier.color,
        }
      : null;
    return {
      ...result,
      ...user,
      loyaltyAccount: undefined,
      tier,
      loyalty: {
        availablePoints: user?.loyaltyAccount?.availablePoints ?? 0,
        pendingPoints: user?.loyaltyAccount?.pendingPoints ?? 0,
        lifetimePoints: user?.loyaltyAccount?.lifetimePoints ?? 0,
        tier,
      },
    };
  }

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.phoneCode !== undefined) data.phoneCode = dto.phoneCode;

    await this.usersRepo.updateUser(userId, data);
    return this.getProfile(userId);
  }

  async updateImage(userId: bigint, dto: UpdateProfileImageDto) {
    if (dto.image) {
      await this.mediaService.deleteByEntity('user', userId, 'avatar');
      await this.mediaService.attachTempMedia({
        model: 'user',
        attachHash: dto.image,
        modelId: userId.toString(),
      });
    }
    return this.getProfile(userId);
  }

  async listPaymentSessions(userId: bigint, query: PaymentSessionQuery = {}) {
    const page = this.positiveInt(query.page, 1);
    const limit = Math.min(this.positiveInt(query.limit, 12), 50);
    const productId = this.optionalBigInt(query.product_id ?? query.productId);
    const links = await this.paymentSessionUserLinks(userId, productId);
    const type = typeof query.type === 'string' ? query.type : 'all';
    const status = typeof query.status === 'string' && query.status ? query.status : undefined;
    const ownershipWhere = this.paymentSessionOwnershipWhere(links, type);
    const sessionWhere: Prisma.PaymentSessionWhereInput | null = ownershipWhere.length
      ? {
          OR: ownershipWhere,
          status,
        }
      : null;

    const [sessions, paymentOrders] = await Promise.all([
      sessionWhere
        ? this.prisma.paymentSession.findMany({
            where: sessionWhere,
            include: { gateway: true },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
      this.prisma.order.findMany({
        where: {
          userId,
          ...(productId ? { items: { some: { productId } } } : {}),
        },
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const payments = paymentOrders.flatMap((order) =>
      order.payments
        .filter((payment) => this.paymentRecordMatches(payment, type, status))
        .map((payment) => ({ ...payment, order })),
    );

    const orderIds = this.uniqueBigInts(sessions.map((session) => session.orderId));
    const orders = orderIds.length
      ? await this.prisma.order.findMany({
          where: { id: { in: orderIds }, userId },
          include: { items: true },
        })
      : [];
    const ordersMap = new Map(orders.map((order) => [order.id.toString(), order]));
    const sessionRefs = new Set(sessions.map((session) => session.transactionRef).filter(Boolean));
    const data = [
      ...sessions.map((session) => this.formatClientPaymentSession(session, ordersMap)),
      ...payments
        .filter((payment) => !payment.transactionRef || !sessionRefs.has(payment.transactionRef))
        .map((payment) => this.formatClientPayment(payment)),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const start = (page - 1) * limit;

    return {
      data: data.slice(start, start + limit),
      meta: { page, limit, total: data.length },
    };
  }

  async getPaymentSession(userId: bigint, id: string) {
    const transactionId = this.transactionActivityId(id);
    if (transactionId) return this.getPaymentTransaction(userId, transactionId);

    const links = await this.paymentSessionUserLinks(userId);
    const ownershipWhere = this.paymentSessionOwnershipWhere(links, 'all');
    const session = ownershipWhere.length
      ? await this.prisma.paymentSession.findFirst({
          where: { id: BigInt(id), OR: ownershipWhere },
          include: { gateway: true },
        })
      : null;

    if (!session) throw new NotFoundException('Payment session not found');

    const orderIds = this.uniqueBigInts([session.orderId]);
    const orders = orderIds.length
      ? await this.prisma.order.findMany({
          where: { id: { in: orderIds }, userId },
          include: { items: true },
        })
      : [];

    return {
      data: this.formatClientPaymentSession(session, new Map(orders.map((order) => [order.id.toString(), order]))),
    };
  }

  private async getPaymentTransaction(userId: bigint, id: bigint) {
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { id, order: { userId } },
      include: { order: { include: { items: true } } },
    });

    if (!transaction) throw new NotFoundException('Payment session not found');

    return { data: this.formatClientPaymentTransaction(transaction) };
  }

  async listSessions(userId: bigint) {
    const sessions = await this.refreshTokensRepository.getUserSessions(userId);
    return {
      data: sessions.map((session) => ({
        id: session.id.toString(),
        device_info: session.deviceInfo,
        ip_address: session.ipAddress,
        created_at: session.createdAt,
        expires_at: session.expiresAt,
      })),
    };
  }

  async revokeSession(userId: bigint, sessionId: bigint) {
    const revoked = await this.refreshTokensRepository.revokeSession(userId, sessionId);
    if (!revoked) throw new NotFoundException('Active session not found');
    return { message: 'Session revoked successfully' };
  }

  private async paymentSessionUserLinks(userId: bigint, productId?: bigint) {
    const productFilter = productId ? { productId } : undefined;
    const [orders, pendingCheckouts, walletTransactions, returnRequests, exchangeRequests] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          userId,
          ...(productFilter ? { items: { some: productFilter } } : {}),
        },
        select: { id: true },
      }),
      productFilter
        ? Promise.resolve([])
        : this.prisma.pendingCheckout.findMany({ where: { userId }, select: { id: true } }),
      productFilter
        ? Promise.resolve([])
        : this.prisma.walletTransaction.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.returnRequest.findMany({
        where: {
          userId,
          ...(productFilter ? { items: { some: { orderItem: productFilter } } } : {}),
        },
        select: { id: true },
      }),
      this.prisma.exchangeRequest.findMany({
        where: {
          userId,
          ...(productFilter ? { items: { some: { orderItem: productFilter } } } : {}),
        },
        select: { id: true },
      }),
    ]);

    return {
      orderIds: orders.map((item) => item.id),
      pendingCheckoutIds: pendingCheckouts.map((item) => item.id),
      walletTransactionIds: walletTransactions.map((item) => item.id),
      returnRequestIds: returnRequests.map((item) => item.id),
      exchangeRequestIds: exchangeRequests.map((item) => item.id),
    };
  }

  private paymentSessionOwnershipWhere(
    links: Awaited<ReturnType<ProfileService['paymentSessionUserLinks']>>,
    type: string,
  ): Prisma.PaymentSessionWhereInput[] {
    const all: Prisma.PaymentSessionWhereInput[] = [];
    const push = (kind: string, condition: Prisma.PaymentSessionWhereInput) => {
      if (type === 'all' || type === kind) all.push(condition);
    };

    if (links.orderIds.length) push('orders', { orderId: { in: links.orderIds } });
    if (links.pendingCheckoutIds.length) push('pending', { pendingCheckoutId: { in: links.pendingCheckoutIds } });
    if (links.walletTransactionIds.length) push('wallet', { walletTransactionId: { in: links.walletTransactionIds } });
    if (links.returnRequestIds.length) push('returns', { returnRequestId: { in: links.returnRequestIds } });
    if (links.exchangeRequestIds.length) push('exchanges', { exchangeRequestId: { in: links.exchangeRequestIds } });

    return all;
  }

  private formatClientPaymentSession(
    session: Prisma.PaymentSessionGetPayload<{ include: { gateway: true } }>,
    ordersMap: Map<string, Prisma.OrderGetPayload<{ include: { items: true } }>>,
  ) {
    const order = session.orderId ? ordersMap.get(session.orderId.toString()) : null;
    return {
      id: session.id.toString(),
      type: this.paymentSessionType(session),
      status: session.status,
      amount: Number(session.amount),
      currency: session.currency,
      payment_method: session.paymentMethod,
      provider_identifier: session.providerIdentifier,
      provider_name: session.gateway?.name ?? session.providerIdentifier,
      provider_logo_url: session.gateway?.image ?? session.gateway?.icon ?? null,
      transaction_ref: session.transactionRef,
      checkout_url: session.checkoutUrl,
      failure_reason: session.failureReason,
      pending_checkout_id: session.pendingCheckoutId?.toString() ?? null,
      wallet_transaction_id: session.walletTransactionId?.toString() ?? null,
      return_request_id: session.returnRequestId?.toString() ?? null,
      exchange_request_id: session.exchangeRequestId?.toString() ?? null,
      completed_at: session.completedAt,
      expires_at: session.expiresAt,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
      order: order
        ? {
            id: order.id.toString(),
            order_number: order.orderNumber,
            status: order.status,
            payment_status: order.paymentStatus,
            total_price: Number(order.totalPrice),
            items: order.items.map((item) => ({
              id: item.id.toString(),
              product_id: item.productId?.toString() ?? null,
              variant_id: item.variantId?.toString() ?? null,
              name: item.productNameSnapshot,
              quantity: item.quantity,
              amount: Number(item.netLineTotal),
              image: item.imageSnapshot,
            })),
          }
        : null,
    };
  }

  private formatClientPaymentTransaction(
    transaction: Prisma.PaymentTransactionGetPayload<{ include: { order: { include: { items: true } } } }>,
  ) {
    return this.formatClientPayment(transaction);
  }

  private formatClientPayment(transaction: ClientPaymentRecord) {
    return {
      id: `transaction-${transaction.id.toString()}`,
      type: this.paymentTransactionType(transaction),
      status: transaction.paymentStatus,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      payment_method: transaction.paymentMethod,
      provider_identifier: transaction.paymentMethod,
      provider_name: transaction.paymentMethod,
      provider_logo_url: null,
      transaction_ref: transaction.transactionRef,
      checkout_url: null,
      failure_reason: null,
      pending_checkout_id: null,
      wallet_transaction_id: null,
      return_request_id: transaction.returnRequestId?.toString() ?? null,
      exchange_request_id: transaction.exchangeRequestId?.toString() ?? null,
      completed_at: transaction.paidAt,
      expires_at: null,
      created_at: transaction.createdAt,
      updated_at: transaction.createdAt,
      order: {
        id: transaction.order.id.toString(),
        order_number: transaction.order.orderNumber,
        status: transaction.order.status,
        payment_status: transaction.order.paymentStatus,
        total_price: Number(transaction.order.totalPrice),
        items: transaction.order.items.map((item) => ({
          id: item.id.toString(),
          product_id: item.productId?.toString() ?? null,
          variant_id: item.variantId?.toString() ?? null,
          name: item.productNameSnapshot,
          quantity: item.quantity,
          amount: Number(item.netLineTotal),
          image: item.imageSnapshot,
        })),
      },
    };
  }

  private paymentSessionType(session: {
    orderId: bigint | null;
    walletTransactionId: bigint | null;
    returnRequestId: bigint | null;
    exchangeRequestId: bigint | null;
    pendingCheckoutId: bigint | null;
  }) {
    if (session.walletTransactionId) return 'wallet';
    if (session.returnRequestId) return 'return';
    if (session.exchangeRequestId) return 'exchange';
    if (session.orderId) return 'order';
    if (session.pendingCheckoutId) return 'pending_checkout';
    return 'payment';
  }

  private paymentTransactionType(transaction: {
    paymentMethod: string;
    returnRequestId: bigint | null;
    exchangeRequestId: bigint | null;
  }) {
    if (transaction.paymentMethod === 'wallet') return 'wallet';
    if (transaction.returnRequestId) return 'return';
    if (transaction.exchangeRequestId) return 'exchange';
    return 'order';
  }

  private paymentRecordMatches(
    payment: {
      paymentMethod: string;
      paymentStatus: string;
      returnRequestId: bigint | null;
      exchangeRequestId: bigint | null;
    },
    type: string,
    status?: string,
  ) {
    if (status && payment.paymentStatus !== status) return false;
    if (type === 'wallet') return payment.paymentMethod === 'wallet';
    if (type === 'orders') return !payment.returnRequestId && !payment.exchangeRequestId;
    if (type === 'returns') return Boolean(payment.returnRequestId);
    if (type === 'exchanges') return Boolean(payment.exchangeRequestId);
    if (type === 'pending') return false;
    return true;
  }

  private uniqueBigInts(values: Array<bigint | null | undefined>) {
    return Array.from(new Set(values.filter((value): value is bigint => typeof value === 'bigint')));
  }

  private positiveInt(value: unknown, fallback: number) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private optionalBigInt(value: unknown) {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint') return undefined;
    try {
      const parsed = BigInt(String(value));
      return parsed > 0n ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  private transactionActivityId(id: string) {
    if (!id.startsWith('transaction-')) return null;
    return this.optionalBigInt(id.slice('transaction-'.length)) ?? null;
  }
}
