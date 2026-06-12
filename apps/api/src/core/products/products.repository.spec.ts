import { QueryBuilderService } from '@/common/services/query-builder.service';
import { ProductsRepository } from './products.repository';

const attribute = (attributeId: bigint, valueId: bigint, attributeName: string, valueName: string) => ({
  productId: 1n,
  productVariantId: 1n,
  attributeId,
  valueId,
  attribute: { id: attributeId, createdAt: new Date(), translations: [{ name: attributeName }] },
  value: { id: valueId, attributeId, createdAt: new Date(), isActive: true, translations: [{ name: valueName }] },
});

const variant = (id: bigint, price: number, stockQuantity: number, attributes: ReturnType<typeof attribute>[]) => ({
  id,
  productId: 1n,
  price,
  compareAtPrice: price + 20,
  costPrice: null,
  discountType: null,
  discountValue: null,
  stockQuantity,
  barcode: null,
  sku: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  attributes,
});

function createRepository(products: unknown[]) {
  const prisma = {
    product: {
      findMany: jest.fn().mockResolvedValue(products),
    },
    collection: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
  const media = {
    findProductImagePaths: jest.fn().mockResolvedValue(products.map(() => null)),
  };
  return new ProductsRepository(
    prisma as never,
    media as never,
    new QueryBuilderService(),
    { computePrice: jest.fn() } as never,
  );
}

describe('ProductsRepository.findCatalog', () => {
  it('requires all selected attributes to match the same variant', async () => {
    const product = {
      id: 1n,
      collectionId: null,
      hasVariants: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      translations: [{ name: 'Ring', description: '' }],
      collection: null,
      reviews: [],
      variants: [
        variant(1n, 100, 5, [attribute(10n, 101n, 'Color', 'Red'), attribute(20n, 201n, 'Size', 'Small')]),
        variant(2n, 120, 5, [attribute(10n, 102n, 'Color', 'Blue'), attribute(20n, 202n, 'Size', 'Large')]),
      ],
    };
    const result = await createRepository([product]).findCatalog({
      attributeValue: ['101', '202'],
    });

    expect(result.items).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('uses an in-stock matching variant before a cheaper out-of-stock variant', async () => {
    const product = {
      id: 1n,
      collectionId: null,
      hasVariants: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      translations: [{ name: 'Ring', description: '' }],
      collection: null,
      reviews: [{ rating: 5 }],
      variants: [
        variant(1n, 80, 0, [attribute(10n, 101n, 'Color', 'Red')]),
        variant(2n, 100, 3, [attribute(10n, 101n, 'Color', 'Red')]),
      ],
    };
    const result = await createRepository([product]).findCatalog({});
    const item = (result.items as Array<{ representativeVariant: { id: bigint; available: boolean } }>)[0];

    expect(item.representativeVariant).toMatchObject({ id: 2n, available: true });
  });
});
