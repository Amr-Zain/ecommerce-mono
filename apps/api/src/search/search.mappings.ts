const localizedName = {
  properties: {
    en: {
      type: 'search_as_you_type',
      analyzer: 'english_name',
      search_analyzer: 'english_name',
    },
    ar: {
      type: 'search_as_you_type',
      analyzer: 'arabic_name',
      search_analyzer: 'arabic_name',
    },
  },
};

const localizedDescription = {
  properties: {
    en: { type: 'text', analyzer: 'english' },
    ar: { type: 'text', analyzer: 'arabic' },
  },
};

export function searchIndexSettings(replicas: number) {
  return {
    number_of_shards: 1,
    number_of_replicas: replicas,
    analysis: {
      analyzer: {
        english_name: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
        arabic_name: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'decimal_digit', 'arabic_normalization'],
        },
      },
      normalizer: {
        exact_normalizer: {
          type: 'custom',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  };
}

export const productSearchMapping = {
  dynamic: 'strict',
  properties: {
    id: { type: 'keyword' },
    name: localizedName,
    description: localizedDescription,
    tags: { type: 'text', fields: { keyword: { type: 'keyword', normalizer: 'exact_normalizer' } } },
    isActive: { type: 'boolean' },
    createdAt: { type: 'date' },
    image: { type: 'keyword', index: false },
    available: { type: 'boolean' },
    rating: { type: 'float' },
    reviewsCount: { type: 'integer' },
    sales90d: { type: 'integer' },
    popularity: { type: 'float' },
    collection: {
      properties: {
        id: { type: 'keyword' },
        slug: { type: 'keyword' },
        name: localizedName,
        ancestors: {
          properties: {
            id: { type: 'keyword' },
            slug: { type: 'keyword' },
            name: localizedName,
          },
        },
      },
    },
    variants: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        price: { type: 'scaled_float', scaling_factor: 100 },
        compareAtPrice: { type: 'scaled_float', scaling_factor: 100 },
        discountPercentage: { type: 'integer' },
        stockQuantity: { type: 'integer' },
        isDefault: { type: 'boolean' },
        sku: { type: 'keyword', normalizer: 'exact_normalizer' },
        barcode: { type: 'keyword', normalizer: 'exact_normalizer' },
        attributes: {
          type: 'nested',
          properties: {
            attributeId: { type: 'keyword' },
            valueId: { type: 'keyword' },
            attribute: localizedName,
            value: localizedName,
          },
        },
      },
    },
  },
};

export const collectionSearchMapping = {
  dynamic: 'strict',
  properties: {
    id: { type: 'keyword' },
    slug: { type: 'keyword' },
    parentId: { type: 'keyword' },
    name: localizedName,
    description: localizedDescription,
    image: { type: 'keyword', index: false },
    productCount: { type: 'integer' },
    sortOrder: { type: 'integer' },
    isActive: { type: 'boolean' },
    ancestors: {
      properties: {
        id: { type: 'keyword' },
        slug: { type: 'keyword' },
        name: localizedName,
      },
    },
  },
};
