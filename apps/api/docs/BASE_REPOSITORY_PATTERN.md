# Base Repository Pattern

## Overview

The `BaseRepository<T>` class eliminates repeated boilerplate across domain repositories by providing a **declarative configuration** approach for:

- **Search** (direct fields, translation fields, relation fields — with configurable match mode)
- **Filtering** (via `AdvancedQueryDto.filters` with automatic type coercion)
- **Pagination** (via `AdvancedQueryDto.page` / `limit`)
- **Sorting** (flat and nested relation sorting via dot-notation)
- **Language-aware includes** (recursive token replacement)
- **Dynamic includes** (conditional includes from query params via `allowedIncludes`)
- **Media attachment** (polymorphic media handling)
- **Type safety** (compile-time field validation with `satisfies`)

---

## Quick Start

```typescript
@Injectable()
export class CitiesRepository extends BaseRepository<City> implements ICitiesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<City>[],
  };

  protected readonly filterConfig = { countryId: 'bigint' };

  protected readonly defaultListInclude = {
    country: { include: { translations: { where: { langId: '__langId__' } } } },
    translations: { where: { langId: '__langId__' }, take: 1 },
  };

  protected readonly defaultDetailInclude = {
    translations: true,
    country: { include: { translations: { where: { langId: '__langId__' } } } },
  };

  protected readonly allowedIncludes = {
    country: { include: { translations: true } },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() { return this.prisma.city; }
}
```

---

## Advanced Query Examples

The `AdvancedQueryDto` supports the following query string format:

```
?page=1&limit=10&paginate=1&search=text&filters[field]=value&sort[field]=asc&include=relation1,relation2
```

---

### Pagination

```http
GET /cities?page=2&limit=20
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 10 | Items per page (max 100) |
| `paginate` | boolean | true | Set to `false` to return all results without pagination |

**Response (paginated):**
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

**Response (unpaginated):**
```http
GET /cities?paginate=false
```
Returns a flat array `[...]` with all results.

---

### Filtering

Filters use bracket notation: `filters[fieldName]=value`

```http
GET /cities?filters[countryId]=5&filters[isActive]=true
```

**Multiple filters (AND logic):**
```http
GET /reviews?filters[isActive]=true&filters[isVerified]=true&filters[rating]=5
```

**Filter type coercion** via `filterConfig`:
```typescript
protected readonly filterConfig = {
  countryId: 'bigint',    // "5"  → BigInt(5)
  rating: 'number',       // "4"  → 4
  isActive: 'boolean',    // "1"  → true, "0" → false, "true" → true
};
```

Without `filterConfig`, Prisma would receive `"5"` as a string for a bigint column and fail.

---

### Search

A single `search` param that searches across multiple fields simultaneously (OR logic):

```http
GET /cities?search=cairo
```

**Translation field search:**
```typescript
searchConfig = { translationFields: ['name'] }
```
Generates:
```prisma
{ translations: { some: { langId: 'en', OR: [{ name: { contains: 'cairo', mode: 'insensitive' } }] } } }
```

**Direct field search:**
```http
GET /users?search=john
```
```typescript
searchConfig = { directFields: ['name', 'email'] satisfies ScalarFields<User>[] }
```
Generates:
```prisma
{ OR: [
  { name: { contains: 'john', mode: 'insensitive' } },
  { email: { contains: 'john', mode: 'insensitive' } },
] }
```

**Relation field search (nested — searching across related tables):**
```http
GET /reviews?search=john
```
```typescript
searchConfig = {
  directFields: ['comment'] satisfies ScalarFields<ReviewRecord>[],
  relationFields: [
    { relation: 'user', fields: ['name', 'email'] },
    { relation: 'product', fields: ['name'], isTranslation: true },
  ],
}
```
Generates:
```prisma
{ OR: [
  { comment: { contains: 'john', mode: 'insensitive' } },
  { user: { name: { contains: 'john', mode: 'insensitive' } } },
  { user: { email: { contains: 'john', mode: 'insensitive' } } },
  { product: { translations: { some: { langId: 'en', OR: [{ name: { contains: 'john', mode: 'insensitive' } }] } } } },
] }
```

**Combined search + filters:**
```http
GET /reviews?search=good&filters[isActive]=true&filters[rating]=5
```
Generates (AND between filters and search, OR within search):
```prisma
{ AND: [
  { isActive: true, rating: 5 },
  { OR: [
    { comment: { contains: 'good', mode: 'insensitive' } },
    { user: { name: { contains: 'good', mode: 'insensitive' } } },
    ...
  ] }
] }
```

---

### Search Modes

Default mode is `'contains'`. Override per-field:

```typescript
protected readonly searchConfig = {
  directFields: [
    'name',                                    // defaults to 'contains'
    { field: 'code', mode: 'equals' },         // exact match only
    { field: 'email', mode: 'startsWith' },    // prefix match
  ],
};
```

```http
GET /coupons?search=SUMMER
```
Generates:
```prisma
{ OR: [
  { name: { contains: 'SUMMER', mode: 'insensitive' } },
  { code: { equals: 'SUMMER', mode: 'insensitive' } },
  { email: { startsWith: 'SUMMER', mode: 'insensitive' } },
] }
```

---

### Sorting

**Flat sorting:**
```http
GET /cities?sort[createdAt]=desc
GET /users?sort[name]=asc
```
Generates: `orderBy: { createdAt: 'desc' }`

**Nested relation sorting (dot-notation):**
```http
GET /cities?sort[country.name]=asc
```
Generates:
```prisma
orderBy: { country: { name: 'asc' } }
```

**Deep nesting:**
```http
GET /order-items?sort[product.collection.name]=asc
```
Generates:
```prisma
orderBy: { product: { collection: { name: 'asc' } } }
```

**Sort by translation field via relation:**
```http
GET /products?sort[collection.translations.name]=asc
```
Generates:
```prisma
orderBy: { collection: { translations: { name: 'asc' } } }
```

**Sort by related user field:**
```http
GET /orders?sort[user.name]=asc
```
Generates:
```prisma
orderBy: { user: { name: 'asc' } }
```

**Multiple sort fields (applied in order):**
```http
GET /products?sort[createdAt]=desc&sort[name]=asc
```
Generates:
```prisma
orderBy: [{ createdAt: 'desc' }, { name: 'asc' }]
```

**Nested + flat combined:**
```http
GET /cities?sort[country.name]=asc&sort[createdAt]=desc
```
Generates:
```prisma
orderBy: [{ country: { name: 'asc' } }, { createdAt: 'desc' }]
```

**Default sort:** If no `sort` param is provided, defaults to `{ createdAt: 'desc' }`.

---

### Dynamic Includes

Request additional relations via `?include=`:

```http
GET /cities?include=country,reviews
```

Only relations declared in `allowedIncludes` are loaded. Unknown keys are silently ignored (security).

**Configuration:**
```typescript
protected readonly allowedIncludes = {
  country: { include: { translations: { where: { langId: '__langId__' } } } },
  reviews: true,
  collection: { include: { translations: true } },
};
```

**Examples:**

```http
# Include a single relation
GET /cities?include=country

# Include multiple relations
GET /cities?include=country,reviews

# Include with other query params
GET /cities?page=1&limit=5&search=alex&include=country

# Include relation that has nested includes configured
GET /products?include=collection
# → Produces: { collection: { include: { translations: true } } }

# Unknown keys are silently dropped
GET /cities?include=country,secretAdminData
# → Only loads country (secretAdminData is ignored)
```

**How it merges with defaultListInclude:**

Given:
```typescript
protected readonly defaultListInclude = {
  translations: { where: { langId: '__langId__' }, take: 1 },
};

protected readonly allowedIncludes = {
  country: { include: { translations: { where: { langId: '__langId__' } } } },
  reviews: true,
};
```

```http
GET /cities?include=country
```

Final include sent to Prisma:
```prisma
{
  translations: { where: { langId: 'en' }, take: 1 },    // from defaultListInclude
  country: { include: { translations: { where: { langId: 'en' } } } },  // from allowedIncludes (merged)
}
```

**Include with language:**
```http
GET /cities?include=country
Accept-Language: ar
```
The `__langId__` token in both `defaultListInclude` and `allowedIncludes` resolves to `'ar'`.

**No include param:**
```http
GET /cities?page=1
```
Uses only `defaultListInclude` — no dynamic relations loaded.

**Behavior summary:**

| Query | Result |
|-------|--------|
| `?include=country` | defaultListInclude + country |
| `?include=country,reviews` | defaultListInclude + country + reviews |
| `?include=secretData` | defaultListInclude only (ignored) |
| No `?include` | defaultListInclude only |
| `allowedIncludes` is `{}` | `?include` param has no effect |

---

### Language

```http
GET /cities?page=1&limit=10
Accept-Language: ar
```

The controller extracts `langId` from headers and passes to `findAll(query, 'ar')`:

1. **Search** scopes to Arabic translations: `{ translations: { some: { langId: 'ar', ... } } }`
2. **Includes** resolve tokens: `{ where: { langId: '__langId__' } }` → `{ where: { langId: 'ar' } }`

---

### Full Combined Example

```http
GET /cities?page=1&limit=10&search=alex&filters[countryId]=1&filters[isActive]=true&sort[country.name]=asc&include=country
Accept-Language: ar
```

This produces:
- **where:** `{ AND: [{ countryId: BigInt(1), isActive: true }, { OR: [{ translations: { some: { langId: 'ar', name: { contains: 'alex', mode: 'insensitive' } } } }] }] }`
- **orderBy:** `{ country: { name: 'asc' } }`
- **include:** merged `defaultListInclude` + `allowedIncludes.country` (all with langId='ar')
- **skip:** 0, **take:** 10

---

## Configuration Properties

### `searchConfig: SearchConfig`

```typescript
export type SearchMode = 'contains' | 'startsWith' | 'equals';
export type SearchField = string | { field: string; mode?: SearchMode };

export interface SearchConfig {
  translationFields?: SearchField[];       // fields on translations table
  directFields?: SearchField[];            // fields directly on the model
  relationFields?: RelationSearchField[];  // fields on related tables
}

export interface RelationSearchField {
  relation: string;          // relation name on the model
  fields: SearchField[];     // fields to search within
  isTranslation?: boolean;   // if true, searches relation.translations.some(...)
}
```

### `filterConfig: FilterConfig`

```typescript
export type FilterConfig = Record<string, 'string' | 'number' | 'bigint' | 'boolean'>;
```

### `defaultListInclude` / `defaultDetailInclude`

Prisma `include` with `'__langId__'` token (replaced via recursive traversal at runtime).

### `allowedIncludes: AllowedIncludes`

Maps `?include=key` to Prisma include structures. Supports `__langId__` token.

### `mediaConfig: Record<string, MediaSlotConfig>`

```typescript
protected readonly mediaConfig = {
  image: { collection: 'show-rooms', single: true, allowedTypes: [MediaType.IMAGE] },
  gallery: { collection: 'gallery', single: false },
};
```

---

## Type Safety

Use `satisfies` with exported utility types for compile-time field validation:

```typescript
import { ScalarFields, TranslationFields, RelationFields } from '@/common/repositories/base.repository';

// Direct fields — validated against model's scalar fields
protected readonly searchConfig = {
  directFields: ['name', 'email'] satisfies ScalarFields<User>[],
};

// Translation fields — validated against model's translation type
protected readonly searchConfig = {
  translationFields: ['name', 'address'] satisfies TranslationFields<ShowRoomType>[],
};

// Relation fields — validated against model's relation keys
protected readonly searchConfig = {
  relationFields: [
    { relation: 'user' satisfies RelationFields<Review>, fields: ['name'] },
  ],
};
```

**If you typo a field:**
```typescript
directFields: ['namee'] satisfies ScalarFields<User>[]
//             ~~~~~~~ Error: Type '"namee"' is not assignable. Did you mean '"name"'?
```

### Utility Types

| Type | Extracts | Example |
|------|----------|---------|
| `ScalarFields<T>` | string/number/boolean/bigint/Date fields from T | `'name' \| 'email' \| 'createdAt'` |
| `TranslationFields<T>` | Scalar fields from T's translations array element | `'name' \| 'description'` |
| `RelationFields<T>` | Object/relation field keys from T | `'role' \| 'addresses' \| 'reviews'` |

---

## Inherited Methods

| Method | Description |
|--------|-------------|
| `findAll(query, langId?, options?)` | Paginated list with search/filter/includes + dynamic includes |
| `findByIdWithRelations(id, langId?)` | Single record with detail includes |
| `buildWhereClause(query, langId?)` | Builds Prisma where from searchConfig (overridable) |
| `findById(id, options?)` | Find by primary key |
| `findOne(where, options?)` | Find first matching record |
| `findMany(where?, options?)` | Find all matching records |
| `create(data, options?)` | Create with translations + media handling |
| `update(id, data, options?)` | Update with translations + media handling |
| `delete(id)` | Delete with media cleanup |
| `count(where?)` | Count records |
| `exists(where)` | Check existence |
| `paginate(query, where?, options?)` | Low-level pagination helper |

---

## Overriding `buildWhereClause`

For repositories with custom filtering logic:

```typescript
// Collections: adds hierarchy-based custom filters
protected buildWhereClause(query: CollectionQueryDto, langId?: string) {
  const baseWhere = super.buildWhereClause(query, langId);
  const conditions = [baseWhere];

  if (query.customFilter === 'collection') {
    conditions.push({ parentId: null });
  } else if (query.customFilter === 'sub_collection') {
    conditions.push({ parent: { parentId: null } });
  }

  return this.queryBuilder!.combineWhereConditions(...conditions);
}
```

---

## Overriding `findAll`

For repositories that need post-processing:

```typescript
async findAll(query, langId, options?) {
  const where = this.buildCollectionWhereClause(query, langId);
  const result = await this.paginate(query, where, { include: { _count: { select: { children: true } } } });

  if (Array.isArray(result)) return result.map(item => this.mapHasChildren(item));
  result.data = result.data.map(item => this.mapHasChildren(item));
  return result;
}
```

---

## Constructor Pattern

```typescript
// Full (search + media)
super(prisma, mediaService, queryBuilder);

// No search (media only — carts, coupons, products, variants)
super(prisma, mediaService, undefined);

// No media, no search (orders)
super(prisma, undefined, undefined);

// Search only, no media (roles)
super(prisma, undefined, queryBuilder);
```

---

## File Structure

```
src/common/
├── repositories/
│   └── base.repository.ts       ← Generic base with all shared logic
├── services/
│   └── query-builder.service.ts  ← Filter/search/combine utilities
├── dto/
│   └── advanced-query.dto.ts     ← Query params (page, limit, filters, sort, search)
└── utils/
    └── pagination.util.ts        ← Pagination math helpers
```
