import { Prisma } from '@prisma/client';
import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';
import { QueryOptions } from '../../common/repositories/base.repository';

export interface ProductTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
  description: string | null;
}

export interface VariantAttribute {
  productId: bigint;
  productVariantId: bigint;
  attributeId: bigint;
  valueId: bigint;
  attribute?: unknown;
  value?: unknown;
}

export interface ProductVariant {
  id: bigint;
  productId: bigint;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  discountType: string | null;
  discountValue: number | null;
  stockQuantity: number;
  barcode: string | null;
  sku: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  attributes?: VariantAttribute[];
  gallery?: unknown;
}

export type ProductVariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: { product: true };
}>;

export interface Product {
  id: bigint;
  collectionId: bigint | null;
  hasVariants: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: ProductTranslation[];
  variants: ProductVariant[];
  discountType?: string | null;
  discountValue?: number | null;
  collection?: unknown;
  image?: unknown;
  gallery?: unknown[];
}

/* ── Update plan ────────────────────────────────────────────── */

export interface SimpleVariantSyncData {
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  sku: string | null;
  barcode: string | null;
  costPrice: number | null;
  discountType: string | null;
  discountValue: number | null;
  oldPrice: number;
  oldStock: number;
}

export interface VariantPriceUpdate {
  variantId: bigint;
  newPrice: number;
  newCompareAtPrice: number | null;
  oldPrice: number;
  oldCompareAtPrice: number | null;
}

export interface ProductUpdatePlan {
  productData: Record<string, unknown>;
  mediaPayload?: Record<string, string | string[]>;
  simpleVariantSync?: SimpleVariantSyncData;
  variantPriceUpdates?: VariantPriceUpdate[];
}

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  collectionSlug?: string;
  collection?: string[];
  attributeValue?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  catalogSort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc';
}

export const PRODUCTS_REPOSITORY = Symbol('IProductsRepository');

export interface IProductsRepository {
  findAll(
    query: AdvancedQueryDto,
    langId?: string,
    options?: QueryOptions,
  ): Promise<PaginatedResult<Product> | Product[]>;
  createProductWithVariants(dto: unknown): Promise<Product | null>;
  findProductById(id: number | bigint): Promise<Product | null>;
  findStorefrontDetail(id: number | bigint, langId?: string): Promise<Record<string, unknown> | null>;
  findRelated(id: number | bigint, langId?: string, limit?: number): Promise<Record<string, unknown>[]>;
  findCatalog(query: CatalogQuery, langId?: string): Promise<Record<string, unknown>>;
  create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<Product>;
  executeUpdatePlan(id: number | bigint, plan: ProductUpdatePlan): Promise<Product>;
  delete(id: number | bigint): Promise<Product>;
}

export const VARIANTS_REPOSITORY = Symbol('IVariantsRepository');

export interface IVariantsRepository {
  findVariantById(id: number | bigint): Promise<ProductVariant | null>;
  createVariant(data: unknown, gallery?: string[]): Promise<ProductVariant>;
  updateVariant(id: number | bigint, data: unknown): Promise<ProductVariant>;
  adjustStock(
    variantId: number | bigint,
    amount: number,
    reason: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ProductVariant>;
  findActiveVariantsWithProduct(ids: bigint[], tx?: Prisma.TransactionClient): Promise<ProductVariantWithProduct[]>;
  findActiveVariantStocks(
    ids: bigint[],
    tx?: Prisma.TransactionClient,
  ): Promise<Array<{ id: bigint; stockQuantity: number }>>;
  reserveStock(variantId: bigint, quantity: number, reason: string, tx: Prisma.TransactionClient): Promise<boolean>;
  findAll(query: AdvancedQueryDto): Promise<PaginatedResult<ProductVariant> | ProductVariant[]>;
  create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<ProductVariant>;
  update(
    id: number | bigint,
    data: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<ProductVariant>;
  delete(id: number | bigint): Promise<ProductVariant>;
}
