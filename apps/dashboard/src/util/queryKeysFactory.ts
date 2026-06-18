export const queryKeys = {
  users: {
    all: () => ['users'],
    usersFilterd: ({
      page,
      is_active,
      is_ban,
      keyword,
    }: {
      page?: string
      is_active?: string
      is_ban?: string
      keyword?: string
    }) => [
      ...queryKeys.users.all(),
      { page },
      { is_active },
      { is_ban },
      { keyword },
    ],
    getUser: (userId: string) => [queryKeys.users.all(), 'one', { userId }],
  },

  cities: {
    all: () => ['cities'],
    paginate: () => [...queryKeys.cities.all(), 'paginate'],
    getCity: (cityId?: string | number) => [
      ...queryKeys.cities.all(),
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
      return [...queryKeys.cities.paginate(), cleaned]
    },
  },

  countries: {
    all: () => ['countries'],
    getCountry: (countryId?: string) => [
      ...queryKeys.countries.all(),
      'one',
      'paginate',
      { countryId },
    ],
    filterd: (search: any) => [...queryKeys.countries.all(), search] as const,
  },

  pages: {
    all: () => ['static-pages'],
    getPage: (pageId?: string) => [...queryKeys.pages.all(), 'one', { pageId }],
    filterd: (search: any) => {
      const cleaned = Object.fromEntries(
        Object.entries(search ?? {}).filter(
          ([, v]) => v !== undefined && v !== '',
        ),
      )
      return [...queryKeys.pages.all(), 'paginate', cleaned] as const
    },
  },

  supervisors: {
    all: () => ['supervisors', 'paginate'],
    get: (supervisorsId?: string) => [
      ...queryKeys.supervisors.all(),
      'one',
      { supervisorsId },
    ],
    filterd: (search: any) =>
      [...queryKeys.supervisors.all(), search] as const,
  },

  roles: {
    all: () => ['roles'] as const,
    get: (roleId?: string) =>
      [...queryKeys.roles.all(), 'one', { roleId }] as const,
    filterd: (search: any) => [...queryKeys.roles.all(), search] as const,
  },

  categories: {
    all: () => ['categories'] as const,
    getCategory: (categoryId?: string) =>
      [...queryKeys.categories.all(), 'one', { categoryId }] as const,
    filterdNotPage: (search: any) =>
      [...queryKeys.categories.all(), search] as const,
    filterd: (search: any) =>
      [...queryKeys.categories.all(), 'paginated', search] as const,
  },

  faqs: {
    all: () => ['faqs'] as const,
    filterd: (params: unknown) =>
      [...queryKeys.faqs.all(), 'filtered', params] as const,
    getFaq: (id: string) => [...queryKeys.faqs.all(), 'one', id] as const,
  },

  showRooms: {
    all: () => ['show-rooms'] as const,
    filterd: (params: unknown) =>
      [...queryKeys.showRooms.all(), 'filtered', params] as const,
    getShowRoom: (id: string) =>
      [...queryKeys.showRooms.all(), 'one', id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (params?: unknown) =>
      [...queryKeys.notifications.all, 'list', params] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.notifications.all, 'filtered', params] as const,
    getNotification: (id: string | number) =>
      [...queryKeys.notifications.all, 'one', id] as const,
  },

  attributes: {
    all: () => ['attributes'] as const,
    paginate: () => [...queryKeys.attributes.all(), 'list'] as const,
    filterd: (params: unknown) =>
      [...queryKeys.attributes.paginate(), params] as const,
    getAttribute: (id: string) =>
      [...queryKeys.attributes.all(), 'one', id] as const,
  },

  attributeValues: {
    all: () => ['values'] as const,
    filtered: (params: unknown) => ['values', 'list', params] as const,
    getValue: (id: string) => ['values', 'show', id] as const,
  },

  products: {
    all: (search?: string) => ['products', { search }] as const,
    paginate: () => [...queryKeys.products.all(), 'list'] as const,
    filterd: (params: unknown) =>
      [...queryKeys.products.paginate(), params] as const,
    getProduct: (id: string) =>
      [...queryKeys.products.all(), 'one', id] as const,
  },

  sliders: {
    all: () => ['sliders'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['sliders', 'filterd', filters] as const,
    getSlider: (id: string | number) => ['sliders', 'one', id] as const,
  },

  earningRules: {
    all: () => ['earning-rules'] as const,
    filterd: (params: Record<string, unknown>) =>
      ['earning-rules', 'list', 'paginate', params] as const,
    getEarningRule: (id: string | number) =>
      ['earning-rules', 'show', String(id)] as const,
  },

  rewards: {
    all: () => ['rewards'] as const,
    filtered: (params: Record<string, unknown>) =>
      ['rewards', 'list', 'paginate', params] as const,
    getReward: (id: string | number) =>
      ['rewards', 'show', String(id)] as const,
  },

  offers: {
    all: () => ['offers'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['offers', 'filterd', filters] as const,
    getOffer: (id: string | number) => ['offers', 'one', id] as const,
  },

  coupons: {
    all: () => ['coupons'] as const,
    filterd: (filters?: unknown) => ['coupons', 'filterd', filters] as const,
    getCoupon: (id: string | number) => ['coupons', 'one', id] as const,
  },

  reviews: {
    all: () => ['reviews'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['reviews', 'filterd', filters] as const,
    getReview: (id: string | number) => ['reviews', 'one', id] as const,
  },

  orders: {
    all: () => ['orders'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['orders', 'filterd', filters] as const,
    getOrder: (id: string | number) => ['orders', 'one', id] as const,
  },

  returns: {
    all: () => ['returns'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['returns', 'filterd', filters] as const,
    getReturn: (id: string | number) => ['returns', 'one', id] as const,
  },

  tickets: {
    all: () => ['tickets'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['tickets', 'filterd', filters] as const,
    getTicket: (id: string | number) => ['tickets', 'one', id] as const,
    messages: (id: string | number) => ['tickets', 'one', id, 'messages'] as const,
  },

  exchanges: {
    all: () => ['exchanges'] as const,
    filterd: (filters?: Record<string, any>) =>
      ['exchanges', 'filterd', filters] as const,
    getExchange: (id: string | number) => ['exchanges', 'one', id] as const,
  },

  paymentGateways: {
    all: () => ['payment-gateways'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.paymentGateways.all(), 'filtered', params] as const,
    getPaymentGateway: (id: string | number) =>
      [...queryKeys.paymentGateways.all(), 'one', String(id)] as const,
  },

  smsProviders: {
    all: () => ['sms-providers'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.smsProviders.all(), 'filtered', params] as const,
    getSmsProvider: (id: string | number) =>
      [...queryKeys.smsProviders.all(), 'one', String(id)] as const,
  },

  paymentSessions: {
    all: () => ['payment-sessions'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.paymentSessions.all(), 'filtered', params] as const,
    getPaymentSession: (id: string | number) =>
      [...queryKeys.paymentSessions.all(), 'one', String(id)] as const,
  },

  smsSessions: {
    all: () => ['sms-sessions'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.smsSessions.all(), 'filtered', params] as const,
    getSmsSession: (id: string | number) =>
      [...queryKeys.smsSessions.all(), 'one', String(id)] as const,
  },

  user: {
    all: () => ['users'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.user.all(), 'filtered', params] as const,
    getUser: (id: string | number) =>
      [...queryKeys.user.all(), 'one', String(id)] as const,
  },

  tiers: {
    all: () => ['tiers'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.tiers.all(), 'filtered', params] as const,
    getTier: (id: string | number) =>
      [...queryKeys.tiers.all(), 'one', String(id)] as const,
  },

  dashboard: {
    all: () => ['dashboard'] as const,
    statistics: () => [...queryKeys.dashboard.all(), 'statistics'] as const,
  },

  settings: {
    all: () => ['settings'] as const,
    list: (params?: unknown) =>
      [...queryKeys.settings.all(), 'list', params] as const,
  },

  shopifyStores: {
    all: () => ['shopify-stores'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.shopifyStores.all(), 'filtered', params] as const,
    getStore: (id: string | number) =>
      [...queryKeys.shopifyStores.all(), 'one', String(id)] as const,
  },

  adminNotifications: {
    all: () => ['admin-notifications'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.adminNotifications.all(), 'filtered', params] as const,
    get: (id: string | number) =>
      [...queryKeys.adminNotifications.all(), 'one', String(id)] as const,
  },

  messageTemplates: {
    all: () => ['message-templates'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.messageTemplates.all(), 'filtered', params] as const,
    get: (id: string | number) =>
      [...queryKeys.messageTemplates.all(), 'one', String(id)] as const,
  },

  messageCampaigns: {
    all: () => ['message-campaigns'] as const,
    filterd: (params?: unknown) =>
      [...queryKeys.messageCampaigns.all(), 'filtered', params] as const,
    get: (id: string | number) =>
      [...queryKeys.messageCampaigns.all(), 'one', String(id)] as const,
  },
}
