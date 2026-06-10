# E-Commerce Web Storefront

Customer-facing storefront built with Next.js 16, featuring i18n (EN/AR), authentication, and server-side API proxying.

## Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **UI Components:** shadcn/ui + custom `@ecommerce/ui` package
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js v5 (beta) with JWT strategy
- **i18n:** next-intl (EN/AR, RTL support)
- **State:** TanStack Query + React 19
- **Forms:** React Hook Form
- **Theme:** next-themes (dark/light mode)

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the web root:

```bash
# Backend API base URL
API_BASE_URL=http://localhost:3030

# NextAuth secret (generate with: openssl rand -base64 32)
AUTH_SECRET=

```

Client authentication calls `/auth/send-otp` and `/auth/login-otp` from server
actions. The verification action copies the API refresh token into an HttpOnly
cookie, while NextAuth validates and stores only the access token.

### Running

```bash
pnpm dev
```

Starts the dev server with Turbopack on port 3000.

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start dev server (Turbopack) |
| `pnpm build`     | Build for production         |
| `pnpm start`     | Start production server      |
| `pnpm lint`      | Lint with ESLint             |
| `pnpm format`    | Format with Prettier         |
| `pnpm typecheck` | Type-check with TypeScript   |

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth API routes
│   │   └── client/[...path]/     # Proxy to backend API
│   ├── [locale]/                 # i18n locale routes
│   │   ├── layout.tsx            # Locale layout (providers, header, footer)
│   │   ├── page.tsx              # Home page
│   │   ├── auth/login/           # Login page
│   │   ├── cart/                 # Shopping cart
│   │   ├── payment/              # Checkout/payment
│   │   ├── products/             # Product listing + detail
│   │   ├── collections/          # Category/collection pages
│   │   ├── show-rooms/           # Show rooms
│   │   ├── profile/              # User profile section
│   │   │   ├── orders/           # Order history + detail
│   │   │   ├── addresses/        # Saved addresses
│   │   │   ├── wishlist/         # Wishlist
│   │   │   ├── wallet/           # Wallet/balance
│   │   │   └── support/          # Support tickets
│   │   ├── warranty/             # Warranty info
│   │   ├── returns/              # Returns policy
│   │   ├── privacy-policy/       # Privacy policy
│   │   └── purchase-protection/  # Purchase protection info
│   └── globals.css               # Global styles
├── components/
│   ├── auth/                     # Auth components (SessionProvider)
│   ├── cart/                     # Cart components
│   ├── home/                     # Home page (Header, Footer)
│   ├── product/                  # Product cards, details
│   ├── profile/                  # Profile page components
│   ├── providers/                # TanstackQueryProvider
│   └── shared/                   # Shared/reusable components
├── hooks/api/                    # Custom API hooks
├── i18n/                         # i18n config (routing, request)
├── lib/
│   ├── client/                   # Client-side utilities
│   ├── server/                   # Server-side utilities (auth, API proxy)
│   └── utils.ts                  # Shared utilities (cn, etc.)
├── messages/                     # Translation files (en.json, ar.json)
├── types/                        # TypeScript types (auth, next-auth)
└── proxy.ts                      # i18n middleware proxy
```

## Routing

Uses Next.js App Router with i18n via `next-intl`.

- **Locale prefix:** `/en/...` or `/ar/...` (omitted for default locale `en`)
- **Supported locales:** `en`, `ar`
- **RTL support:** Automatic for Arabic
- **Locale detection:** Path > Cookie > Accept-Language header

### Pages

| Path                   | Description         |
| ---------------------- | ------------------- |
| `/`                    | Home page           |
| `/auth/login`          | Login               |
| `/products`            | Product listing     |
| `/products/:id`        | Product detail      |
| `/collections`         | Collections listing |
| `/collections/:slug`   | Collection detail   |
| `/cart`                | Shopping cart       |
| `/payment`             | Checkout            |
| `/show-rooms`          | Show rooms          |
| `/profile`             | User profile        |
| `/profile/orders`      | Order history       |
| `/profile/addresses`   | Saved addresses     |
| `/profile/wishlist`    | Wishlist            |
| `/profile/wallet`      | Wallet              |
| `/profile/support`     | Support tickets     |
| `/warranty`            | Warranty info       |
| `/returns`             | Returns policy      |
| `/privacy-policy`      | Privacy policy      |
| `/purchase-protection` | Purchase protection |

## Authentication

Uses NextAuth.js v5 with JWT strategy and credentials provider.

- **Login endpoint:** Proxied to `API_BASE_URL/auth/login`
- **Session:** JWT-based (stored in cookie)
- **Token refresh:** Handled via API proxy

### User Fields

The session includes: `id`, `name`, `email`, `phone`, `role`, `accessToken`, `phone_code`, `image`, `user_type`, `is_active`, `is_verified`, `is_banned`, `is_suspended`, `permissions`, `settings`.

## API Proxy

All API calls are proxied through Next.js API routes:

- **`/api/client/[...path]`** - Proxies requests to `API_BASE_URL`, forwards auth headers
- **`/api/auth/[...nextauth]`** - NextAuth endpoints

## i18n

- **Config:** `i18n/routing.ts`
- **Messages:** `messages/en.json`, `messages/ar.json`
- **Usage:** `useTranslations()` hook from `next-intl`
- **Static params:** Pre-generated for both locales

### Adding a New Locale

1. Add locale to `i18n/routing.ts`:
   ```ts
   locales: ["en", "ar", "fr"],
   ```
2. Create translation file `messages/fr.json`
3. Add locale to `generateStaticParams` in `app/[locale]/layout.tsx`
