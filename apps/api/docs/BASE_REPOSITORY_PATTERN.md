# Base Repository Pattern

## Overview

The `BaseRepository<T>` class eliminates repeated boilerplate across domain repositories by providing a **declarative configuration** approach for:

- **Search** (direct fields, translation fields, relation fields — with configurable match mode)
- **Filtering** (via `AdvancedQueryDto.filters` with automatic type coercion)
- **Pagination** (via `AdvancedQueryDto.page` / `limit`)
- **Sorting** (flat and nested relation sorting via dot-notation)
- **Language-aware includes** (recursive token replacement, no JSON.stringify)
- **Dynamic includes** (conditional includes from query params via `allowedIncludes`)
- **Media attachment** (polymorphic media handling)

Instead of writing `findAll()`, `buildWhereClause()`, and include logic in every repository, you declare **what** to search/include and the base handles the **how**.

---

## Quick Start

```typescript
@Injectable()
export class CitiesRepository extends BaseRepository<City> implements ICitiesRepository {
  // 1. Declare which fields are searchable
  protected readonly searchConfig = {
    translationFields: ['name'],
  };

  // 2. Auto-coerce filter types (string '5' → BigInt(5))
  protected readonly filterConfig = {
    countryId: 'bigint',
  };

  // 3. Declare default includes with __langId__ token
  protected readonly defaultListInclude = {
    country: {
      include: { translations: { where: { langId: '__langId__' } } },
    },
    translations: { where: { langId: '__langId__' }, take: 1 },
  };

  protected readonly defaultDetailInclude = {
    translations: true,
    country: { include: { translations: { where: { langId: '__langId__' } } } },
  };

  // 4. Allow dynamic includes from ?include=country
  protected readonly allowedIncludes = {
    country: { include: { translations: true } },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.city;
  }

  // That's it! findAll(), findByIdWithRelations(), buildWhereClause() are inherited.
}
```

---

## API Query Examples

### Basic pagination

```
GET /cities?page=1&limit=10
```

### Filtering

```
GET /cities?filters[countryId]=5&filters[isActive]=true
```

The `filterConfig` auto-coerces `countryId` from string `"5"` to `BigInt(5)` before passing to Prisma.

### Search (translation fields)

```
GET /cities?search=cairo
```

Generates:
```prisma
{ translations: { some: { langId: 'en', OR: [{ name: { contains: 'cairo', mode: 'insensitive' } }] } } }
```

### Search (relation fields — nested)

For a `ReviewsRepository` with:
```typescript
protected readonly searchConfig = {
  directFields: ['comment'],
  relationFields: [
    { relation: 'user', fields: ['name', 'email'] },
    { relation: 'product', fields: ['name'], isTranslation: true },
  ],
};
```

```
GET /reviews?search=john
```

Generates:
```prisma
{
  OR: [
    { comment: { contains: 'john', mode: 'insensitive' } },
    { user: { name: { contains: 'john', mode: 'insensitive' } } },
    { user: { email: { contains: 'john', mode: 'insensitive' } } },
    { product: { translations: { some: { langId: 'en', OR: [{ name: { contains: 'john', mode: 'insensitive' } }] } } } },
  ]
}
```

### Sorting (flat)

```
GET /cities?sort[createdAt]=desc
```

### Sorting (nested relation — dot-notation)

```
GET /cities?sort[country.name]=asc
```

Generates:
```prisma
orderBy: { country: { name: 'asc' } }
```

```
GET /orders?sort[user.name]=asc
```

Generates:
```prisma
orderBy: { user: { name: 'asc' } }
```

Deep nesting also works:

```
GET /items?sort[product.collection.name]=asc
```

Generates:
```prisma
orderBy: { product: { collection: { name: 'asc' } } }
```

### Dynamic includes (conditional relations)

```
GET /cities?include=country,reviews
```

Only includes relations declared in `allowedIncludes`. Anything not declared is silently ignored (security). The dynamic includes are merged with `defaultListInclude`.

### Language

```
GET /cities?page=1&limit=10
Accept-Language: ar
```

The controller extracts `langId` from headers and passes to `findAll(query, 'ar')`. The `__langId__` tokens in includes resolve to `'ar'`, and search scopes to Arabic translations.

---

## Configuration Properties

### `searchConfig: SearchConfig`

Declares how `buildWhereClause()` constructs search conditions.

```typescript
export type SearchMode = 'contains' | 'startsWith' | 'equals';

export type SearchField = string | { field: string; mode?: SearchMode };

export interface SearchConfig {
  translationFields?: SearchField[];   // fields on translations table
  directFields?: SearchField[];        // fields directly on the model
  relationFields?: RelationSearchField[];  // fields on related tables
}

export interface RelationSearchField {
  relation: string;
  fields: SearchField[];
  isTranslation?: boolean;
}
```

#### Search mode examples

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

```
GET /users?search=ADM
```

Generates:
```prisma
{
  OR: [
    { name: { contains: 'ADM', mode: 'insensitive' } },
    { code: { equals: 'ADM', mode: 'insensitive' } },
    { email: { startsWith: 'ADM', mode: 'insensitive' } },
  ]
}
```

### `filterConfig: FilterConfig`

Declares expected types for filter fields for automatic coercion.

```typescript
export type FilterConfig = Record<string, 'string' | 'number' | 'bigint' | 'boolean'>;
```

```typescript
protected readonly filterConfig = {
  countryId: 'bigint',    // '5' → BigInt(5)
  rating: 'number',       // '4' → 4
  isActive: 'boolean',    // '1'/'true' → true
};
```

Without `filterConfig`, string `"5"` would be passed directly to Prisma causing type mismatches on `bigint` columns.

### `defaultListInclude` / `defaultDetailInclude`

Prisma `include` clauses with `'__langId__'` token support.

The token is replaced via **recursive object traversal** (not JSON.stringify — safe with BigInt, Date, undefined).

```typescript
protected readonly defaultListInclude = {
  translations: { where: { langId: '__langId__' }, take: 1 },
  country: {
    include: { translations: { where: { langId: '__langId__' } } },
  },
};
```

### `allowedIncludes: AllowedIncludes`

Maps query string include keys to their Prisma include structures. Enables `?include=country,reviews` without exposing arbitrary relation access.

```typescript
protected readonly allowedIncludes = {
  country: { include: { translations: { where: { langId: '__langId__' } } } },
  reviews: true,
  collection: { include: { translations: true } },
};
```

Only keys declared here are allowed. Unknown keys are silently dropped.

### `mediaConfig: Record<string, MediaSlotConfig>`

Declares media slots:

```typescript
protected readonly mediaConfig = {
  image: { collection: 'show-rooms', single: true, allowedTypes: [MediaType.IMAGE] },
  gallery: { collection: 'gallery', single: false },
};
```

---

## Type Safety

Use TypeScript's `satisfies` to get compile-time validation of field names:

```typescript
import { ScalarFields, RelationFields } from '@/common/repositories/base.repository';

// Validates that 'name' and 'email' are actual scalar fields on User
protected readonly searchConfig = {
  directFields: ['name', 'email'] satisfies ScalarFields<User>[],
  relationFields: [
    { relation: 'role' satisfies RelationFields<User>, fields: ['name'] },
  ],
};
```

If you typo a field name, TypeScript will error at compile time.

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

## Language Handling (`langId`)

The `langId` parameter flows through two mechanisms:

### 1. Search Filtering

`buildWhereClause()` uses `langId` to scope translation searches:

```prisma
translations: { some: { langId: 'ar', OR: [{ name: { contains: 'بحث' } }] } }
```

### 2. Include Resolution (Recursive Token Replacement)

`defaultListInclude` and `allowedIncludes` use the `'__langId__'` token, replaced at runtime via a recursive object walker:

```typescript
// Defined as:
{ translations: { where: { langId: '__langId__' } } }

// At runtime with langId='ar' becomes:
{ translations: { where: { langId: 'ar' } } }
```

This uses `deepReplace()` (recursive traversal) — safe with BigInt, Date, and any non-serializable values.

---

## Overriding `buildWhereClause`

For repositories with custom filtering logic beyond what `searchConfig` supports:

```typescript
// Collections: adds hierarchy-based custom filters
protected buildWhereClause(query: CollectionQueryDto, langId?: string) {
  const baseWhere = super.buildWhereClause(query, langId); // standard search + filters + coercion
  const conditions = [baseWhere];

  if (query.customFilter === 'collection') {
    conditions.push({ parentId: null });
  }

  return this.queryBuilder!.combineWhereConditions(...conditions);
}
```

```typescript
// Users: adds role exclusion for admin filter
protected buildWhereClause(query: AdvancedQueryDto) {
  const baseWhere = super.buildWhereClause(query);
  const conditions = [baseWhere];

  if (query.filters?.userType === 'admin') {
    conditions.push({ roleId: { not: 1n } });
  }

  return this.queryBuilder!.combineWhereConditions(...conditions);
}
```

---

## Overriding `findAll`

For repositories that need post-processing (e.g. enriching products, mapping `_count`):

```typescript
async findAll(query, langId, options?) {
  const where = this.buildCollectionWhereClause(query, langId);
  const result = await this.paginate(query, where, { include: { ... } });

  // Post-process results
  if (Array.isArray(result)) {
    return result.map(item => this.mapHasChildren(item));
  }
  result.data = result.data.map(item => this.mapHasChildren(item));
  return result;
}
```

---

## Constructor Pattern

```typescript
constructor(
  protected readonly prisma: PrismaService,
  protected readonly mediaService?: MediaService,
  protected readonly queryBuilder?: QueryBuilderService,
) {}
```

**Common patterns:**

```typescript
// Full (search + media)
super(prisma, mediaService, queryBuilder);

// No search (media only)
super(prisma, mediaService, undefined);

// No media, no search
super(prisma, undefined, undefined);

// Search only, no media
super(prisma, undefined, queryBuilder);
```

---

## Migration Guide (Before → After)

### Before (repeated in every repo):

```typescript
async findAll(query: AdvancedQueryDto, langId: string = 'en', options?: QueryOptions) {
  const where = this.buildWhereClause(query, langId);
  if (options?.select) return this.paginate(query, where, { select: options.select });
  return this.paginate(query, where, {
    include: { translations: { where: { langId }, take: 1 } },
  });
}

private buildWhereClause(query, langId) {
  const conditions = [];
  if (Object.keys(query.filters).length > 0) {
    conditions.push(this.queryBuilder.buildFiltersCondition(filters));
  }
  if (query.search && langId) {
    conditions.push({
      translations: { some: { langId, OR: [{ name: { contains: query.search, mode: 'insensitive' } }] } },
    });
  }
  return this.queryBuilder.combineWhereConditions(...conditions);
}
```

### After (just declare config):

```typescript
protected readonly searchConfig = { translationFields: ['name'] };
protected readonly filterConfig = { countryId: 'bigint' };
protected readonly defaultListInclude = { translations: { where: { langId: '__langId__' }, take: 1 } };

// Done. findAll() and buildWhereClause() are inherited from BaseRepository.
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
