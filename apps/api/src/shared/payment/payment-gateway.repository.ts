import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaService } from '@/prisma';
import {
  FRONTEND_URL_FALLBACK,
  PAYMENT_GATEWAY_DEFAULT_METHODS,
  PAYMENT_GATEWAY_SECRET_KEYS,
  PAYMENT_METHODS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  STRIPE_CONFIG,
} from './payment.constants';
import { PaymentGatewayData, PaymentInitResult, PaymentInitiateOptions } from './interfaces/payment.interfaces';
import { PaymentSecretService } from './payment-secret.service';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

const toPrismaJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;
const toBigInt = (value?: string | bigint | null) =>
  value === undefined || value === null ? undefined : BigInt(value);
const DUMMY_PAYMENT_SECRETS = {
  stripeSecretKey: 'sk_test_dummy_dashboard_stripe_secret',
  stripeWebhookSecret: 'whsec_dummy_dashboard_stripe_webhook',
  tapSecretKey: 'sk_test_dummy_dashboard_tap_secret',
  tapWebhookSecret: 'tap_whsec_dummy_dashboard_webhook',
  tapHashSecret: 'tap_hash_dummy_dashboard_secret',
  moyasarSecretKey: 'sk_test_dummy_dashboard_moyasar_secret',
  moyasarWebhookSecret: 'moyasar_whsec_dummy_dashboard_webhook',
  tabbySecretKey: 'sk_test_dummy_dashboard_tabby_secret',
  tabbyWebhookSecret: 'tabby_whsec_dummy_dashboard_webhook',
} as const;

type GatewayRecord = Awaited<ReturnType<PrismaService['paymentGateway']['findFirstOrThrow']>>;
type SessionRecord = Awaited<ReturnType<PrismaService['paymentSession']['findFirstOrThrow']>> & {
  gateway?: GatewayRecord | null;
};
type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: null;
};
type SessionOrder = {
  id: string;
  user_id: string;
  shopify_id: null;
  shopify_order_id: null;
  shopify_name: null;
  order_number: string;
  status: string;
  financial_status: string;
  fulfillment_status: string;
  email: string;
  phone: string;
  currency: string;
  total_price: number;
  subtotal_price: number;
  total_tax: number;
  total_shipping: number;
  processed_at: Date;
  paid_at: Date | null;
  fulfilled_at: Date | null;
  synced_at: null;
  created_at: Date;
  updated_at: Date;
};
type SessionContext = {
  users: Map<string, SessionUser>;
  orders: Map<string, SessionOrder>;
  pendingCheckoutUsers: Map<string, string>;
  walletTransactionUsers: Map<string, string>;
  returnRequestUsers: Map<string, string>;
  exchangeRequestUsers: Map<string, string>;
};

export type RuntimePaymentGateway = {
  id: bigint;
  identifier: string;
  provider: string;
  environment: string;
  priority: number;
  enabledMethods: string[];
  publicSettings: Record<string, unknown>;
  secrets: Record<string, string | undefined>;
};

@Injectable()
export class PaymentGatewayRepository implements OnModuleInit {
  private readonly logger = new Logger(PaymentGatewayRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly secrets: PaymentSecretService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultGateways({ throwOnMissing: false });
  }

  async ensureDefaultGateways(options: { throwOnMissing?: boolean } = { throwOnMissing: true }) {
    try {
      const defaults = this.defaultGateways();
      for (const gateway of defaults) {
        const existing = await this.prisma.paymentGateway.findUnique({ where: { identifier: gateway.identifier } });
        if (existing) {
          const existingSecrets = this.toRecord(existing.secretSettings);
          const hasSecrets = Object.keys(existingSecrets).length > 0;
          await this.prisma.paymentGateway.update({
            where: { id: existing.id },
            data: {
              isActive: existing.isActive,
              image: existing.image || gateway.image,
              icon: existing.icon || gateway.icon,
              publicSettings: toPrismaJson({
                ...gateway.publicSettings,
                ...this.toRecord(existing.publicSettings),
              }),
              secretSettings: hasSecrets
                ? toPrismaJson(existingSecrets)
                : toPrismaJson(this.encryptBootstrapSecrets(gateway.provider, gateway.secrets)),
              enabledMethods: existing.enabledMethods.length ? existing.enabledMethods : gateway.enabledMethods,
              supportedCountries: existing.supportedCountries.length
                ? existing.supportedCountries
                : gateway.supportedCountries,
              supportedCurrencies: existing.supportedCurrencies.length
                ? existing.supportedCurrencies
                : gateway.supportedCurrencies,
            },
          });
          continue;
        }
        await this.prisma.paymentGateway.create({
          data: {
            identifier: gateway.identifier,
            provider: gateway.provider,
            name: gateway.name,
            description: gateway.description,
            image: gateway.image,
            icon: gateway.icon,
            environment: gateway.environment,
            priority: gateway.priority,
            isActive: gateway.isActive,
            publicSettings: toPrismaJson(gateway.publicSettings),
            secretSettings: toPrismaJson(this.encryptBootstrapSecrets(gateway.provider, gateway.secrets)),
            enabledMethods: gateway.enabledMethods,
            supportedCountries: gateway.supportedCountries,
            supportedCurrencies: gateway.supportedCurrencies,
          },
        });
      }
    } catch (error) {
      if (!this.isMissingPaymentGatewayTables(error)) throw error;
      const message = 'Payment gateway tables are missing. Run Prisma migrations before using payment providers.';
      if (options.throwOnMissing !== false) {
        throw new BadRequestException(message);
      }
      this.logger.warn(message);
    }
  }

  async listAdmin() {
    await this.ensureDefaultGateways();
    const data = await this.prisma.paymentGateway.findMany({ orderBy: [{ priority: 'asc' }, { id: 'asc' }] });
    return { data: data.map((gateway) => this.formatAdminGateway(gateway)) };
  }

  async getAdmin(id: bigint) {
    const gateway = await this.prisma.paymentGateway.findUniqueOrThrow({ where: { id } });
    return { data: this.formatAdminGateway(gateway) };
  }

  async updateAdmin(id: bigint, payload: Record<string, unknown>) {
    const existing = await this.prisma.paymentGateway.findUniqueOrThrow({ where: { id } });
    const incomingSettings = this.toRecord(payload.settings);
    const secretKeys = this.secretKeys(existing.provider);
    const publicSettings = {
      ...this.toRecord(existing.publicSettings),
      ...this.omitKeys(incomingSettings, secretKeys),
    };

    const enabledMethods = this.normalizeList(
      payload.enabled_methods ?? payload.enabledMethods ?? incomingSettings.enabled_methods ?? existing.enabledMethods,
    );
    delete publicSettings.enabled_methods;

    const gateway = await this.prisma.paymentGateway.update({
      where: { id },
      data: {
        name: this.pickString(payload.name, existing.name),
        description: this.pickNullableString(payload.description, existing.description),
        image: this.pickNullableString(payload.image, existing.image),
        icon: this.pickNullableString(payload.icon, existing.icon),
        environment: this.pickString(payload.environment ?? incomingSettings.environment, existing.environment),
        priority: this.pickNumber(payload.priority ?? incomingSettings.priority, existing.priority),
        isActive: this.pickBoolean(payload.is_active ?? payload.isActive, existing.isActive),
        publicSettings: toPrismaJson(publicSettings),
        secretSettings: toPrismaJson(
          this.secrets.mergeSecrets(this.toRecord(existing.secretSettings), incomingSettings, secretKeys),
        ),
        enabledMethods,
        supportedCountries: this.normalizeList(
          payload.supported_countries ?? payload.supportedCountries ?? existing.supportedCountries,
        ),
        supportedCurrencies: this.normalizeList(
          payload.supported_currencies ?? payload.supportedCurrencies ?? existing.supportedCurrencies,
        ),
      },
    });

    return { data: this.formatAdminGateway(gateway), message: 'Payment gateway updated successfully' };
  }

  async listClientPaymentMethods(input?: { country?: string; currency?: string; channel?: string }) {
    await this.ensureDefaultGateways();
    const gateways = await this.prisma.paymentGateway.findMany({
      where: {
        isActive: true,
        supportedCurrencies: input?.currency ? { has: input.currency.toUpperCase() } : undefined,
      },
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });

    const methods: Record<string, unknown>[] = [];
    for (const gateway of gateways) {
      for (const method of gateway.enabledMethods) {
        if (
          [
            PAYMENT_METHODS.stripeIntent,
            PAYMENT_METHODS.stripeCheckout,
            PAYMENT_METHODS.tapCheckout,
            PAYMENT_METHODS.moyasar,
          ].includes(method as never)
        )
          continue;
        const isManualMethod = method === PAYMENT_METHODS.cod || method === PAYMENT_METHODS.bankTransfer;
        methods.push({
          id: isManualMethod ? method : `${method}:${gateway.identifier}`,
          payment_method: method,
          label: this.methodLabel(method, gateway.name),
          provider: gateway.identifier,
          provider_identifier: gateway.identifier,
          provider_name: gateway.name,
          logo_url: gateway.image || this.providerLogo(gateway.identifier),
          icon_url: gateway.icon || this.methodIcon(method),
          provider_logo_url: gateway.image || this.providerLogo(gateway.identifier),
          method_icon_url: this.methodIcon(method),
          channel: input?.channel ?? 'web',
          enabled: true,
          disabled_reason: null,
          installment_plans: this.installmentPlans(gateway.publicSettings, method),
        });
      }
    }

    return {
      data: {
        payment_methods: methods,
      },
    };
  }

  async resolveGatewayForPayment(method: string, options?: PaymentInitiateOptions) {
    if (method === PAYMENT_METHODS.wallet) {
      return null;
    }

    if (method === PAYMENT_METHODS.cod || method === PAYMENT_METHODS.bankTransfer) {
      return this.getRuntimeGateway(method);
    }

    if (options?.providerIdentifier) {
      const gateway = await this.getRuntimeGateway(options.providerIdentifier);
      if (!gateway.enabledMethods.includes(method)) {
        throw new BadRequestException(`Payment gateway ${options.providerIdentifier} does not support ${method}`);
      }
      return gateway;
    }

    const preferredProviders = this.preferredProviders(method);
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: {
        isActive: true,
        provider: { in: preferredProviders },
        enabledMethods: { has: method },
        supportedCurrencies: options?.currency ? { has: options.currency.toUpperCase() } : undefined,
      },
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });

    if (!gateway) {
      throw new BadRequestException(`No active payment gateway supports ${method}`);
    }

    return this.toRuntimeGateway(gateway);
  }

  async getRuntimeGateway(identifier: string) {
    const gateway = await this.prisma.paymentGateway.findUniqueOrThrow({ where: { identifier } });
    if (!gateway.isActive) {
      throw new BadRequestException(`Payment gateway ${identifier} is disabled`);
    }
    return this.toRuntimeGateway(gateway);
  }

  async getRuntimeGatewayByProvider(provider: string) {
    const gateway = await this.prisma.paymentGateway.findFirstOrThrow({
      where: { provider, isActive: true },
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    });
    return this.toRuntimeGateway(gateway);
  }

  async recordInitiation(input: {
    gateway: RuntimePaymentGateway | null;
    method: string;
    amount: number;
    currency?: string;
    result: PaymentInitResult;
    options?: PaymentInitiateOptions;
  }) {
    if (!input.gateway) return null;
    return this.prisma.paymentSession.create({
      data: {
        gatewayId: input.gateway.id,
        providerIdentifier: input.gateway.identifier,
        paymentMethod: input.method,
        status: input.result.status,
        amount: input.amount,
        currency: (input.currency || 'SAR').toUpperCase(),
        transactionRef: input.result.transactionRef,
        sessionKey: input.result.sessionKey || undefined,
        checkoutUrl: input.result.redirectUrl || undefined,
        providerResponse: input.result.gatewayResponse ? toPrismaJson(input.result.gatewayResponse) : undefined,
        metadata: input.options?.metadata ? toPrismaJson(input.options.metadata) : undefined,
        pendingCheckoutId: toBigInt(
          input.options?.pendingCheckoutId ?? input.options?.metadata?.[STRIPE_CONFIG.pendingCheckoutMetadataKey],
        ),
        orderId: toBigInt(input.options?.orderId),
        walletTransactionId: toBigInt(
          input.options?.walletTransactionId ?? input.options?.metadata?.walletTransactionId,
        ),
        returnRequestId: toBigInt(input.options?.returnRequestId),
        exchangeRequestId: toBigInt(input.options?.exchangeRequestId ?? input.options?.metadata?.exchangeRequestId),
        expiresAt: input.options?.expiresAt,
        completedAt: input.result.status === PAYMENT_STATUSES.completed ? new Date() : undefined,
      },
    });
  }

  async updateSessionStatus(transactionRef: string, status: string, providerResponse?: PaymentGatewayData) {
    return this.prisma.paymentSession.updateMany({
      where: { transactionRef },
      data: {
        status,
        providerResponse: providerResponse ? toPrismaJson(providerResponse) : undefined,
        completedAt: status === PAYMENT_STATUSES.completed ? new Date() : undefined,
      },
    });
  }

  async findSessionByTransactionRef(transactionRef: string) {
    return this.prisma.paymentSession.findFirst({
      where: { transactionRef },
      include: { gateway: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSessionsAdmin(query: AdvancedQueryDto = {}) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const paginate = query.paginate !== false;
    const where = await this.paymentSessionWhere(query);
    const [sessions, total] = await Promise.all([
      this.prisma.paymentSession.findMany({
        where,
        include: { gateway: true },
        orderBy: { createdAt: 'desc' },
        skip: paginate ? (page - 1) * limit : undefined,
        take: paginate ? limit : undefined,
      }),
      this.prisma.paymentSession.count({ where }),
    ]);
    const context = await this.loadSessionContext(sessions);
    const data = sessions.map((session) => this.formatSession(session, context));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return paginate
      ? {
          data,
          paymentSessions: data,
          meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        }
      : {
          data,
          paymentSessions: data,
        };
  }

  async listSessionsAdminLegacy() {
    const sessions = await this.prisma.paymentSession.findMany({
      include: { gateway: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const context = await this.loadSessionContext(sessions);
    return {
      data: {
        payment_sessions: sessions.map((session) => this.formatSession(session, context)),
        meta: { total: sessions.length },
      },
    };
  }

  private async paymentSessionWhere(query: AdvancedQueryDto): Promise<Prisma.PaymentSessionWhereInput> {
    const filters = query.filters ?? {};
    const where: Prisma.PaymentSessionWhereInput = {};
    const provider = this.firstFilterValue(filters.provider ?? filters.providerIdentifier);
    const status = this.firstFilterValue(filters.status);
    const userId = this.firstFilterValue(filters.userId);

    if (provider) where.providerIdentifier = provider;
    if (status) where.status = status;

    if (userId) {
      const links = await this.paymentSessionUserLinks(BigInt(userId));
      const userConditions: Prisma.PaymentSessionWhereInput[] = [];
      if (links.orderIds.length) userConditions.push({ orderId: { in: links.orderIds } });
      if (links.pendingCheckoutIds.length) userConditions.push({ pendingCheckoutId: { in: links.pendingCheckoutIds } });
      if (links.walletTransactionIds.length)
        userConditions.push({ walletTransactionId: { in: links.walletTransactionIds } });
      if (links.returnRequestIds.length) userConditions.push({ returnRequestId: { in: links.returnRequestIds } });
      if (links.exchangeRequestIds.length) userConditions.push({ exchangeRequestId: { in: links.exchangeRequestIds } });
      if (userConditions.length) where.OR = userConditions;
      else where.id = { in: [] };
    }

    return where;
  }

  private async paymentSessionUserLinks(userId: bigint) {
    const [orders, pendingCheckouts, walletTransactions, returnRequests, exchangeRequests] = await Promise.all([
      this.prisma.order.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.pendingCheckout.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.walletTransaction.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.returnRequest.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.exchangeRequest.findMany({ where: { userId }, select: { id: true } }),
    ]);

    return {
      orderIds: orders.map((item) => item.id),
      pendingCheckoutIds: pendingCheckouts.map((item) => item.id),
      walletTransactionIds: walletTransactions.map((item) => item.id),
      returnRequestIds: returnRequests.map((item) => item.id),
      exchangeRequestIds: exchangeRequests.map((item) => item.id),
    };
  }

  async getSessionAdmin(id: bigint) {
    const session = await this.prisma.paymentSession.findUniqueOrThrow({ where: { id }, include: { gateway: true } });
    const context = await this.loadSessionContext([session]);
    return { data: this.formatSession(session, context) };
  }

  formatAdminGateway(gateway: GatewayRecord) {
    const publicSettings = this.toRecord(gateway.publicSettings);
    const secretSettings = this.toRecord(gateway.secretSettings);
    const maskedSecrets = this.secretKeys(gateway.provider).reduce<Record<string, string>>((acc, key) => {
      acc[key] = this.secrets.mask(secretSettings[key]);
      return acc;
    }, {});

    return {
      id: gateway.id.toString(),
      identifier: gateway.identifier,
      provider: gateway.provider,
      name: gateway.name,
      description: gateway.description,
      image: gateway.image,
      icon: gateway.icon,
      environment: gateway.environment,
      priority: gateway.priority,
      is_active: gateway.isActive,
      enabled_methods: gateway.enabledMethods,
      supported_countries: gateway.supportedCountries,
      supported_currencies: gateway.supportedCurrencies,
      settings: {
        ...publicSettings,
        ...maskedSecrets,
        enabled_methods: gateway.enabledMethods.join(','),
      },
      created_at: gateway.createdAt,
      updated_at: gateway.updatedAt,
    };
  }

  private formatSession(session: SessionRecord, context?: SessionContext) {
    const orderId = session.orderId?.toString();
    const pendingCheckoutId = session.pendingCheckoutId?.toString();
    const walletTransactionId = session.walletTransactionId?.toString();
    const returnRequestId = session.returnRequestId?.toString();
    const exchangeRequestId = session.exchangeRequestId?.toString();
    const userId =
      (orderId ? context?.orders.get(orderId)?.user_id : undefined) ??
      (pendingCheckoutId ? context?.pendingCheckoutUsers.get(pendingCheckoutId) : undefined) ??
      (walletTransactionId ? context?.walletTransactionUsers.get(walletTransactionId) : undefined) ??
      (returnRequestId ? context?.returnRequestUsers.get(returnRequestId) : undefined) ??
      (exchangeRequestId ? context?.exchangeRequestUsers.get(exchangeRequestId) : undefined);

    return {
      id: session.id.toString(),
      user: userId ? (context?.users.get(userId) ?? null) : null,
      order: orderId ? (context?.orders.get(orderId) ?? null) : null,
      provider: session.gateway ? this.formatAdminGateway(session.gateway) : null,
      provider_identifier: session.providerIdentifier,
      payment_method: session.paymentMethod,
      status: session.status,
      amount: Number(session.amount),
      currency: session.currency,
      transaction_ref: session.transactionRef,
      session_key: session.sessionKey,
      checkout_url: session.checkoutUrl,
      failure_reason: session.failureReason,
      provider_response: session.providerResponse,
      sdk_parameters: session.sdkParameters,
      metadata: session.metadata,
      pending_checkout_id: pendingCheckoutId,
      order_id: orderId,
      wallet_transaction_id: walletTransactionId,
      return_request_id: returnRequestId,
      exchange_request_id: exchangeRequestId,
      expires_at: session.expiresAt,
      completed_at: session.completedAt,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
    };
  }

  private async loadSessionContext(sessions: SessionRecord[]): Promise<SessionContext> {
    const orderIds = this.uniqueBigInts(sessions.map((session) => session.orderId));
    const pendingCheckoutIds = this.uniqueBigInts(sessions.map((session) => session.pendingCheckoutId));
    const walletTransactionIds = this.uniqueBigInts(sessions.map((session) => session.walletTransactionId));
    const returnRequestIds = this.uniqueBigInts(sessions.map((session) => session.returnRequestId));
    const exchangeRequestIds = this.uniqueBigInts(sessions.map((session) => session.exchangeRequestId));

    const [orders, pendingCheckouts, walletTransactions, returnRequests, exchangeRequests] = await Promise.all([
      orderIds.length
        ? this.prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: { user: true },
          })
        : [],
      pendingCheckoutIds.length
        ? this.prisma.pendingCheckout.findMany({
            where: { id: { in: pendingCheckoutIds } },
            select: { id: true, userId: true },
          })
        : [],
      walletTransactionIds.length
        ? this.prisma.walletTransaction.findMany({
            where: { id: { in: walletTransactionIds } },
            include: { user: true },
          })
        : [],
      returnRequestIds.length
        ? this.prisma.returnRequest.findMany({
            where: { id: { in: returnRequestIds } },
            include: { user: true },
          })
        : [],
      exchangeRequestIds.length
        ? this.prisma.exchangeRequest.findMany({
            where: { id: { in: exchangeRequestIds } },
            include: { user: true },
          })
        : [],
    ]);

    const users = new Map<string, SessionUser>();
    const ordersMap = new Map<string, SessionOrder>();
    const pendingCheckoutUsers = new Map<string, string>();
    const walletTransactionUsers = new Map<string, string>();
    const returnRequestUsers = new Map<string, string>();
    const exchangeRequestUsers = new Map<string, string>();

    for (const order of orders) {
      const user = this.formatSessionUser(order.user);
      users.set(user.id, user);
      ordersMap.set(order.id.toString(), this.formatSessionOrder(order));
    }

    for (const checkout of pendingCheckouts) {
      pendingCheckoutUsers.set(checkout.id.toString(), checkout.userId.toString());
    }

    for (const transaction of walletTransactions) {
      const user = this.formatSessionUser(transaction.user);
      users.set(user.id, user);
      walletTransactionUsers.set(transaction.id.toString(), user.id);
    }

    for (const request of returnRequests) {
      const user = this.formatSessionUser(request.user);
      users.set(user.id, user);
      returnRequestUsers.set(request.id.toString(), user.id);
    }

    for (const request of exchangeRequests) {
      const user = this.formatSessionUser(request.user);
      users.set(user.id, user);
      exchangeRequestUsers.set(request.id.toString(), user.id);
    }

    if (pendingCheckoutUsers.size) {
      const userIds = this.uniqueBigInts(Array.from(pendingCheckoutUsers.values()).map((id) => BigInt(id)));
      const checkoutUsers = await this.prisma.user.findMany({ where: { id: { in: userIds } } });
      for (const user of checkoutUsers) {
        const formatted = this.formatSessionUser(user);
        users.set(formatted.id, formatted);
      }
    }

    return {
      users,
      orders: ordersMap,
      pendingCheckoutUsers,
      walletTransactionUsers,
      returnRequestUsers,
      exchangeRequestUsers,
    };
  }

  private formatSessionUser(user: {
    id: bigint;
    name: string | null;
    email: string | null;
    phone: string | null;
  }): SessionUser {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email ?? '',
      phone: user.phone,
      image: null,
    };
  }

  private formatSessionOrder(order: {
    id: bigint;
    orderNumber: string;
    userId: bigint;
    status: string;
    paymentStatus: string;
    currency?: string;
    totalPrice: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    vatValue: Prisma.Decimal;
    shippingFee: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
    deliveredAt: Date | null;
  }): SessionOrder {
    return {
      id: order.id.toString(),
      user_id: order.userId.toString(),
      shopify_id: null,
      shopify_order_id: null,
      shopify_name: null,
      order_number: order.orderNumber,
      status: order.status,
      financial_status: order.paymentStatus,
      fulfillment_status: order.deliveredAt ? 'fulfilled' : 'unfulfilled',
      email: '',
      phone: '',
      currency: order.currency ?? 'SAR',
      total_price: Number(order.totalPrice),
      subtotal_price: Number(order.subtotal),
      total_tax: Number(order.vatValue),
      total_shipping: Number(order.shippingFee),
      processed_at: order.createdAt,
      paid_at: order.paymentStatus === PAYMENT_STATUSES.completed ? order.updatedAt : null,
      fulfilled_at: order.deliveredAt,
      synced_at: null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };
  }

  private uniqueBigInts(values: Array<bigint | null | undefined>) {
    return Array.from(new Set(values.filter((value): value is bigint => value !== null && value !== undefined)));
  }

  private toRuntimeGateway(gateway: GatewayRecord): RuntimePaymentGateway {
    return {
      id: gateway.id,
      identifier: gateway.identifier,
      provider: gateway.provider,
      environment: gateway.environment,
      priority: gateway.priority,
      enabledMethods: gateway.enabledMethods,
      publicSettings: this.toRecord(gateway.publicSettings),
      secrets: this.secrets.decryptRecord(this.toRecord(gateway.secretSettings)),
    };
  }

  private preferredProviders(method: string) {
    if (method === PAYMENT_METHODS.applePay)
      return [PAYMENT_PROVIDERS.tap, PAYMENT_PROVIDERS.moyasar, PAYMENT_PROVIDERS.stripe];
    if (method === PAYMENT_METHODS.tabby) return [PAYMENT_PROVIDERS.tabby];
    if (method === PAYMENT_METHODS.tapCheckout) return [PAYMENT_PROVIDERS.tap];
    if (method === PAYMENT_METHODS.moyasar) return [PAYMENT_PROVIDERS.moyasar];
    if (method === PAYMENT_METHODS.stripeCheckout || method === PAYMENT_METHODS.stripeIntent)
      return [PAYMENT_PROVIDERS.stripe];
    return [PAYMENT_PROVIDERS.stripe, PAYMENT_PROVIDERS.tap, PAYMENT_PROVIDERS.moyasar];
  }

  private methodLabel(method: string, providerName?: string) {
    const labels: Record<string, string> = {
      [PAYMENT_METHODS.cod]: 'Cash on Delivery',
      [PAYMENT_METHODS.bankTransfer]: 'Bank Transfer',
      [PAYMENT_METHODS.card]: 'Card / Online Payment',
      [PAYMENT_METHODS.applePay]: 'Apple Pay',
      [PAYMENT_METHODS.stripeCheckout]: 'Card / Online Payment',
      [PAYMENT_METHODS.tapCheckout]: 'Card / Online Payment',
      [PAYMENT_METHODS.moyasar]: 'Card / Online Payment',
      [PAYMENT_METHODS.tabby]: 'Tabby',
    };
    const label = labels[method] || method.replaceAll('_', ' ');
    return providerName ? `${label} - ${providerName}` : label;
  }

  private installmentPlans(settings: unknown, method: string) {
    const raw = this.toRecord(settings).installment_plans;
    if (!raw && method !== PAYMENT_METHODS.tabby) return undefined;
    const values = this.normalizeList(raw || '2,3,6')
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item) && item > 1);
    return values.length ? values : undefined;
  }

  private providerLogo(provider: string | null | undefined) {
    const logos: Record<string, string> = {
      [PAYMENT_PROVIDERS.stripe]: '/payment-providers/stripe.svg',
      [PAYMENT_PROVIDERS.tap]: '/payment-providers/tap.svg',
      [PAYMENT_PROVIDERS.moyasar]: '/payment-providers/moyasar.svg',
      [PAYMENT_PROVIDERS.tabby]: '/payment-providers/tabby.svg',
      [PAYMENT_PROVIDERS.cod]: '/payment-providers/cash.svg',
      [PAYMENT_PROVIDERS.bankTransfer]: '/payment-providers/bank-transfer.svg',
    };
    return provider ? logos[provider] : undefined;
  }

  private methodIcon(method: string | null | undefined) {
    const icons: Record<string, string> = {
      [PAYMENT_METHODS.card]: '/payment-providers/card.svg',
      [PAYMENT_METHODS.applePay]: '/payment-providers/apple-pay.svg',
      [PAYMENT_METHODS.stripeCheckout]: '/payment-providers/card.svg',
      [PAYMENT_METHODS.stripeIntent]: '/payment-providers/card.svg',
      [PAYMENT_METHODS.tapCheckout]: '/payment-providers/card.svg',
      [PAYMENT_METHODS.moyasar]: '/payment-providers/card.svg',
      [PAYMENT_METHODS.tabby]: '/payment-providers/tabby.svg',
      [PAYMENT_METHODS.bankTransfer]: '/payment-providers/bank-transfer.svg',
      [PAYMENT_METHODS.cod]: '/payment-providers/cash.svg',
    };
    return method ? icons[method] : undefined;
  }

  private defaultGateways() {
    const domain = this.configService.get<string>('FRONTEND_URL') || FRONTEND_URL_FALLBACK;
    return [
      {
        identifier: PAYMENT_PROVIDERS.bankTransfer,
        provider: PAYMENT_PROVIDERS.bankTransfer,
        name: 'Bank Transfer',
        description: 'Manual bank transfer payment method.',
        image:
          this.configService.get<string>('BANK_TRANSFER_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.bankTransfer),
        icon:
          this.configService.get<string>('BANK_TRANSFER_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.bankTransfer),
        environment: this.configService.get<string>('BANK_TRANSFER_ENVIRONMENT') || 'manual',
        priority: 900,
        isActive: true,
        enabledMethods: this.envList('BANK_TRANSFER_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.bank_transfer),
        supportedCountries: this.envList('BANK_TRANSFER_SUPPORTED_COUNTRIES', ['SA', 'EG']),
        supportedCurrencies: this.envList('BANK_TRANSFER_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
        publicSettings: {
          instructions: this.configService.get<string>('BANK_TRANSFER_INSTRUCTIONS') || '',
        },
        secrets: {},
      },
      {
        identifier: PAYMENT_PROVIDERS.cod,
        provider: PAYMENT_PROVIDERS.cod,
        name: 'Cash on Delivery',
        description: 'Manual cash on delivery payment method.',
        image: this.configService.get<string>('COD_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.cod),
        icon: this.configService.get<string>('COD_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.cod),
        environment: this.configService.get<string>('COD_ENVIRONMENT') || 'manual',
        priority: 910,
        isActive: true,
        enabledMethods: this.envList('COD_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.cod),
        supportedCountries: this.envList('COD_SUPPORTED_COUNTRIES', ['SA', 'EG']),
        supportedCurrencies: this.envList('COD_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
        publicSettings: {
          instructions: this.configService.get<string>('COD_INSTRUCTIONS') || '',
        },
        secrets: {},
      },
      {
        identifier: PAYMENT_PROVIDERS.stripe,
        provider: PAYMENT_PROVIDERS.stripe,
        name: 'Stripe',
        description: 'Stripe Checkout and PaymentIntent provider.',
        image: this.configService.get<string>('STRIPE_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.stripe),
        icon: this.configService.get<string>('STRIPE_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.stripe),
        environment: this.configService.get<string>('STRIPE_ENVIRONMENT') || 'test',
        priority: 100,
        isActive: true,
        enabledMethods: this.envList('STRIPE_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.stripe),
        supportedCountries: this.envList('STRIPE_SUPPORTED_COUNTRIES', ['SA', 'EG']),
        supportedCurrencies: this.envList('STRIPE_SUPPORTED_CURRENCIES', ['SAR', 'EGP']),
        publicSettings: {
          publishable_key: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || 'pk_test_replace_me',
          api_version: this.configService.get<string>('STRIPE_API_VERSION') || STRIPE_CONFIG.apiVersion,
          checkout_expiry_minutes:
            this.configService.get<number>('STRIPE_CHECKOUT_EXPIRY_MINUTES') || STRIPE_CONFIG.checkoutExpiryMinutes,
          success_path: this.configService.get<string>('STRIPE_SUCCESS_PATH') || STRIPE_CONFIG.successPath,
          cancel_path: this.configService.get<string>('STRIPE_CANCEL_PATH') || STRIPE_CONFIG.cancelPath,
          frontend_url: domain,
        },
        secrets: {
          secret_key: this.configService.get<string>('STRIPE_SECRET_KEY') || DUMMY_PAYMENT_SECRETS.stripeSecretKey,
          webhook_secret:
            this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || DUMMY_PAYMENT_SECRETS.stripeWebhookSecret,
        },
      },
      {
        identifier: PAYMENT_PROVIDERS.tap,
        provider: PAYMENT_PROVIDERS.tap,
        name: 'Tap Payments',
        description: 'Tap regional gateway for card, mada, STC Pay, and Apple Pay.',
        image: this.configService.get<string>('TAP_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.tap),
        icon: this.configService.get<string>('TAP_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.tap),
        environment: this.configService.get<string>('TAP_ENVIRONMENT') || 'test',
        priority: 20,
        isActive: true,
        enabledMethods: this.envList('TAP_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.tap),
        supportedCountries: this.envList('TAP_SUPPORTED_COUNTRIES', ['SA', 'EG', 'AE', 'KW', 'BH', 'OM', 'QA']),
        supportedCurrencies: this.envList('TAP_SUPPORTED_CURRENCIES', [
          'SAR',
          'EGP',
          'AED',
          'KWD',
          'BHD',
          'OMR',
          'QAR',
        ]),
        publicSettings: {
          public_key: this.configService.get<string>('TAP_PUBLIC_KEY') || 'pk_test_replace_me',
          merchant_id: this.configService.get<string>('TAP_MERCHANT_ID') || '',
          supported_methods: this.configService.get<string>('TAP_SUPPORTED_METHODS') || 'card,apple_pay,mada,stc_pay',
          installment_plans: this.configService.get<string>('TAP_INSTALLMENT_PLANS') || '',
        },
        secrets: {
          secret_key: this.configService.get<string>('TAP_SECRET_KEY') || DUMMY_PAYMENT_SECRETS.tapSecretKey,
          webhook_secret:
            this.configService.get<string>('TAP_WEBHOOK_SECRET') || DUMMY_PAYMENT_SECRETS.tapWebhookSecret,
          hash_secret: this.configService.get<string>('TAP_HASH_SECRET') || DUMMY_PAYMENT_SECRETS.tapHashSecret,
        },
      },
      {
        identifier: PAYMENT_PROVIDERS.moyasar,
        provider: PAYMENT_PROVIDERS.moyasar,
        name: 'Moyasar',
        description: 'Moyasar card and Apple Pay processing.',
        image: this.configService.get<string>('MOYASAR_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.moyasar),
        icon: this.configService.get<string>('MOYASAR_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.moyasar),
        environment: this.configService.get<string>('MOYASAR_ENVIRONMENT') || 'test',
        priority: 30,
        isActive: true,
        enabledMethods: this.envList('MOYASAR_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.moyasar),
        supportedCountries: this.envList('MOYASAR_SUPPORTED_COUNTRIES', ['SA']),
        supportedCurrencies: this.envList('MOYASAR_SUPPORTED_CURRENCIES', ['SAR']),
        publicSettings: {
          publishable_key: this.configService.get<string>('MOYASAR_PUBLISHABLE_KEY') || 'pk_test_replace_me',
          supported_methods: this.configService.get<string>('MOYASAR_SUPPORTED_METHODS') || 'card,apple_pay,mada',
        },
        secrets: {
          secret_key: this.configService.get<string>('MOYASAR_SECRET_KEY') || DUMMY_PAYMENT_SECRETS.moyasarSecretKey,
          webhook_secret:
            this.configService.get<string>('MOYASAR_WEBHOOK_SECRET') || DUMMY_PAYMENT_SECRETS.moyasarWebhookSecret,
        },
      },
      {
        identifier: PAYMENT_PROVIDERS.tabby,
        provider: PAYMENT_PROVIDERS.tabby,
        name: 'Tabby',
        description: 'Direct Tabby BNPL checkout provider.',
        image: this.configService.get<string>('TABBY_LOGO_URL') || this.providerLogo(PAYMENT_PROVIDERS.tabby),
        icon: this.configService.get<string>('TABBY_ICON_URL') || this.providerLogo(PAYMENT_PROVIDERS.tabby),
        environment: this.configService.get<string>('TABBY_ENVIRONMENT') || 'test',
        priority: 40,
        isActive: true,
        enabledMethods: this.envList('TABBY_ENABLED_METHODS', PAYMENT_GATEWAY_DEFAULT_METHODS.tabby),
        supportedCountries: this.envList('TABBY_SUPPORTED_COUNTRIES', ['SA', 'AE', 'KW', 'BH']),
        supportedCurrencies: this.envList('TABBY_SUPPORTED_CURRENCIES', ['SAR', 'AED', 'KWD', 'BHD']),
        publicSettings: {
          public_key: this.configService.get<string>('TABBY_PUBLIC_KEY') || 'pk_test_replace_me',
          merchant_code: this.configService.get<string>('TABBY_MERCHANT_CODE') || '',
          installment_plans: this.configService.get<string>('TABBY_INSTALLMENT_PLANS') || '2,3,6',
        },
        secrets: {
          secret_key: this.configService.get<string>('TABBY_SECRET_KEY') || DUMMY_PAYMENT_SECRETS.tabbySecretKey,
          webhook_secret:
            this.configService.get<string>('TABBY_WEBHOOK_SECRET') || DUMMY_PAYMENT_SECRETS.tabbyWebhookSecret,
        },
      },
    ];
  }

  private encryptBootstrapSecrets(provider: string, values: Record<string, unknown>) {
    return this.secretKeys(provider).reduce<Record<string, unknown>>((acc, key) => {
      const value = values[key];
      if (typeof value === 'string' && value) acc[key] = this.secrets.encrypt(value);
      return acc;
    }, {});
  }

  private secretKeys(provider: string) {
    return PAYMENT_GATEWAY_SECRET_KEYS[provider as keyof typeof PAYMENT_GATEWAY_SECRET_KEYS] || [];
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  }

  private omitKeys(value: Record<string, unknown>, keys: readonly string[]) {
    const next = { ...value };
    for (const key of keys) delete next[key];
    return next;
  }

  private normalizeList(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    if (typeof value === 'string')
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    return [];
  }

  private firstFilterValue(value: unknown): string {
    if (Array.isArray(value)) return this.firstFilterValue(value[0]);
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim();
    }
    return '';
  }

  private envList(key: string, fallback: readonly string[]): string[] {
    const values = this.normalizeList(this.configService.get<string>(key));
    return values.length ? values : [...fallback];
  }

  private pickString(value: unknown, fallback: string) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  private pickNullableString(value: unknown, fallback: string | null) {
    return value === null || typeof value === 'string' ? value : fallback;
  }

  private pickNumber(value: unknown, fallback: number) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  private pickBoolean(value: unknown, fallback: boolean) {
    if (value === undefined) return fallback;
    return value === true || value === 1 || value === '1' || value === 'true';
  }

  private isMissingPaymentGatewayTables(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const candidate = error as { code?: unknown; message?: unknown };
    const message = typeof candidate.message === 'string' ? candidate.message : '';
    return candidate.code === 'P2021' && message.includes('payment_gateways');
  }
}
