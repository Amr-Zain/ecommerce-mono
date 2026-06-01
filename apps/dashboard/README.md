# E-Commerce Admin Dashboard

Admin dashboard for managing the e-commerce platform, built with React, TanStack Router, and TanStack Query.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Routing:** TanStack Router (file-based)
- **Data Fetching:** TanStack Query + Axios
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + custom `@ecommerce/ui` package
- **Rich Text Editor:** TipTap
- **Charts:** Recharts
- **i18n:** i18next

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the dashboard root:

```bash
# Base URL for the backend API (used by axios interceptors)
VITE_BASE_URL=http://localhost:3000

# API base URL (used for file uploads, auth refresh, notifications)
VITE_BASE_URL_API=http://localhost:3000

# General base URL (optional, for general endpoints)
VITE_BASE_GENERAL_URL=http://localhost:3000

# Google Maps API key (for map fields)
VITE_GOOGLE_MAPS_API_KEY=
```

### Running

```bash
pnpm dev
```

Starts the dev server on port 3001.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (port 3001) |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm check` | Format + lint fix |
| `pnpm typecheck` | Type-check with TypeScript |

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   └── form/          # Reusable form fields (Field component)
│   ├── layout/            # Sidebar, Header, Notifications
│   └── pagesComponents/   # Per-page components (Config, Form, etc.)
├── hooks/                 # Custom hooks (UseFetch, UseMutate)
├── i18n/                  # i18next configuration
├── routes/
│   ├── __root.tsx         # Root layout
│   └── _main/             # Authenticated routes
│       ├── route.tsx      # Main layout (auth guard)
│       └── [module]/      # CRUD modules
├── services/              # Axios instance, API helpers
├── stores/                # Zustand stores (auth, alerts)
├── styles/                # Global styles
├── types/                 # TypeScript types
└── util/                  # Helpers, query key factories
```

## CRUD Modules

Each module follows a consistent pattern with two parts: **Routes** (page components) and a **Config** (shared definitions).

### File Structure

```
src/
├── routes/_main/[module]/
│   ├── index.tsx              # List page
│   ├── add.tsx                # Create page
│   ├── edit/$id.tsx           # Edit page
│   └── show/$id.tsx           # Detail page (optional)
│
└── components/pagesComponents/[Module]/
    ├── Config.tsx             # Columns, actions, filters, form fields
    ├── index.tsx              # Table component (list view)
    ├── Form.tsx               # Form component (add/edit)
    └── show/                  # Detail view (optional)
```

### Route Files

**List (`index.tsx`)** - Fetches paginated data with search/filter params:

```tsx
// src/routes/_main/roles/index.tsx
const endpoint = `roles?paginate=0`

export const Route = createFileRoute('/_main/roles/')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'index')  // Permission guard
    return context
  },
  validateSearch: (search) => searchParamsValidate(search),
  loaderDeps: ({ search }) => ({ search: searchParamsValidate(search) }),
  pendingComponent: () => <TableLoader breadcrumbs={{ entityKey: 'menu.roles' }} />,
  loader: ({ context, deps: { search } }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: rolesQueryKeys.filterd(search),
        endpoint,
        params: search,
      }),
    )
  },
})

function Index() {
  const search = Route.useLoaderDeps().search
  const { data } = useFetch<ApiResponseBase<Role[]>>({
    queryKey: rolesQueryKeys.filterd(search),
    endpoint,
    suspense: true,
    params: search,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" />
      <RolesTable data={data!} />
    </>
  )
}
```

**Add (`add.tsx`)** - Renders form without initial data:

```tsx
export const Route = createFileRoute('/_main/roles/add')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'store')
    return context
  },
  component: RouteComponent,
  pendingComponent: () => <RoleFormSkeleton />,
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="add" />
      <RoleForm />
    </>
  )
}
```

**Edit (`edit/$id.tsx`)** - Prefetches existing record, passes to form:

```tsx
export const Route = createFileRoute('/_main/roles/edit/$id')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'update')
    return context
  },
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: rolesQueryKeys.get(params.id),
        endpoint: `roles/${params.id}`,
      }),
    )
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useFetch<ApiResponseBase<Role>, Role>({
    queryKey: rolesQueryKeys.get(id),
    endpoint: `roles/${id}`,
    suspense: true,
    select: (data) => data.data as unknown as Role,
  })
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="edit" />
      <RoleForm role={data} />
    </>
  )
}
```

**Show (`show/$id.tsx`)** - Detail/read-only view:

```tsx
export const Route = createFileRoute('/_main/roles/show/$id')({
  beforeLoad: ({ context }) => {
    routePermission('roles', 'show')
    return context
  },
  loader: ({ context, params }) => {
    const { queryClient } = context as RouterContext
    queryClient.ensureQueryData(
      prefetchOptions({
        queryKey: rolesQueryKeys.get(params.id),
        endpoint: `roles/${params.id}`,
      }),
    )
  },
})

function RouteComponent() {
  return (
    <>
      <SmartBreadcrumbs entityKey="menu.roles" entityTo="/roles" action="show" />
      <RoleShow />
    </>
  )
}
```

### Config.tsx

Each module has a `Config.tsx` that exports 4 things: **Type**, **Columns**, **Actions**, **Filters**, and **Form Fields**.

```tsx
// src/components/pagesComponents/Roles/Config.tsx

import { ColumnDef } from '@tanstack/react-table'
import { textColumn, booleanControlColumn, createdAtColumn } from '@/components/features/sharedColumns'
import { Filter, RowAction } from '@/types/components/table'
import { PickedAction } from '@/hooks/useStatusMutations'
import { FieldProp } from '@/types/components/form'

/* ---------- TYPE ---------- */
export type Role = {
  id: number
  name: string
  is_active: boolean
  created_at: string
}

/* ---------- TABLE COLUMNS ---------- */
export const roleColumns = (
  open: (type: PickedAction, row: Role) => void,
): ColumnDef<Role>[] => [
  textColumn<Role>('name', 'table.columns.name'),
  booleanControlColumn<Role>(
    'is_active',
    'table.columns.status',
    open,          // Opens activate/deactivate modal
    'active',
    true,          // Default value
    'roles',       // Query key prefix for invalidation
  ),
  createdAtColumn<Role>(),
]

/* ---------- ROW ACTIONS ---------- */
export const actions = (
  t: (key: string) => string,
  open: (type: PickedAction, row: Role) => void,
) => [
  {
    label: t('actions.show'),
    to: '/roles/show/$id',
    params: (r: Role) => ({ id: String(r.id) }),
    permission: 'roles',
    action: 'show',
  },
  {
    label: t('actions.edit'),
    to: '/roles/edit/$id',
    params: (r: Role) => ({ id: String(r.id) }),
    permission: 'roles',
    action: 'update',
  },
  {
    label: (r: Role) => t(`actions.${r.is_active ? 'deactivate' : 'activate'}`),
    onClick: (r: Role) => open('active', r),
    permission: 'roles',
    action: 'update',
  },
] as RowAction<Role>[]

/* ---------- FILTERS ---------- */
export const filters = (t: (key: string) => string): Filter[] => [
  {
    id: 'filters[is_active]',
    title: t('status.title'),
    options: [
      { label: t('status.active'), value: '1' },
      { label: t('status.inactive'), value: '0' },
    ],
    multiple: false,
  },
  {
    id: 'sort[created_at]',
    title: t('table.createdAt'),
    options: [
      { label: t('sort.asc'), value: 'asc' },
      { label: t('sort.desc'), value: 'desc' },
    ],
    multiple: false,
  },
]

/* ---------- FORM FIELDS ---------- */
export const buildRoleFields = (
  t: (k: string) => string,
): FieldProp<RoleFormData>[] => [
  {
    type: 'text',
    name: 'name_ar',
    label: t('Form.labels.nameAr'),
    placeholder: t('Form.placeholders.name'),
  },
  {
    type: 'text',
    name: 'name_en',
    label: t('Form.labels.nameEn'),
    placeholder: t('Form.placeholders.name'),
  },
]
```

### Config Exports Reference

| Export | Type | Description |
|---|---|---|
| `Type` | `type Role = { ... }` | TypeScript type for the entity |
| `[entity]Columns` | `ColumnDef<T>[]` | Table column definitions using shared helpers |
| `[entity]Actions` | `RowAction<T>[]` | Row dropdown menu items (links + onClick handlers) |
| `[entity]Filters` / `get[Entity]Filters` | `Filter[]` | Table filter definitions |
| `build[Entity]Fields` | `FieldProp<T>[]` | Form field definitions |

### Shared Column Helpers

From `@/components/features/sharedColumns`:

| Helper | Usage |
|---|---|
| `textColumn<T>(field, header, options?)` | Text/string column |
| `imageColumn<T>(field, header)` | Image thumbnail column |
| `imageNameColumn<T>(getter, header, options?)` | Image + name combo column |
| `booleanControlColumn<T>(field, header, open, action, default, entity)` | Toggle with activate/deactivate modal |
| `createdAtColumn<T>()` | Formatted created_at column |
| `DateColumn<T>(field, header)` | Generic date column |

### Form Field Types

The `FieldProp` type supports these field types:

| Type | Description |
|---|---|
| `text` | Text input |
| `number` | Number input |
| `email` | Email input |
| `password` | Password input with toggle |
| `textarea` | Multi-line text |
| `checkbox` | Checkbox |
| `select` | Dropdown select (async or static options) |
| `radio` | Radio group |
| `otp` | OTP verification input |
| `phone` | Phone with country code |
| `date` | Date picker (single/range/multiple) |
| `map` | Google Maps picker |
| `editor` | TipTap rich text editor |
| `multiLangField` | Multi-language input (ar/en tabs) |
| `fileUpload` | Generic file upload |
| `mediaUploader` | Media upload |
| `imgUploader` | Image upload with preview |
| `color` | Color picker |
| `switch` | Toggle switch |
| `custom` | Custom React element |

### RowAction Shape

```tsx
type RowAction<RowData> = {
  label: string | ((row: RowData) => string)    // Display text
  to?: string | ((row: RowData) => string)       // Router link (for navigation)
  params?: Record<string, any>                   // Route params
  onClick?: (row: RowData) => void               // Custom click handler
  permission?: string                            // Permission key
  action?: 'show' | 'update' | 'store' | 'destroy' | 'delete'
  queryKey?: (id: string) => QueryKey            // For cache invalidation
  danger?: boolean                               // Red styling
  hidden?: (row: RowData) => boolean             // Conditional visibility
  disabled?: boolean | ((row: RowData) => boolean)
}
```

### Filter Shape

```tsx
type Filter = SelectFilter | CustomFilter

// Static options
{
  id: 'filters[is_active]',
  title: 'Status',
  options: [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
  ],
  multiple: false,
}

// Async options from API
{
  id: 'filters[parent_id]',
  title: 'Parent Category',
  endpoint: 'collections',
  select: (data) => data.data.map(c => ({ label: c.name, value: c.id })),
  multiple: false,
}

// Custom JSX filter
{
  type: 'custom',
  id: 'custom-filter',
  jsx: <MyCustomFilterComponent />,
}
```

### Available Modules

| Module | List | Add | Edit | Show |
|---|---|---|---|---|
| Attributes | `/attributes` | `/attributes/add` | `/attributes/edit/:id` | `/attributes/show/:id` |
| Attribute Values | `/attributes/values` | `/attributes/values/add` | `/attributes/values/edit/:id` | - |
| Categories | `/categories` | `/categories/add` | `/categories/edit/:id` | `/categories/show/:id` |
| Earning Rules | `/earning-rules` | `/earning-rules/add` | `/earning-rules/edit/:id` | - |
| FAQs | `/faqs` | `/faqs/add` | `/faqs/edit/:id` | - |
| Offers | `/offers` | `/offers/add` | `/offers/edit/:id` | - |
| Orders | `/orders` | - | - | `/orders/show/:id` |
| Payment Gateways | `/payment-gateways` | - | - | - |
| Products | `/products` | - | - | `/products/show/:id` |
| Reviews | `/reviews` | - | - | `/reviews/show/:id` |
| Rewards | `/rewards` | `/rewards/add` | `/rewards/edit/:id` | - |
| Roles | `/roles` | `/roles/add` | `/roles/edit/:id` | `/roles/show/:id` |
| Show Rooms | `/show-rooms` | `/show-rooms/add` | `/show-rooms/edit/:id` | - |
| Sliders | `/sliders` | `/sliders/add` | `/sliders/edit/:id` | - |
| SMS Providers | `/sms-providers` | - | - | - |
| Static Pages | `/static-pages` | `/static-pages/add` | `/static-pages/edit/:id` | `/static-pages/show/:id` |
| Supervisors | `/supervisors` | `/supervisors/add` | `/supervisors/edit/:id` | - |
| Tiers | `/tiers` | `/tiers/add` | `/tiers/edit/:id` | - |
| Users | `/users` | - | - | `/users/show/:id` |
| Admin Notifications | `/admin-notifications` | - | - | `/admin-notifications/show/:id` |

### Settings Modules

| Module | Path |
|---|---|
| General | `/settings/general` |
| Countries | `/settings/countries` |
| Cities | `/settings/cities` |
| Shopify Stores | `/settings/shopify-stores` |
| Notifications | `/settings/notifications` |

### Adding a New CRUD Module

1. **Create routes** under `src/routes/_main/[module]/`:

   ```
   src/routes/_main/my-module/
   ├── index.tsx          # List page
   ├── add.tsx            # Create page
   ├── edit/$id.tsx       # Edit page
   └── show/$id.tsx       # Detail page (optional)
   ```

2. **Create Config** at `src/components/pagesComponents/MyModule/Config.tsx`:
   - Define TypeScript type for the entity
   - Export column definitions using shared column helpers
   - Export row actions (show, edit, delete, activate/deactivate)
   - Export filter definitions
   - Export form field builder function

3. **Create components** in the same directory:
   - `index.tsx` - Table component using `<DataTable>` with columns, filters, actions
   - `Form.tsx` - Form using React Hook Form + the `Field` component
   - `show/index.tsx` - Detail view (optional)

4. **Add query keys** to `src/util/queryKeysFactory.ts`:
   ```tsx
   export const myModuleQueryKeys = {
     all: () => ['my-module'] as const,
     filterd: (params: unknown) => [...myModuleQueryKeys.all(), 'filtered', params] as const,
     get: (id: string | number) => [...myModuleQueryKeys.all(), 'one', String(id)] as const,
   }
   ```

5. **Register in sidebar** (`src/components/layout/Sidebar.tsx`)

## Routing

Uses [TanStack Router](https://tanstack.com/router) with file-based routing.

- **Root layout:** `src/routes/__root.tsx`
- **Auth layout:** `src/routes/_main/route.tsx` (wraps all authenticated pages)
- Routes are auto-generated via `@tanstack/router-plugin`

### Adding a Route

Create a new file in `src/routes/` and TanStack Router will auto-generate the route tree.

## Data Fetching

- **`UseFetch` hook** wraps `@tanstack/react-query` `useQuery` with the project's axios instance
- **`UseMutate` hook** wraps `useMutation` for create/update/delete operations
- **Query keys** are managed via `src/util/queryKeysFactory.ts`
- Token refresh is handled automatically via axios response interceptors

## Linting & Formatting

```bash
pnpm lint        # ESLint
pnpm format      # Prettier
pnpm check       # Prettier --write + ESLint --fix
```
