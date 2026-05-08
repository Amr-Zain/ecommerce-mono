# Access Control System

## Overview

The application uses **path-based access control** to automatically enforce user type restrictions based on URL structure.

## User Types

1. **Guest** - Unauthenticated users (no token required)
2. **Client** - Authenticated customers (`userType: "client"`)
3. **Admin** - Dashboard users with role-based permissions (`userType: "admin"`)

## URL Structure

### Public Endpoints (No Authentication Required)
```
/auth/login
/auth/register
/auth/verify-email
/products
/categories
/pages
/faqs
```

### Client Endpoints (Requires `userType: "client"`)
```
/client/profile
/client/orders
/client/addresses
/client/cart
```

### Admin Endpoints (Requires `userType: "admin"` + Permissions)
```
/admin/dashboard
/admin/users
/admin/products
/admin/orders
/admin/categories
```

## Guard System

The application uses **2 global guards** that run in order:

### 1. JwtAuthGuard (Combined Authentication + User Type)
- **Purpose**: Validates JWT token AND enforces user type based on URL path
- **Behavior**:
  - Public endpoints (`@Public()` decorator) → Skip authentication
  - `/admin/*` paths → Require valid JWT + `user.userType === "admin"`
  - `/client/*` paths → Require valid JWT + `user.userType === "client"`
  - All other endpoints → Require valid JWT token
- **Location**: `src/auth/guards/jwt-auth.guard.ts`
- **No decorators needed** - Automatic based on path

### 2. PermissionsGuard
- **Purpose**: Enforces role-based permissions for admin users
- **Behavior**:
  - Only runs for admin users (`user.userType === "admin"`)
  - Checks `@RequirePermissions()` decorator
  - Validates user has required permissions in their role
- **Location**: `src/auth/guards/permissions.guard.ts`

## How It Works

### Example 1: Guest Accessing Public Endpoint
```
Request: GET /products
↓
JwtAuthGuard: @Public() → Allow (skip auth)
↓
PermissionsGuard: No @RequirePermissions() → Allow
↓
✅ Access Granted
```

### Example 2: Client Accessing Client Endpoint
```
Request: GET /client/profile
Headers: Authorization: Bearer <client-token>
↓
JwtAuthGuard: 
  - Path starts with /client → Authenticate
  - Valid token → Attach user to request
  - Check user.userType === "client" → Allow
↓
PermissionsGuard: User is not admin → Skip
↓
✅ Access Granted
```

### Example 3: Client Trying to Access Admin Endpoint
```
Request: GET /admin/users
Headers: Authorization: Bearer <client-token>
↓
JwtAuthGuard:
  - Path starts with /admin → Authenticate
  - Valid token → Attach user to request
  - Check user.userType === "admin" → ❌ DENY
↓
🚫 403 Forbidden: "Admin access only"
```

### Example 4: Admin Accessing Admin Endpoint
```
Request: GET /admin/users
Headers: Authorization: Bearer <admin-token>
↓
JwtAuthGuard:
  - Path starts with /admin → Authenticate
  - Valid token → Attach user to request
  - Check user.userType === "admin" → Allow
↓
PermissionsGuard: Check @RequirePermissions({ resource: 'users', action: 'list' })
  → Check user.role.permissions contains { resource: 'users', action: 'list' }
  → If yes: Allow, If no: Deny
↓
✅ Access Granted (if permissions match)
```

## JWT Payload

The JWT access token includes:

```typescript
{
  sub: "123",              // User ID
  email: "user@example.com",
  role: "Super Admin",     // Role name (for admin users)
  userType: "admin",       // NEW: "client" or "admin"
  type: "access",
  iat: 1234567890,
  exp: 1234568790
}
```

## Module Structure

```
src/
├── auth/                    # Authentication & authorization
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # Combined: Auth + User Type validation
│   │   └── permissions.guard.ts      # Role-based permissions
│   └── ...
│
├── client/                  # Client-facing endpoints
│   ├── profile/
│   │   └── profile.controller.ts  # /client/profile
│   ├── orders/
│   └── addresses/
│
├── admin/                   # Admin dashboard endpoints
│   ├── dashboard/
│   │   └── dashboard.controller.ts  # /admin/dashboard
│   ├── users/
│   └── products/
│
└── public endpoints (no prefix)
    ├── products/
    ├── categories/
    └── auth/
```

## Creating New Endpoints

### Public Endpoint
```typescript
@Controller('products')
export class ProductsController {
  @Get()
  @Public()  // Mark as public
  findAll() {
    return this.productsService.findAll();
  }
}
```

### Client Endpoint
```typescript
@Controller('client/orders')
export class ClientOrdersController {
  @Get()
  // No decorator needed - path-based access control
  getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findByUserId(user.id);
  }
}
```

### Admin Endpoint
```typescript
@Controller('admin/users')
export class AdminUsersController {
  @Get()
  @RequirePermissions({ resource: 'users', action: 'list' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions({ resource: 'users', action: 'create' })
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }
}
```

## Benefits

✅ **No boilerplate decorators** - Path determines access automatically  
✅ **Clear URL structure** - Easy to understand who can access what  
✅ **Centralized logic** - All access control in guards  
✅ **Type-safe** - TypeScript ensures correct user types  
✅ **Scalable** - Easy to add new user types (e.g., `/vendor`)  
✅ **RESTful** - Follows standard API design patterns  

## Testing Access Control

### Test as Guest
```bash
# Should work
curl http://localhost:3000/products

# Should fail (401 Unauthorized)
curl http://localhost:3000/client/profile
```

### Test as Client
```bash
# Login as client
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password"}' \
  | jq -r '.accessToken')

# Should work
curl http://localhost:3000/client/profile \
  -H "Authorization: Bearer $TOKEN"

# Should fail (403 Forbidden: "Admin access only")
curl http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Test as Admin
```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.accessToken')

# Should work (if has permissions)
curl http://localhost:3000/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Should fail (403 Forbidden: "Client access only")
curl http://localhost:3000/client/profile \
  -H "Authorization: Bearer $TOKEN"
```
