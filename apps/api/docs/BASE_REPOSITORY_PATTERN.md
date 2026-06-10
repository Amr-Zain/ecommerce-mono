# Base Repository Pattern

## Overview

The `BaseRepository<T>` class eliminates repeated boilerplate across domain repositories by providing a **declarative configuration** approach for:

- **Search** (direct fields, translation fields, relation fields)
- **Filtering** (via `AdvancedQueryDto.filters`)
- **Pagination** (via `AdvancedQueryDto.page` / `limit`)
- **Language-aware includes** (token-based `langId` replacement)
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

  // 2. Declare default includes with __langId__ token
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

## Configuration Properties

### `searchConfig: SearchConfig`

Declares how the `buildWhereClause()` method constructs search conditions when `query.search` is provided.

```typescript
export interface SearchConfig {
  /** Fields on the model's `translations` table. Searched with: translations.some({ langId, OR: [...] }) */
  translationFields?: string[];

  /** Fields directly on the model. Searched with: { field: { contains, mode: 'insensitive' } } */
  directFields?: string[];

  /** Fields on related tables */
  relationFields?: RelationSearchField[];
}

export interface RelationSearchField {
  /** Relation name, e.g. 'user' or 'product' */
  relation: string;
  /** Fields to search within that relation */
  fields: string[];
  /** If true, searches within relation.translations.some({ langId, OR: [...] }) */
  isTranslation?: boolean;
}
```

#### Examples

**Simple translation search** (most common):
```typescript
protected readonly searchConfig = {
  translationFields: ['name', 'description'],
};
```

**Direct model fields** (e.g. User has name/email directly):
```typescript
protected readonly searchConfig = {
  directFields: ['name', 'email'],
};
```

**Relation search** (search across related tables):
```typescript
protected readonly searchConfig = {
  directFields: ['comment'],
  relationFields: [
    { relation: 'user', fields: ['name', 'email'] },              // user.name, user.email
    { relation: 'product', fields: ['name'], isTranslation: true }, // product.translations.name
  ],
};
```

### `defaultListInclude: IncludeClause | null`

The Prisma `include` clause used by the generic `findAll()` for list/paginated views.

Use the special token `'__langId__'` — it gets replaced at runtime with the actual `langId` parameter.

```typescript
protected readonly defaultListInclude = {
  translations: { where: { langId: '__langId__' }, take: 1 },
  country: {
    include: { translations: { where: { langId: '__langId__' } } },
  },
};
```

### `defaultDetailInclude: IncludeClause | null`

The Prisma `include` clause used by `findByIdWithRelations()` for single-record detail views.

```typescript
protected readonly defaultDetailInclude = {
  translations: true, // all languages for editing
  country: { include: { translations: true } },
};
```

### `mediaConfig: Record<string, MediaSlotConfig>`

Declares media slots (unchanged from before):

```typescript
protected readonly mediaConfig = {
  image: { collection: 'show-rooms', single: true, allowedTypes: [MediaType.IMAGE] },
  gallery: { collection: 'gallery', single: false },
};
```

---

## Inherited Methods

| Method | Description |
|--------|-------------|
| `findAll(query, langId?, options?)` | Paginated list with search/filter/includes |
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

### 2. Include Resolution (Token Replacement)

`defaultListInclude` uses the `'__langId__'` token which is replaced at runtime:

```typescript
// Defined as:
{ translations: { where: { langId: '__langId__' } } }

// At runtime with langId='ar' becomes:
{ translations: { where: { langId: 'ar' } } }
```

This is handled by the private `resolveInclude()` method which does a JSON string replacement.

---

## Overriding `buildWhereClause`

For repositories with custom filtering logic beyond what `searchConfig` supports, override `buildWhereClause`:

```typescript
// Collections: adds hierarchy-based custom filters
protected buildWhereClause(query: CollectionQueryDto, langId?: string) {
  const baseWhere = super.buildWhereClause(query, langId); // get standard search+filters
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

The base constructor accepts three parameters:

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
protected readonly defaultListInclude = { translations: { where: { langId: '__langId__' }, take: 1 } };

// Done. findAll() and buildWhereClause() are inherited from BaseRepository.
```

---

## File Structure

```
src/common/
├── repositories/
│   └── base.repository.ts      ← Generic base with all shared logic
├── services/
│   └── query-builder.service.ts ← Filter/search/combine utilities
├── dto/
│   └── advanced-query.dto.ts    ← Query params (page, limit, filters, sort, search)
└── utils/
    └── pagination.util.ts       ← Pagination math helpers
```
