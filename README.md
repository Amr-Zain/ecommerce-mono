# Fayendra API - Advanced E-commerce Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

Fayendra API is a high-performance, progressive [NestJS](https://github.com/nestjs/nest) backend designed for a premium e-commerce platform. It features a robust, localized catalog system, a revolutionary polymorphic media management architecture, and advanced hierarchical data handling.

---

## 🚀 Key Features

### 📦 Catalog & Inventory
- **Collections Hierarchy**: Support for multi-level collections (Collections, Sub-collections, Sub-sub-collections) with optimized tree retrieval.
- **Dynamic Attributes**: Flexible product attributes (e.g., Color, Size) with localized values and automatic relationship loading.
- **Localized Content**: Every entity (Collections, Attributes, Values, FAQs, etc.) supports multi-language translations (English & Arabic) out of the box.

### 🖼️ Polymorphic Media System
- **Collection-Key Architecture**: Eliminates redundant database columns by using a single media table linked via semantic keys (e.g., `flag`, `avatar`, `gallery`).
- **Semantic Responses**: API returns objects for single-media slots and arrays for multi-media slots automatically.
- **Lifecycle Management**: Automatic physical file and record cleanup on entity deletion or single-slot updates.

### 🔐 Security & Access Control
- **JWT Authentication**: Secure login and session management with refresh token rotation.
- **RBAC (Role-Based Access Control)**: Granular permission system grouped by resource and action.
- **Global Guards**: Uniform security enforcement across all admin and client endpoints.

### 🛠️ Developer Experience
- **Base Repository Pattern**: Standardized CRUD operations with built-in pagination, search, and media merging.
- **Advanced Query Builder**: Simplified complex filtering, sorting, and localized search logic.
- **Postman Integration**: Fully documented API collection with environment-ready requests.

---

## 🛠️ Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11+)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/) with Multi-file Schema support
- **Language**: TypeScript (Strict Mode)
- **Validation**: Class-validator & Class-transformer
- **Localization**: Nestjs-i18n

---

## 🏃 Getting Started

### 1. Installation
```bash
$ pnpm install
```

### 2. Database Setup
Ensure you have a PostgreSQL instance running, then configure your `.env` file:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/fayendra_db"
```
Run migrations and generate the client:
```bash
$ npx prisma migrate dev
$ npx prisma generate
```

### 3. Running the App
```bash
# development
$ pnpm run start:dev

# production
$ pnpm run build
$ pnpm run start:prod
```

### 4. Seeding Data
Initialize the system with a Super Admin and basic roles:
```bash
$ npx prisma db seed
```

---

## 📁 Project Structure

```text
src/
├── admin/          # Dashboard endpoints (Collections, Attributes, Users, etc.)
├── client/         # Public-facing storefront endpoints
├── auth/           # Identity and session management
├── common/         # Global filters, interceptors, and base repository
├── media/          # Polymorphic media core system
├── prisma/         # Schema definitions and migrations
└── i18n/           # Translation dictionaries
```

---

## 📜 License

Fayendra API is [MIT licensed](LICENSE).
