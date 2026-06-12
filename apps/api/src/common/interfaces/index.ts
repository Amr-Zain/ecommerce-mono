export type { IBaseRepository } from './base.repository.interface';
export type { CountryTranslation, Country, ICountriesRepository } from './countries.interface';
export { COUNTRIES_REPOSITORY } from './countries.interface';
export type { CityTranslation, City, ICitiesRepository } from './cities.interface';
export { CITIES_REPOSITORY } from './cities.interface';
export type { SliderTranslation, Slider, ISlidersRepository } from './sliders.interface';
export { SLIDERS_REPOSITORY } from './sliders.interface';
export type { FaqTranslation, Faq, IFaqsRepository } from './faqs.interface';
export { FAQS_REPOSITORY } from './faqs.interface';
export type { CollectionTranslation, Collection, ICollectionsRepository } from './collections.interface';
export { COLLECTIONS_REPOSITORY } from './collections.interface';
export type {
  ProductTranslation,
  ProductVariant,
  VariantAttribute,
  Product,
  IProductsRepository,
  IVariantsRepository,
  SimpleVariantSyncData,
  VariantPriceUpdate,
  ProductUpdatePlan,
  CatalogQuery,
} from './products.interface';
export { PRODUCTS_REPOSITORY, VARIANTS_REPOSITORY } from './products.interface';
export type {
  AttributeTranslation,
  AttributeValueTranslation,
  AttributeValue,
  Attribute,
  IAttributesRepository,
  IAttributeValuesRepository,
} from './attributes.interface';
export { ATTRIBUTES_REPOSITORY, ATTRIBUTE_VALUES_REPOSITORY } from './attributes.interface';
export type {
  StaticPageTranslation,
  PageSectionTranslation,
  PageSection,
  StaticPage,
  IStaticPagesRepository,
} from './static-pages.interface';
export { STATIC_PAGES_REPOSITORY } from './static-pages.interface';
export type { RoleTranslation, Permission, Role, IRolesRepository } from './roles.interface';
export { ROLES_REPOSITORY } from './roles.interface';
export type { Address, User, GuestMigrationResult, IUsersRepository } from './users.interface';
export { USERS_REPOSITORY } from './users.interface';
export type {
  AdminReview,
  AdminReviewProduct,
  AdminReviewUser,
  ClientReview,
  ClientReviewUser,
  IReviewsRepository,
  ReviewOwner,
} from './reviews.interface';
export { REVIEWS_REPOSITORY } from './reviews.interface';
export type { ShowRoomTranslation, ShowRoom, IShowRoomsRepository } from './show-rooms.interface';
export { SHOW_ROOMS_REPOSITORY } from './show-rooms.interface';
export type { CartItem, Cart, ICartsRepository } from './carts.interface';
export { CARTS_REPOSITORY } from './carts.interface';
export type { Coupon, ICouponsRepository } from './coupons.interface';
export { COUPONS_REPOSITORY } from './coupons.interface';
export type {
  Order,
  AdminOrderRecord,
  ClientOrderRecord,
  OrderLifecycleRecord,
  IOrdersRepository,
} from './orders.interface';
export { ORDERS_REPOSITORY } from './orders.interface';

export type { IPaymentTransactionsRepository } from './payment-transactions.interface';
export { PAYMENT_TRANSACTIONS_REPOSITORY } from './payment-transactions.interface';
export type { IReturnRequestsRepository } from './return-requests.interface';
export { RETURN_REQUESTS_REPOSITORY } from './return-requests.interface';
export type { IExchangeRequestsRepository } from './exchange-requests.interface';
export { EXCHANGE_REQUESTS_REPOSITORY } from './exchange-requests.interface';
