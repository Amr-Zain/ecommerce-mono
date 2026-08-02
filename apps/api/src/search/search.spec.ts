import { SearchDocumentRepository } from './search-document.repository';
import { collectionSearchMapping, productSearchMapping, searchIndexSettings } from './search.mappings';
import type { SearchVariantDocument } from './search.types';
import { fuzzyTextScore, normalizeSearchText } from './search-text.util';

const variant = (input: Partial<SearchVariantDocument> & Pick<SearchVariantDocument, 'id'>): SearchVariantDocument => ({
  id: input.id,
  price: input.price ?? 100,
  compareAtPrice: input.compareAtPrice ?? null,
  discountPercentage: input.discountPercentage ?? 0,
  stockQuantity: input.stockQuantity ?? 0,
  isDefault: input.isDefault ?? false,
  sku: input.sku ?? null,
  barcode: input.barcode ?? null,
  attributes: input.attributes ?? [],
});

describe('storefront search foundation', () => {
  const documents = new SearchDocumentRepository({} as never);

  it('prefers an in-stock default variant over cheaper alternatives', () => {
    const selected = documents.pickRepresentativeVariant([
      variant({ id: '1', price: 50, stockQuantity: 10 }),
      variant({ id: '2', price: 100, stockQuantity: 2, isDefault: true }),
    ]);

    expect(selected).toMatchObject({ id: '2', isDefault: true, stockQuantity: 2 });
  });

  it('prefers an in-stock variant when the default is unavailable', () => {
    const selected = documents.pickRepresentativeVariant([
      variant({ id: '1', price: 100, stockQuantity: 0, isDefault: true }),
      variant({ id: '2', price: 120, stockQuantity: 1 }),
    ]);

    expect(selected).toMatchObject({ id: '2', stockQuantity: 1 });
  });

  it('defines strict multilingual product and collection mappings', () => {
    expect(productSearchMapping.dynamic).toBe('strict');
    expect(productSearchMapping.properties.name.properties.ar).toMatchObject({
      type: 'search_as_you_type',
      analyzer: 'arabic_name',
    });
    expect(productSearchMapping.properties.variants.type).toBe('nested');
    expect(collectionSearchMapping.properties.name.properties.en.type).toBe('search_as_you_type');
  });

  it('uses a single shard and configurable replicas', () => {
    expect(searchIndexSettings(1)).toMatchObject({ number_of_shards: 1, number_of_replicas: 1 });
  });

  it('matches bounded English typos and adjacent-letter swaps', () => {
    expect(fuzzyTextScore('Classic Zircon Ring', 'zircn')).toBeGreaterThan(0);
    expect(fuzzyTextScore('Classic Zircon Ring', 'rign')).toBeGreaterThan(0);
    expect(fuzzyTextScore('Classic Zircon Ring', 'unrelated')).toBeNull();
  });

  it('normalizes Arabic letters and supports a one-character typo', () => {
    expect(normalizeSearchText('إكسسوارات')).toBe('اكسسوارات');
    expect(fuzzyTextScore('خاتم زركون كلاسيكي', 'زركون')).toBeGreaterThan(0);
    expect(fuzzyTextScore('خاتم زركون كلاسيكي', 'زركن')).toBeGreaterThan(0);
  });
});
