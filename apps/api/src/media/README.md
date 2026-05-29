# Polymorphic Media System (Collection-Key Based)

The new media system eliminates redundant database columns and boilerplate code by using a **collection-key based polymorphic approach**.

## Architecture Overview

1.  **Polymorphic Storage**: Media records are stored in a single table, linked to entities via `model` (e.g., 'country') and `modelId`.
2.  **Collection Keys**: Every media item belongs to a `collection` (e.g., 'avatar', 'flag', 'gallery'). This allows a single entity to have multiple independent media slots.
3.  **No Schema Boilerplate**: Entities no longer need `media Media[]` relations or `model` columns in their Prisma schema.
4.  **Semantic API**: Instead of a generic `media` array, the API returns semantic keys like `flag` or `avatar`.
5.  **Auto-Shaping**: Single-media slots return objects; multi-media slots return arrays.
6.  **Lifecycle Management**: Files and DB records are automatically cleaned up when an entity is deleted or a single-media slot is updated.

---

## How to Use

### 1. Configure the Repository

In your repository extending `BaseRepository`, define the `mediaConfig`. You no longer need to set `modelName`.

```typescript
@Injectable()
export class CountriesRepository extends BaseRepository<CountryType> {
  // Define your media slots here
  protected readonly mediaConfig = {
    flag: { 
      collection: 'flag', // DB collection key
      single: true,       // Returns as object, replaces old on update
      allowedTypes: [MediaType.IMAGE] 
    },
    // You can add more slots
    // gallery: { collection: 'gallery', single: false } 
  };

  constructor(prisma: PrismaService, mediaService: MediaService) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.country;
  }
}
```

### 2. Update the DTO

Use the semantic key (the key you defined in `mediaConfig`) in your DTOs.

```typescript
export class CreateCountryDto {
  // ... other fields
  
  @IsOptional()
  @IsString()
  flag?: string; // The attachment hash from the upload process
}
```

### 3. API Response

The `BaseRepository` automatically fetches and merges media into your results.

**Single Media (`single: true`):**
```json
{
  "id": "1",
  "name": "Saudi Arabia",
  "flag": {
    "uuid": "...",
    "path": "/uploads/country/1/flag_xyz.png",
    "originalName": "flag.png",
    "collection": "flag"
  }
}
```

**Multi Media (`single: false`):**
```json
{
  "id": "10",
  "name": "Summer Collection",
  "gallery": [
    { "uuid": "...", "path": "..." },
    { "uuid": "...", "path": "..." }
  ]
}
```

---

## Features

### Bulk Fetching (No N+1)
When you call `paginate`, `findMany`, or any list method, the repository performs exactly **two** queries:
1.  Fetch the entities (Prisma).
2.  Fetch all associated media for all entities in one bulk query (MediaService).
3.  Merge them in memory.

### Automatic Cleanup
- **On Delete**: Calling `this.delete(id)` in the repository automatically deletes all associated media from both the database and the physical file system.
- **On Update (Single)**: If a slot is marked as `single: true`, providing a new attachment hash during `update` will automatically delete the previous media file and record.

### Type Safety
Media types are restricted based on the `allowedTypes` array in `mediaConfig`.

---

## Database Migration Note

Since relations were removed from the Prisma schema, you must run:
1. `npx prisma migrate dev --name simplify-media-system`
2. `npx prisma generate`

This will drop the old FK columns and the `model` columns from entity tables.
