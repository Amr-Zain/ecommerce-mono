import { TransactionContext } from '@/common/persistence';
import { IBaseRepository } from './base.repository.interface';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { PaymentTransactionRecord } from './payment-transactions.interface';

type MoneyValue = { toString(): string } | number | string;

export interface Order {
  id: bigint;
  orderNumber: string;
  userId: bigint;
  addressId: bigint | null;
  shippingAddressSnapshot: unknown;
  countryId: bigint | null;
  countryNameSnapshot: string | null;
  cityNameSnapshot: string | null;
  shippingFee: MoneyValue;
  subtotal: MoneyValue;
  discountAmount: MoneyValue;
  loyaltyDiscountAmount: MoneyValue;
  loyaltyPointsRedeemed: number;
  loyaltyRewardId: bigint | null;
  loyaltyRewardSnapshot: unknown;
  couponId: bigint | null;
  couponCodeSnapshot: string | null;
  vatValue: MoneyValue;
  vatType: string | null;
  totalPrice: MoneyValue;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  cancelReason: string | null;
  deliveredAt: Date | null;
}

export interface OrderItemTranslationRecord {
  id: bigint;
  recordId: bigint;
  langId: string;
  nameSnapshot: string;
  descriptionSnapshot: string | null;
}

export interface OrderItemRecord {
  id: bigint;
  orderId: bigint;
  productId: bigint | null;
  variantId: bigint | null;
  quantity: number;
  unitPriceSnapshot: MoneyValue;
  discountValueSnapshot: MoneyValue;
  discountTypeSnapshot: string | null;
  productNameSnapshot: string;
  variantInfoSnapshot: unknown;
  imageSnapshot: string | null;
  totalPrice: MoneyValue;
  lineSubtotalSnapshot: MoneyValue;
  couponDiscountShare: MoneyValue;
  netLineTotal: MoneyValue;
  netUnitPrice: MoneyValue;
  vatShare: MoneyValue;
  isActive: boolean;
  createdAt: Date;
}

export interface OrderStatusHistoryRecord {
  id: bigint;
  orderId: bigint;
  previousStatus: string | null;
  newStatus: string;
  actorType: string;
  actorUserId: bigint | null;
  reason: string | null;
  metadata: unknown;
  createdAt: Date;
}

export interface OrderUserRecord {
  id: bigint;
  name: string | null;
  email: string | null;
  phone: string | null;
  phoneCode: string | null;
  [key: string]: unknown;
}

export interface AdminOrderRecord extends Order {
  items: Array<OrderItemRecord & { translations: OrderItemTranslationRecord[] }>;
  payments: PaymentTransactionRecord[];
  user: OrderUserRecord;
  statusHistory: OrderStatusHistoryRecord[];
}

export interface ClientOrderRecord extends Order {
  items: Array<OrderItemRecord & { translations: OrderItemTranslationRecord[] }>;
  payments: PaymentTransactionRecord[];
  statusHistory: OrderStatusHistoryRecord[];
}

export interface OrderLifecycleRecord extends Order {
  items: OrderItemRecord[];
  payments: PaymentTransactionRecord[];
}

export interface OrderWithPayments extends Order {
  payments: PaymentTransactionRecord[];
}

export interface OrderItemWithOrder extends OrderItemRecord {
  order: Order;
}

export interface AdminOrderFilter {
  status?: string;
  paymentStatus?: string;
}

export type OrderPersistenceContext = TransactionContext;
export type OrderUpdateCommand = Record<string, unknown>;

export const ORDERS_REPOSITORY = Symbol('IOrdersRepository');

export interface IOrdersRepository extends IBaseRepository<Order> {
  findAdminOrders(
    query: AdvancedQueryDto,
    filter: AdminOrderFilter,
    langId: string,
  ): Promise<PaginatedResult<AdminOrderRecord> | AdminOrderRecord[]>;
  findAdminOrderById(id: bigint, langId: string): Promise<AdminOrderRecord | null>;
  findClientOrders(userId: bigint, status: string | undefined, langId: string): Promise<ClientOrderRecord[]>;
  findClientOrderById(userId: bigint, id: bigint, langId: string): Promise<ClientOrderRecord | null>;
  findLifecycleOrder(id: bigint, context?: OrderPersistenceContext): Promise<OrderLifecycleRecord | null>;
  findOrderWithPayments(id: bigint, context?: OrderPersistenceContext): Promise<OrderWithPayments | null>;
  lock(id: bigint, context: OrderPersistenceContext): Promise<void>;
  updateOrder(id: bigint, data: OrderUpdateCommand, context?: OrderPersistenceContext): Promise<Order>;
  createStatusHistory(
    input: {
      orderId: bigint;
      previousStatus?: string | null;
      newStatus: string;
      actorType: string;
      actorUserId?: bigint;
      reason?: string;
      metadata?: unknown;
    },
    context?: OrderPersistenceContext,
  ): Promise<OrderStatusHistoryRecord>;
  findOrderItemsWithOrder(ids: bigint[], context?: OrderPersistenceContext): Promise<OrderItemWithOrder[]>;
  lockOrderItem(id: bigint, context: OrderPersistenceContext): Promise<void>;
}
