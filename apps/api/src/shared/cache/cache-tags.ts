export const CACHE_TTL = {
  public: 60,
  reference: 300,
} as const;

export const publicCacheTags = {
  home: 'content:home',
  settings: 'content:settings',
  products: 'catalog:products',
  product: (id: string | number | bigint) => `catalog:product:${id.toString()}`,
  collections: 'catalog:collections',
  countries: 'location:countries',
  cities: 'location:cities',
  attributes: 'catalog:attributes',
  staticPages: 'content:static-pages',
  showRooms: 'content:showrooms',
  sliders: 'content:sliders',
  faqs: 'content:faqs',
  reviews: (productId: string | number | bigint) => `reviews:product:${productId.toString()}`,
  dashboardHome: 'dashboard:home',
} as const;
