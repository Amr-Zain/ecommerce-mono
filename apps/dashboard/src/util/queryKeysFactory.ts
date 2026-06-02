export const usersQueryKeys = {
  all: () => ['users'],
  usersFilterd: ({
    page,
    is_active,
    is_ban,
    keyword,
  }: {
    page?: string
    is_ban?: string
    is_active?: string
    keyword?: string
  }) => [
    ...usersQueryKeys.all(),
    { page },
    { is_active },
    { is_ban },
    { keyword },
  ],
  getUser: (userId: string) => [usersQueryKeys.all(), 'one', { userId }],
}
export const citiesQueryKeys = {
  all: () => ['cities'],
  paginate: () => [...citiesQueryKeys.all(), 'paginate'],
  getCity: (cityId?: string | number) => [
    ...citiesQueryKeys.all(),
    'one',
    { cityId },
  ],
  filterd: (params: {
    page?: string
    is_active?: string
    sort?: string
    created_at?: string
    search?: string
    country_id?: string
  }) => {
    const cleaned = Object.fromEntries(
      Object.entries(params ?? {}).filter(
        ([, v]) => v !== undefined && v !== '',
      ),
    )
    return [...citiesQueryKeys.paginate(), cleaned]
  },
}
export const countriesQueryKeys = {
  all: () => ['countries'],
  getCountry: (countryId?: string) => [
    ...countriesQueryKeys.all(),
    'one',
    'paginate',
    { countryId },
  ],
  filterd: (search: any) => [...countriesQueryKeys.all(), search] as const,
}

export const pagesQueryKeys = {
  all: () => ['static-pages'],
  getPage: (pageId?: string) => [...pagesQueryKeys.all(), 'one', { pageId }],
  filterd: (search: any) => {
    const cleaned = Object.fromEntries(
      Object.entries(search ?? {}).filter(
        ([, v]) => v !== undefined && v !== '',
      ),
    )
    return [...pagesQueryKeys.all(), 'paginate', cleaned] as const
  },
}
export const supervisorsQueryKeys = {
  all: () => ['supervisors', 'paginate'],
  get: (supervisorsId?: string) => [
    ...supervisorsQueryKeys.all(),
    'one',
    { supervisorsId },
  ],
  filterd: (search: any) => [...supervisorsQueryKeys.all(), search] as const,
}
export const rolesQueryKeys = {
  all: () => ['roles'] as const,
  get: (roleId?: string) =>
    [...rolesQueryKeys.all(), 'one', { roleId }] as const,
  filterd: (search: any) => [...rolesQueryKeys.all(), search] as const,
}

export const categoriesQueryKeys = {
  all: () => ['categories'] as const,
  getCategory: (categoryId?: string) =>
    [...categoriesQueryKeys.all(), 'one', { categoryId }] as const,
  filterdNotPage: (search: any) =>
    [...categoriesQueryKeys.all(), search] as const,
  filterd: (search: any) =>
    [...categoriesQueryKeys.all(), 'paginated', search] as const,
}
export const faqQueryKeys = {
  all: () => ['faqs'] as const,
  filterd: (params: unknown) =>
    [...faqQueryKeys.all(), 'filtered', params] as const,
  getFaq: (id: string) => [...faqQueryKeys.all(), 'one', id] as const,
}
export const showRoomsQueryKeys = {
  all: () => ['show-rooms'] as const,
  filterd: (params: unknown) =>
    [...showRoomsQueryKeys.all(), 'filtered', params] as const,
  getShowRoom: (id: string) =>
    [...showRoomsQueryKeys.all(), 'one', id] as const,
}
// notifications
export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (params?: unknown) =>
    [...notificationsQueryKeys.all, 'list', params] as const,
  filterd: (params?: unknown) =>
    [...notificationsQueryKeys.all, 'filtered', params] as const,
  getNotification: (id: string | number) =>
    [...notificationsQueryKeys.all, 'one', id] as const,
}

export const attributeQueryKeys = {
  all: () => ['attributes'] as const,
  paginate: () => [...attributeQueryKeys.all(), 'list'] as const,
  filterd: (params: unknown) =>
    [...attributeQueryKeys.paginate(), params] as const,
  getAttribute: (id: string) =>
    [...attributeQueryKeys.all(), 'one', id] as const,
}
export const attributeValueQueryKeys = {
  all: () => ['values'] as const,
  filtered: (params: unknown) => ['values', 'list', params] as const,
  getValue: (id: string) => ['values', 'show', id] as const,
}

export const productsQueryKeys = {
  all: (search?: string) => ['products', { search }] as const,
  paginate: () => [...productsQueryKeys.all(), 'list'] as const,
  filterd: (params: unknown) =>
    [...productsQueryKeys.paginate(), params] as const,
  getProduct: (id: string) => [...productsQueryKeys.all(), 'one', id] as const,
}
export const slidersQueryKeys = {
  all: () => ['sliders'] as const,
  filterd: (filters?: Record<string, any>) =>
    ['sliders', 'filterd', filters] as const,
  getSlider: (id: string | number) => ['sliders', 'one', id] as const,
}

export const earningRulesQueryKeys = {
  all: () => ['earning-rules'] as const,
  filterd: (params: Record<string, unknown>) =>
    ['earning-rules', 'list', 'paginate', params] as const,
  getEarningRule: (id: string | number) =>
    ['earning-rules', 'show', String(id)] as const,
}
export const rewardsQueryKeys = {
  all: () => ['rewards'] as const,
  filtered: (params: Record<string, unknown>) =>
    ['rewards', 'list', 'paginate', params] as const,
  getReward: (id: string | number) => ['rewards', 'show', String(id)] as const,
}

export const offersQueryKeys = {
  all: () => ['offers'] as const,
  filterd: (filters?: Record<string, any>) =>
    ['offers', 'filterd', filters] as const,
  getOffer: (id: string | number) => ['offers', 'one', id] as const,
}

export const couponsQueryKeys = {
  all: () => ['coupons'] as const,
  filterd: (filters?: unknown) => ['coupons', 'filterd', filters] as const,
  getCoupon: (id: string | number) => ['coupons', 'one', id] as const,
}

export const reviewsQueryKeys = {
  all: () => ['reviews'] as const,
  filterd: (filters?: Record<string, any>) =>
    ['reviews', 'filterd', filters] as const,
  getReview: (id: string | number) => ['reviews', 'one', id] as const,
}

export const ordersQueryKeys = {
  all: () => ['orders'] as const,
  filterd: (filters?: Record<string, any>) =>
    ['orders', 'filterd', filters] as const,
  getOrder: (id: string | number) => ['orders', 'one', id] as const,
}

export const paymentGatewaysQueryKeys = {
  all: () => ['payment-gateways'] as const,
  filterd: (params?: unknown) =>
    [...paymentGatewaysQueryKeys.all(), 'filtered', params] as const,
  getPaymentGateway: (id: string | number) =>
    [...paymentGatewaysQueryKeys.all(), 'one', String(id)] as const,
}

export const smsProvidersQueryKeys = {
  all: () => ['sms-providers'] as const,
  filterd: (params?: unknown) =>
    [...smsProvidersQueryKeys.all(), 'filtered', params] as const,
  getSmsProvider: (id: string | number) =>
    [...smsProvidersQueryKeys.all(), 'one', String(id)] as const,
}

export const paymentSessionsQueryKeys = {
  all: () => ['payment-sessions'] as const,
  filterd: (params?: unknown) =>
    [...paymentSessionsQueryKeys.all(), 'filtered', params] as const,
  getPaymentSession: (id: string | number) =>
    [...paymentSessionsQueryKeys.all(), 'one', String(id)] as const,
}
export const smsSessionsQueryKeys = {
  all: () => ['sms-sessions'] as const,
  filterd: (params?: unknown) =>
    [...smsSessionsQueryKeys.all(), 'filtered', params] as const,
  getSmsSession: (id: string | number) =>
    [...smsSessionsQueryKeys.all(), 'one', String(id)] as const,
}
export const userQueryKeys = {
  all: () => ['users'] as const,
  filterd: (params?: unknown) =>
    [...userQueryKeys.all(), 'filtered', params] as const,
  getUser: (id: string | number) =>
    [...userQueryKeys.all(), 'one', String(id)] as const,
}

export const tiersQueryKeys = {
  all: () => ['tiers'] as const,
  filterd: (params?: unknown) =>
    [...tiersQueryKeys.all(), 'filtered', params] as const,
  getTier: (id: string | number) =>
    [...tiersQueryKeys.all(), 'one', String(id)] as const,
}

export const dashboardQueryKeys = {
  all: () => ['dashboard'] as const,
  statistics: () => [...dashboardQueryKeys.all(), 'statistics'] as const,
}

export const settingsQueryKeys = {
  all: () => ['settings'] as const,
  list: (params?: unknown) =>
    [...settingsQueryKeys.all(), 'list', params] as const,
}

export const shopifyStoresQueryKeys = {
  all: () => ['shopify-stores'] as const,
  filterd: (params?: unknown) =>
    [...shopifyStoresQueryKeys.all(), 'filtered', params] as const,
  getStore: (id: string | number) =>
    [...shopifyStoresQueryKeys.all(), 'one', String(id)] as const,
}

export const adminNotificationsQueryKeys = {
  all: () => ['admin-notifications'] as const,
  filterd: (params?: unknown) =>
    [...adminNotificationsQueryKeys.all(), 'filtered', params] as const,
  get: (id: string | number) =>
    [...adminNotificationsQueryKeys.all(), 'one', String(id)] as const,
}
