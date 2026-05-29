# Ecommerce API - Advanced E-commerce Backend

Ecommerce API is a high-performance, progressive [NestJS](https://github.com/nestjs/nest) backend for a premium e-commerce platform. It features a modular architecture with dual-context API (admin + client), polymorphic media management, multi-language support, and Prisma-optimized data access.

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/) with multi-file schema
- **Validation**: class-validator & class-transformer
- **Localization**: nestjs-i18n
- **Auth**: JWT with refresh token rotation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AppModule                            │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Admin API  │  │ Client API │  │      Auth        │  │
│  │  /admin/*   │  │ /client/*  │  │  /auth/*         │  │
│  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘  │
│        │               │                  │            │
│  ┌─────┴───────────────┴──────────────────┴─────────┐  │
│  │                Core Layer (Repositories)          │  │
│  │  BaseRepository<T>  +  12 Domain Repositories     │  │
│  └─────────────────────┬─────────────────────────────┘  │
│        │               │                  │            │
│  ┌─────┴───────────────┴──────────────────┴─────────┐  │
│  │          PrismaService / PostgreSQL               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Media    │  │   Shared   │  │    Common         │  │
│  │  Module    │  │  Services  │  │  (Guards,Filters, │  │
│  │            │  │(Email,SMS, │  │   Interceptors,   │  │
│  │            │  │ Cache,...) │  │    Utilities)     │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Layers

| Layer | Path | Purpose |
|---|---|---|
| **Admin API** | `src/admin/` | CRUD endpoints protected by JWT + RBAC permissions |
| **Client API** | `src/client/` | Public/authenticated storefront endpoints |
| **Core** | `src/core/` | Pure data-access repositories, no HTTP dependency |
| **Auth** | `src/auth/` | JWT auth, OTP, guards, strategies |
| **Media** | `src/media/` | Polymorphic media attachment system |
| **Common** | `src/common/` | Interceptors, filters, pipes, base repository, utilities |
| **Prisma** | `src/prisma/` | Database service & module |
| **Shared** | `src/shared/` | Domain-agnostic services (cache, email, SMS, SMS) |

## Key Design Patterns

### Dual-Context API (`@ApiContext` decorator)

The global `TransformInterceptor` reads `@ApiContext('admin' | 'client')` metadata to produce different response shapes:

- **Admin context** — Returns all language translations as root-level keys (`en`, `ar`) with the requested language promoted to flat fields
- **Client context** — Strips translation arrays, promotes only the requested language, and applies a per-entity field whitelist (removes `isActive`, `createdAt`, `updatedAt`, `deletedAt`, and other admin fields)

Mark endpoints with `@ApiContext('admin')` or `@ApiContext('client')` on controllers.

```typescript
@ApiContext('client')
@Public()
@Get()
async findAll() { ... }
```

### Repository Pattern with Interface Tokens

Each domain has a **port interface** (in `src/common/interfaces/`) registered via `Symbol('IXxxRepository')` DI token, with implementation classes in `src/core/`. This:

- Enables swapping implementations without changing consumers
- Allows admin and client services to inject the same repository via `@Inject(TOKEN)`
- All `findAll()` methods accept optional `QueryOptions` with Prisma `select` or `include`

```typescript
@Injectable()
export class ClientCountriesService {
  constructor(
    @Inject(COUNTRIES_REPOSITORY)
    private readonly countriesRepo: ICountriesRepository,
  ) {}
}
```

### Prisma `select` Optimization

Client services pass explicit Prisma `select` objects to repository methods instead of fetching all fields and stripping them post-query. Virtual media fields (`image`, `flag`, `slide`, `gallery`) are excluded from `select` — they don't exist as Prisma columns and are injected by `mergeMedia()` post-query.

### Polymorphic Media System

A single `media` table linked via `model` + `modelId` + `collection` key supports any entity type. The API returns objects for single-media slots (e.g., `image`, `flag`, `slide`) and arrays for multi-media slots (e.g., `gallery`). Lifecycle management handles physical file cleanup on deletion and slot updates.

### Translation Flattening

Prisma stores translations as a `translations[]` array. The `TransformInterceptor` flattens this at response time:

- **Admin**: Promotes requested language fields to root + keeps all languages as keys
- **Client**: Promotes only requested language, removes translation array entirely

## Getting Started

### 1. Install

```bash
pnpm install
```

### 2. Database

Configure your `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"
APP_URL="http://localhost:3030"
```

Run migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Run

```bash
# development
pnpm run start:dev

# production
pnpm run build
pnpm run start:prod
```

### 4. Seed

```bash
npx prisma db seed
```

## Project Structure

```text
src/
├── admin/               # Admin CRUD modules
│   ├── attributes/
│   ├── cities/
│   ├── collections/
│   ├── countries/
│   ├── dashboard/
│   ├── faqs/
│   ├── products/
│   ├── roles/
│   ├── sliders/
│   ├── static-pages/
│   └── users/
├── auth/                # Authentication
│   ├── guards/          # JWT auth, permissions
│   ├── strategies/      # JWT, refresh, local
│   └── services/
├── client/              # Client-facing modules
│   ├── addresses/
│   ├── attributes/
│   ├── cities/
│   ├── collections/
│   ├── countries/
│   ├── faqs/
│   ├── home/
│   ├── orders/
│   ├── products/
│   ├── profile/
│   ├── reviews/
│   ├── sliders/
│   └── static-pages/
├── common/              # Shared infrastructure
│   ├── decorators/      # @ApiContext, @Public, etc.
│   ├── interceptors/    # Transform interceptor
│   ├── interfaces/      # Port interfaces + DI tokens
│   ├── repositories/    # BaseRepository<T>
│   ├── types/           # Response, i18n types
│   └── utils/           # CaseTransformer, pagination, etc.
├── core/                # Repository implementations
│   ├── attributes/
│   ├── cities/
│   ├── collections/
│   ├── countries/
│   ├── faqs/
│   ├── products/
│   ├── roles/
│   ├── sliders/
│   ├── static-pages/
│   └── users/
├── media/               # Polymorphic media system
├── prisma/              # Prisma service + module
├── shared/              # Cache, email, SMS, storage
└── i18n/                # Translation JSON (en, ar)
```

## API Routes

### Admin (`/admin/*`)

Protected by JWT + RBAC. Full CRUD with all language translations.

| Route | Module |
|---|---|
| `GET /admin/dashboard` | Dashboard |
| `/admin/countries` | Countries |
| `/admin/cities` | Cities |
| `/admin/sliders` | Sliders |
| `/admin/faqs` | FAQs |
| `/admin/collections` | Collections |
| `/admin/products` | Products |
| `/admin/attributes` | Attributes |
| `/admin/static-pages` | Static Pages |
| `/admin/roles` | Roles |
| `/admin/users` | Users |

### Client (`/client/*`)

Catalog endpoints are `@Public()`. Write endpoints (reviews, orders, addresses, profile) require client JWT.

| Route | Module | Auth |
|---|---|---|
| `GET /client/home` | Home | Public |
| `GET /client/countries` | Countries | Public |
| `GET /client/cities` | Cities | Public |
| `GET /client/sliders` | Sliders | Public |
| `GET /client/faqs` | FAQs | Public |
| `GET /client/collections` | Collections | Public |
| `GET /client/products` | Products | Public |
| `GET /client/attributes` | Attributes | Public |
| `GET /client/static-pages` | Static Pages | Public |
| `GET/POST /client/addresses` | Addresses | JWT |
| `GET/POST /client/reviews` | Reviews | JWT |
| `GET/POST /client/orders` | Orders | JWT |
| `GET/PUT /client/profile` | Profile | JWT |

### Auth (`/auth/*`)

| Endpoint | Description |
|---|---|
| `POST /auth/send-otp` | Send OTP code |
| `POST /auth/login-otp` | Login with OTP |
| `POST /auth/create-guest` | Create guest account |
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Email/password login |
| `POST /auth/refresh` | Refresh access token |
| `POST /auth/forgot-password` | Request password reset |
| `POST /auth/reset-password` | Reset password |

## Response Format

All responses follow a uniform shape:

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated responses:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "total_pages": 10
    }
  }
}
```

### Thin Client Responses

Client endpoints return only whitelisted fields per entity type. Admin fields (`isActive`, `createdAt`, `updatedAt`, `deletedAt`, `shippingPrice`) are stripped. Translations are flattened to promote only the requested language.

### Query Parameters

| Param | Example | Description |
|---|---|---|
| `page` | `?page=2` | Page number |
| `limit` | `?limit=20` | Items per page |
| `search` | `?search=foo` | Full-text search |
| `sortBy` | `?sortBy=name` | Sort field |
| `sortOrder` | `?sortOrder=desc` | Sort direction |
| `filter` | `?filter=isActive:true` | Field filter |
| `include` | `?include=translations` | Include relations |

## License

Ecommerce API is [MIT licensed](LICENSE).
