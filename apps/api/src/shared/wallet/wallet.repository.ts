import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginationUtil } from '@/common/utils/pagination.util';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { PAYMENT_CURRENCIES } from '@/shared/payment/payment.constants';

type FilterValue = string | number | boolean;

type WalletQuery = AdvancedQueryDto & {
  filters?: Record<string, FilterValue>;
};

export type WalletWithUser = Prisma.WalletGetPayload<{ include: { user: true } }>;
export type WalletTransactionWithRelations = Prisma.WalletTransactionGetPayload<{
  include: { wallet: true; user: true };
}>;
export type WalletWithdrawalWithRelations = Prisma.WalletWithdrawalRequestGetPayload<{
  include: { wallet: true; user: true; transaction: true };
}>;

@Injectable()
export class WalletRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {}

  get client() {
    return this.prisma;
  }

  async getOrCreateWallet(userId: bigint) {
    const existing = await this.prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency: PAYMENT_CURRENCIES.sar } },
      include: { user: true },
    });
    if (existing) return existing;
    return this.prisma.wallet.create({
      data: { userId, currency: PAYMENT_CURRENCIES.sar },
      include: { user: true },
    });
  }

  findWalletById(id: bigint) {
    return this.prisma.wallet.findUnique({ where: { id }, include: { user: true } });
  }

  findDepositForUser(userId: bigint, id: bigint, depositType: string) {
    return this.prisma.walletTransaction.findFirst({
      where: { id, userId, type: depositType },
      include: { wallet: true, user: true },
    });
  }

  findWithdrawalForUser(userId: bigint, id: bigint) {
    return this.prisma.walletWithdrawalRequest.findFirst({
      where: { id, userId },
      include: { wallet: true, user: true, transaction: true },
    });
  }

  findWithdrawalById(id: bigint, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    return tx.walletWithdrawalRequest.findUnique({
      where: { id },
      include: { wallet: true, user: true, transaction: true },
    });
  }

  async listWallets(query: WalletQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where = this.buildWalletWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    if (query.paginate === false) {
      return this.prisma.wallet.findMany({ where, include: { user: true }, orderBy });
    }

    const [wallets, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        include: { user: true },
        orderBy,
        skip: PaginationUtil.getSkip(page, limit),
        take: limit,
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return PaginationUtil.createResult(wallets, page, limit, total);
  }

  async listTransactions(query: WalletQuery, forcedWhere: Prisma.WalletTransactionWhereInput = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where = this.queryBuilder.combineWhereConditions<Prisma.WalletTransactionWhereInput>(
      forcedWhere,
      this.buildTransactionWhere(query),
    );
    const orderBy = this.buildOrderBy(query.sort);

    if (query.paginate === false) {
      return this.prisma.walletTransaction.findMany({ where, include: { wallet: true, user: true }, orderBy });
    }

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: { wallet: true, user: true },
        orderBy,
        skip: PaginationUtil.getSkip(page, limit),
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return PaginationUtil.createResult(transactions, page, limit, total);
  }

  async listWithdrawals(query: WalletQuery, forcedWhere: Prisma.WalletWithdrawalRequestWhereInput = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where = this.queryBuilder.combineWhereConditions<Prisma.WalletWithdrawalRequestWhereInput>(
      forcedWhere,
      this.buildWithdrawalWhere(query),
    );
    const orderBy = this.buildOrderBy(query.sort);

    if (query.paginate === false) {
      return this.prisma.walletWithdrawalRequest.findMany({
        where,
        include: { wallet: true, user: true, transaction: true },
        orderBy,
      });
    }

    const [withdrawals, total] = await Promise.all([
      this.prisma.walletWithdrawalRequest.findMany({
        where,
        include: { wallet: true, user: true, transaction: true },
        orderBy,
        skip: PaginationUtil.getSkip(page, limit),
        take: limit,
      }),
      this.prisma.walletWithdrawalRequest.count({ where }),
    ]);

    return PaginationUtil.createResult(withdrawals, page, limit, total);
  }

  private buildWalletWhere(query: WalletQuery): Prisma.WalletWhereInput {
    const filters = this.filters(query);
    const conditions: Prisma.WalletWhereInput[] = [];

    if (filters.userId) conditions.push({ userId: BigInt(String(filters.userId)) });
    if (filters.status) conditions.push({ status: String(filters.status) });
    if (filters.userEmail) conditions.push({ user: { email: { contains: String(filters.userEmail), mode: 'insensitive' } } });

    if (query.search) {
      conditions.push({
        user: {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }

  private buildTransactionWhere(query: WalletQuery): Prisma.WalletTransactionWhereInput {
    const filters = this.filters(query);
    const conditions: Prisma.WalletTransactionWhereInput[] = [];

    if (filters.userId) conditions.push({ userId: BigInt(String(filters.userId)) });
    if (filters.walletId) conditions.push({ walletId: BigInt(String(filters.walletId)) });
    if (filters.type) conditions.push({ type: String(filters.type) });
    if (filters.direction) conditions.push({ direction: String(filters.direction) });
    if (filters.status) conditions.push({ status: String(filters.status) });
    if (filters.referenceType) conditions.push({ referenceType: String(filters.referenceType) });
    if (filters.referenceId) conditions.push({ referenceId: String(filters.referenceId) });
    if (filters.paymentMethod) conditions.push({ paymentMethod: String(filters.paymentMethod) });
    if (filters.transactionRef) conditions.push({ transactionRef: String(filters.transactionRef) });
    if (filters.userEmail) conditions.push({ user: { email: { contains: String(filters.userEmail), mode: 'insensitive' } } });

    const amountFilter: Prisma.DecimalFilter = {};
    if (filters.minAmount !== undefined) amountFilter.gte = Number(filters.minAmount);
    if (filters.maxAmount !== undefined) amountFilter.lte = Number(filters.maxAmount);
    if (Object.keys(amountFilter).length > 0) conditions.push({ amount: amountFilter });

    const createdAt = this.dateFilter(filters.dateFrom, filters.dateTo);
    if (createdAt) conditions.push({ createdAt });

    if (query.search) {
      conditions.push({
        OR: [
          { transactionRef: { contains: query.search, mode: 'insensitive' } },
          { referenceId: { contains: query.search, mode: 'insensitive' } },
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ],
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }

  private buildWithdrawalWhere(query: WalletQuery): Prisma.WalletWithdrawalRequestWhereInput {
    const filters = this.filters(query);
    const conditions: Prisma.WalletWithdrawalRequestWhereInput[] = [];

    if (filters.userId) conditions.push({ userId: BigInt(String(filters.userId)) });
    if (filters.walletId) conditions.push({ walletId: BigInt(String(filters.walletId)) });
    if (filters.status) conditions.push({ status: String(filters.status) });
    if (filters.method) conditions.push({ method: String(filters.method) });
    if (filters.userEmail) conditions.push({ user: { email: { contains: String(filters.userEmail), mode: 'insensitive' } } });

    const createdAt = this.dateFilter(filters.dateFrom, filters.dateTo);
    if (createdAt) conditions.push({ createdAt });

    if (query.search) {
      conditions.push({
        OR: [
          { transferReference: { contains: query.search, mode: 'insensitive' } },
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ],
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }

  private filters(query: WalletQuery): Record<string, FilterValue> {
    const normalized: Record<string, FilterValue> = {};
    const source = query.filters || {};
    for (const [key, value] of Object.entries(source)) {
      normalized[this.camelKey(key)] = value;
    }
    return normalized;
  }

  private dateFilter(dateFrom?: FilterValue, dateTo?: FilterValue): Prisma.DateTimeFilter | null {
    if (!dateFrom && !dateTo) return null;
    return {
      ...(dateFrom ? { gte: new Date(String(dateFrom)) } : {}),
      ...(dateTo ? { lte: new Date(String(dateTo)) } : {}),
    };
  }

  private buildOrderBy(sort?: Record<string, 'asc' | 'desc'>) {
    if (!sort || Object.keys(sort).length === 0) return { createdAt: 'desc' } as const;
    return Object.entries(sort).map(([key, direction]) => ({ [this.camelKey(key)]: direction }));
  }

  private camelKey(key: string) {
    return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
  }
}
