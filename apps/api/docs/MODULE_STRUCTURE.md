# Module Structure & Path Prefixes

## Overview

The application uses **RouterModule** to automatically prefix all routes within a module, eliminating the need to repeat path prefixes in every controller.

## Configuration

In `src/app.module.ts`:

```typescript
RouterModule.register([
  {
    path: 'admin',
    module: AdminModule,
  },
  {
    path: 'client',
    module: ClientModule,
  },
]),
```

## Result

### Admin Module
All controllers in `AdminModule` automatically get `/admin` prefix:

```typescript
// src/admin/dashboard/dashboard.controller.ts
@Controller('dashboard')  // Becomes: /admin/dashboard
export class DashboardController { }

// src/users/users.controller.ts (imported in AdminModule)
@Controller('users')  // Becomes: /admin/users
export class UsersController { }
```

### Client Module
All controllers in `ClientModule` automatically get `/client` prefix:

```typescript
// src/client/profile/profile.controller.ts
@Controller('profile')  // Becomes: /client/profile
export class ProfileController { }

// src/client/orders/orders.controller.ts
@Controller('orders')  // Becomes: /client/orders
export class OrdersController { }
```

### Public Routes
Controllers NOT in AdminModule or ClientModule have no prefix:

```typescript
// src/products/products.controller.ts
@Controller('products')  // Stays: /products
export class ProductsController { }

// src/auth/auth.controller.ts
@Controller('auth')  // Stays: /auth
export class AuthController { }
```

## Benefits

✅ **No repetition** - Write `@Controller('users')` instead of `@Controller('admin/users')`  
✅ **Centralized** - Change prefix in one place (app.module.ts)  
✅ **Clean** - Controllers focus on their resource name only  
✅ **Scalable** - Easy to add new prefixed modules (e.g., `/vendor`, `/api/v2`)  

## Adding New Admin Endpoints

### Step 1: Create Controller
```typescript
// src/admin/products/products.controller.ts
@Controller('products')  // Will become /admin/products
export class AdminProductsController {
  @Get()
  @RequirePermissions({ resource: 'products', action: 'list' })
  findAll() { }
}
```

### Step 2: Create Module
```typescript
// src/admin/products/products.module.ts
@Module({
  controllers: [AdminProductsController],
})
export class ProductsModule {}
```

### Step 3: Import in AdminModule
```typescript
// src/admin/admin.module.ts
@Module({
  imports: [
    DashboardModule,
    UsersModule,
    ProductsModule,  // Add here
  ],
})
export class AdminModule {}
```

**Done!** The route is automatically available at `/admin/products`

## Adding New Client Endpoints

Same process, but import in `ClientModule` instead:

```typescript
// src/client/client.module.ts
@Module({
  imports: [
    ProfileModule,
    OrdersModule,  // Add new modules here
  ],
})
export class ClientModule {}
```

## Module Hierarchy

```
AppModule
├── AuthModule (no prefix)
├── MediaModule (no prefix)
├── AdminModule (/admin prefix)
│   ├── DashboardModule → /admin/dashboard
│   ├── UsersModule → /admin/users
│   └── [Add more admin modules here]
│
└── ClientModule (/client prefix)
    ├── ProfileModule → /client/profile
    └── [Add more client modules here]
```

## Important Notes

1. **RouterModule must be imported AFTER the modules it references**
2. **Controllers in nested modules inherit the parent prefix**
3. **You can still override with full paths** if needed: `@Controller('/custom/path')`
4. **Guards still work the same** - they check the final resolved path
