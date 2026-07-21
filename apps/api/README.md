# Ecommerce API - Advanced E-commerce Backend

Ecommerce API is a high-performance, progressive [NestJS](https://github.com/nestjs/nest) backend for a premium e-commerce platform. It features a modular architecture with dual-context API (admin + client), polymorphic media management, multi-language support, and Prisma-optimized data access.

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL via Prisma 7 (multi-file schema)
- **Cache**: Keyv + Redis (tag-based invalidation)
- **Validation**: class-validator & class-transformer
- **Localization**: nestjs-i18n (AR / EN)
- **Auth**: JWT with refresh token rotation, OTP, Passport
- **Payments**: Stripe, Tap, Moyasar, Tabby
- **Events**: EventEmitter2 + transactional outbox
- **Storage**: Local / S3-compatible

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
│  │  BaseRepository<T>  +  Domain Repositories       │  │
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

| Layer          | Path          | Purpose                                                  |
| -------------- | ------------- | -------------------------------------------------------- |
| **Admin API**  | `src/admin/`  | CRUD endpoints protected by JWT + RBAC permissions       |
| **Client API** | `src/client/` | Public/authenticated storefront endpoints                |
| **Core**       | `src/core/`   | Pure data-access repositories, no HTTP dependency        |
| **Auth**       | `src/auth/`   | JWT auth, OTP, guards, strategies                        |
| **Media**      | `src/media/`  | Polymorphic media attachment system                      |
| **Common**     | `src/common/` | Interceptors, filters, pipes, base repository, utilities |
| **Prisma**     | `src/prisma/` | Database service & module                                |
| **Shared**     | `src/shared/` | Domain-agnostic services (cache, email, SMS, payments)   |

## Key Design Patterns

### Durable Domain Events

Business lifecycle events use a PostgreSQL transactional outbox and NestJS EventEmitter2. Events are committed with business changes, then dispatched asynchronously to idempotent listeners such as in-app notifications.

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
- `BaseRepository<T>` provides `formatRecord<Out>` conversion hook, pagination, soft-delete
- `MediaAwareRepository` extends it for entities with polymorphic media
- Subclasses override `formatRecord` to convert Prisma `Decimal` fields to `number`

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

### Payment Providers

Multi-gateway with encrypted credential storage. Bootstrap defaults from `.env`, runtime reads from `PaymentGateway` records.

## Project Structure

```text
src/
├── admin/                     # Admin CRUD modules (RBAC-protected)
│   ├── attributes/
│   ├── cities/
│   ├── collections/
│   ├── countries/
│   ├── coupons/
│   ├── dashboard/
│   ├── dashboard-preferences/
│   ├── faqs/
│   ├── loyalty/
│   ├── orders/
│   ├── payment-gateways/
│   ├── products/
│   ├── returns/
│   ├── reviews/
│   ├── roles/
│   ├── show-rooms/
│   ├── sliders/
│   ├── static-pages/
│   ├── tickets/
│   ├── users/
│   └── wallet/
├── auth/                      # Authentication
│   ├── guards/                # JWT auth, permissions
│   ├── strategies/            # JWT, refresh, local
│   └── services/
├── client/                    # Client-facing modules
│   ├── addresses/
│   ├── attributes/
│   ├── cart/
│   ├── checkout/
│   ├── cities/
│   ├── collections/
│   ├── countries/
│   ├── faqs/
│   ├── home/
│   ├── loyalty/
│   ├── orders/
│   ├── products/
│   ├── profile/
│   ├── returns/
│   ├── reviews/
│   ├── show-rooms/
│   ├── sliders/
│   ├── static-pages/
│   ├── tickets/
│   ├── wallet/
│   └── wishlist/
├── common/                    # Shared infrastructure
│   ├── architecture/          # C4 model docs
│   ├── constants/
│   ├── decorators/            # @ApiContext, @Public, @CurrentUser
│   ├── dto/                   # Shared DTOs
│   ├── events/                # Domain event definitions
│   ├── exceptions/
│   ├── filters/               # AllExceptionsFilter
│   ├── guards/                # JwtAuthGuard, PermissionsGuard
│   ├── interceptors/          # TransformInterceptor
│   ├── interfaces/            # Port interfaces + DI tokens
│   ├── persistence/           # Outbox, migration helpers
│   ├── pipes/                 # SnakeToCamelPipe
│   ├── repositories/          # BaseRepository, MediaAwareRepository
│   ├── services/
│   ├── swagger/               # Swagger setup
│   ├── types/                 # Response shapes, i18n types
│   └── utils/                 # decimal.util, pagination, etc.
├── config/                    # Environment validation schema
├── core/                      # Repository implementations
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
├── generated/                 # Prisma-generated types
├── i18n/                      # Translation JSON (en, ar)
├── media/                     # Polymorphic media system
├── prisma/                    # Prisma service + module
├── shared/                    # Domain-agnostic services
│   ├── cache/                 # Tag-based Redis cache
│   ├── email/                 # Nodemailer SMTP
│   ├── loyalty/               # Points engine
│   ├── messages/              # Conversations
│   ├── notifications/         # In-app + push
│   ├── orders/                # Order lifecycle
│   ├── payment/               # Multi-provider abstraction
│   ├── settings/              # Dynamic settings
│   ├── sms/                   # SMS provider
│   ├── storage/               # Local / S3
│   └── wallet/                # Balance + transactions
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+

### 1. Install

```bash
pnpm install
```

### 2. Database

Configure your `.env` (copy from `.env.example`):

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"
APP_URL="http://localhost:3030"
```

Run migrations:

```bash
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma generate
```

### 3. Run

```bash
# development (watch mode)
pnpm --filter api dev

# production
pnpm --filter api build
pnpm --filter api start:prod
```

### 4. Seed

```bash
pnpm --filter api exec prisma db seed
```

## API Routes

All routes are prefixed with `/api/v1`.

### Auth — `/auth/*`

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/auth/send-otp`      | Send OTP code          |
| POST   | `/auth/login-otp`     | Login with OTP         |
| POST   | `/auth/create-guest`  | Create guest account   |
| POST   | `/auth/register`      | Register new user      |
| POST   | `/auth/login`         | Email/password login   |
| POST   | `/auth/refresh`       | Rotate refresh token   |
| POST   | `/auth/forgot-password` | Request reset        |
| POST   | `/auth/reset-password`  | Reset password       |
| GET    | `/auth/me`            | Current user profile   |

### Admin — `/admin/*` (JWT + RBAC)

| Module                | Typical Path                         |
| --------------------- | ------------------------------------ |
| Dashboard             | `/admin/dashboard`                   |
| Dashboard Preferences | `/admin/profile/dashboard-preferences` |
| Countries             | `/admin/countries`                   |
| Cities                | `/admin/cities`                      |
| Sliders               | `/admin/sliders`                     |
| FAQs                  | `/admin/faqs`                        |
| Collections           | `/admin/collections`                 |
| Products              | `/admin/products`                    |
| Attributes            | `/admin/attributes`                  |
| Static Pages          | `/admin/static-pages`                |
| Users                 | `/admin/users`                       |
| Roles                 | `/admin/roles`                       |
| Reviews               | `/admin/reviews`                     |
| Show Rooms            | `/admin/show-rooms`                  |
| Orders                | `/admin/orders`                      |
| Coupons               | `/admin/coupons`                     |
| Returns               | `/admin/returns`                     |
| Wallet                | `/admin/wallet`                      |
| Tickets               | `/admin/tickets`                     |
| Loyalty               | `/admin/loyalty`                     |
| Payment Gateways      | `/admin/payment-gateways`            |

### Client — `/client/*`

| Module      | Typical Path           | Auth    |
| ----------- | ---------------------- | ------- |
| Home        | `/client/home`         | Public  |
| Countries   | `/client/countries`    | Public  |
| Cities      | `/client/cities`       | Public  |
| Sliders     | `/client/sliders`      | Public  |
| FAQs        | `/client/faqs`         | Public  |
| Collections | `/client/collections`  | Public  |
| Products    | `/client/products`     | Public  |
| Attributes  | `/client/attributes`   | Public  |
| Static Pages| `/client/static-pages` | Public  |
| Show Rooms  | `/client/show-rooms`   | Public  |
| Cart        | `/client/cart`         | JWT     |
| Checkout    | `/client/checkout`     | JWT     |
| Addresses   | `/client/addresses`    | JWT     |
| Orders      | `/client/orders`       | JWT     |
| Returns     | `/client/returns`      | JWT     |
| Reviews     | `/client/reviews`      | JWT     |
| Profile     | `/client/profile`      | JWT     |
| Wishlist    | `/client/wishlist`     | JWT     |
| Wallet      | `/client/wallet`       | JWT     |
| Loyalty     | `/client/loyalty`      | JWT     |
| Tickets     | `/client/tickets`      | JWT     |

### Media — `/media/*`

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | `/media/upload`     | Upload file(s)       |
| DELETE | `/media/:id`        | Delete media         |
| GET    | `/uploads/*`        | Serve uploaded files |

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

| Param       | Example                 | Description       |
| ----------- | ----------------------- | ----------------- |
| `page`      | `?page=2`               | Page number       |
| `limit`     | `?limit=20`             | Items per page    |
| `search`    | `?search=foo`           | Full-text search  |
| `sortBy`    | `?sortBy=name`          | Sort field        |
| `sortOrder` | `?sortOrder=desc`       | Sort direction    |
| `filter`    | `?filter=isActive:true` | Field filter      |
| `include`   | `?include=translations` | Include relations |

## Scripts

| Command               | Description              |
| --------------------- | ------------------------ |
| `pnpm dev`            | Watch mode               |
| `pnpm build`          | Compile to `dist/`       |
| `pnpm start:prod`     | Run compiled             |
| `pnpm lint`           | ESLint                   |
| `pnpm typecheck`      | `tsc --noEmit`           |
| `pnpm test`           | Unit tests (Jest)        |
| `pnpm test:e2e`       | E2E tests (Supertest)    |

## License

Ecommerce API is [MIT licensed](LICENSE).
