import { AdvancedQueryDto } from '../dto/advanced-query.dto';
import { PaginatedResult } from '../dto/pagination.dto';

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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  attributes?: VariantAttribute[];
  gallery?: unknown;
}

export interface Product {
  id: bigint;
  collectionId: bigint | null;
  hasVariants: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: ProductTranslation[];
  variants: ProductVariant[];
  collection?: unknown;
  image?: unknown;
  gallery?: unknown[];
}

export const PRODUCTS_REPOSITORY = Symbol('IProductsRepository');

export interface IProductsRepository {
  createProductWithVariants(dto: unknown): Promise<Product | null>;
  findProductById(id: number | bigint): Promise<Product | null>;
  findAll(query: AdvancedQueryDto): Promise<PaginatedResult<Product> | Product[]>;
  create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<Product>;
  update(id: number | bigint, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<Product>;
  delete(id: number | bigint): Promise<Product>;
}

export const VARIANTS_REPOSITORY = Symbol('IVariantsRepository');

export interface IVariantsRepository {
  findVariantById(id: number | bigint): Promise<ProductVariant | null>;
  createVariant(data: unknown): Promise<ProductVariant>;
  updateVariant(id: number | bigint, data: unknown): Promise<ProductVariant>;
  adjustStock(variantId: number | bigint, amount: number, reason: string): Promise<ProductVariant>;
  findAll(query: AdvancedQueryDto): Promise<PaginatedResult<ProductVariant> | ProductVariant[]>;
  create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<ProductVariant>;
  update(id: number | bigint, data: Record<string, unknown>, options?: Record<string, unknown>): Promise<ProductVariant>;
  delete(id: number | bigint): Promise<ProductVariant>;
}