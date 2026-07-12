export type LocalizedText = {
  en: string;
  ar: string;
};

export type SearchAttributeDocument = {
  attributeId: string;
  valueId: string;
  attribute: LocalizedText;
  value: LocalizedText;
};

export type SearchVariantDocument = {
  id: string;
  price: number;
  compareAtPrice: number | null;
  discountPercentage: number;
  stockQuantity: number;
  isDefault: boolean;
  sku: string | null;
  barcode: string | null;
  attributes: SearchAttributeDocument[];
};

export type SearchCollectionReference = {
  id: string;
  slug: string;
  name: LocalizedText;
  ancestors: Array<{ id: string; slug: string; name: LocalizedText }>;
};

export type SearchProductDocument = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  collection: SearchCollectionReference | null;
  image: string | null;
  variants: SearchVariantDocument[];
  rating: number;
  reviewsCount: number;
  sales90d: number;
  available: boolean;
  popularity: number;
};

export type SearchCollectionDocument = {
  id: string;
  slug: string;
  parentId: string | null;
  name: LocalizedText;
  description: LocalizedText;
  ancestors: Array<{ id: string; slug: string; name: LocalizedText }>;
  image: string | null;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogChangePayload = {
  entity: 'product' | 'collection' | 'attribute' | 'review' | 'media' | 'order';
  entityId: string;
  productId?: string;
  collectionId?: string;
  attributeId?: string;
  orderId?: string;
  model?: string;
  modelId?: string;
};
