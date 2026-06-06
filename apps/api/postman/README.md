# Ecommerce API - Postman Collection

This directory contains Postman collections and environments for testing the Ecommerce API.

## Files

- `Ecommerce-API.postman_collection.json` - Main API collection with all endpoints
- `Ecommerce-Local.postman_environment.json` - Local development environment

## Import Instructions

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select `Ecommerce-API.postman_collection.json`
4. Click **Import**

### Import Environment

1. Click the **Environments** icon (gear icon)
2. Click **Import**
3. Select `Ecommerce-Local.postman_environment.json`
4. Click **Import**
5. Select **Ecommerce Local** from the environment dropdown

## Available Endpoints

### Users Module

#### 1. Create User

- **Method:** POST
- **URL:** `{{baseUrl}}/users`
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "1234567890",
  "phoneCode": "+1",
  "userType": "client",
  "isActive": true
}
```

#### 2. Get All Users (Paginated)

- **Method:** GET
- **URL:** `{{baseUrl}}/users?page=1&limit=10`
- **Query Parameters:**
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10, max: 100)

#### 3. Get All Users (No Pagination)

- **Method:** GET
- **URL:** `{{baseUrl}}/users?paginate=0`
- **Query Parameters:**
  - `paginate=0` - Disable pagination to get all results

#### 4. Get Active Users

- **Method:** GET
- **URL:** `{{baseUrl}}/users?filters[isActive]=1&page=1&limit=10`
- **Query Parameters:**
  - `filters[isActive]=1` - Filter by active status

#### 5. Search Users

- **Method:** GET
- **URL:** `{{baseUrl}}/users?search=john&page=1&limit=10`
- **Query Parameters:**
  - `search` - Search in name and email fields

#### 6. Filter and Sort Users

- **Method:** GET
- **URL:** `{{baseUrl}}/users?filters[isActive]=1&filters[isEmailVerified]=1&sort[createdAt]=desc&sort[name]=asc&page=1&limit=10`
- **Query Parameters:**
  - `filters[isActive]=1` - Filter by active status
  - `filters[isEmailVerified]=1` - Filter by email verified status
  - `sort[createdAt]=desc` - Sort by creation date descending
  - `sort[name]=asc` - Then sort by name ascending

#### 7. Get User by ID

- **Method:** GET
- **URL:** `{{baseUrl}}/users/1`

#### 8. Update User

- **Method:** PATCH
- **URL:** `{{baseUrl}}/users/1`
- **Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "isActive": true
}
```

#### 9. Delete User

- **Method:** DELETE
- **URL:** `{{baseUrl}}/users/1`

#### 10. Get Users Count

- **Method:** GET
- **URL:** `{{baseUrl}}/users/count/total`

### Auth Module

#### 1. Send OTP

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/send-otp`
- **Body:**

```json
{
  "type": "email",
  "email": "john.doe@example.com"
}
```

_Note:_ Also supports `type: "phone"` with `"phone"` and required `"phoneCode"`.

#### 2. Login OTP (Verify OTP)

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/login-otp`
- **Headers:** `x-platform: browser` or `x-platform: mobile` (default: `browser`)
- **Body:**

```json
{
  "type": "email",
  "email": "john.doe@example.com",
  "code": "1111",
  "guestToken": "guest_token_uuid_if_any"
}
```

#### 3. Create Guest

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/create-guest`
- **Headers:** `x-platform: browser` or `x-platform: mobile` (default: `browser`)

#### 4. Register (First-time custom profile creation)

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/register`
- **Body:**

```json
{
  "type": "email",
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

#### 5. Login (Admins only, password login)

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `x-platform: browser`
- **Body:**

```json
{
  "email": "admin@ecommerce.com",
  "password": "password123"
}
```

#### 6. Refresh Token

- **Method:** POST
- **URL:** `{{baseUrl}}/auth/refresh`
- **Headers:** `x-platform: browser` or `x-platform: mobile`
- **Body:**

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

_Note:_ Read from cookie first if browser platform.

#### 7. Get Profile (Me)

- **Method:** GET
- **URL:** `{{baseUrl}}/auth/me`

### Media Module

#### 1. Upload Single

- **Method:** POST
- **URL:** `{{baseUrl}}/media/upload`
- **Body:** Multipart/form-data (`file`, `model`, `modelId`, `collection`)

#### 2. Upload Many

- **Method:** POST
- **URL:** `{{baseUrl}}/media/upload-many`
- **Body:** Multipart/form-data (`files`, `model`, `modelId`, `collection`)

#### 3. Attach Media

- **Method:** POST
- **URL:** `{{baseUrl}}/media/attach`
- **Body:**

```json
{
  "model": "product",
  "modelId": "1",
  "mediaUuids": ["uuid-1", "uuid-2"],
  "collection": "gallery"
}
```

#### 4. Get Media by UUID

- **Method:** GET
- **URL:** `{{baseUrl}}/media/:uuid`

### Show Rooms Module (Admin CRUD)

#### 1. List Show Rooms

- **Method:** GET
- **URL:** `{{baseUrl}}/admin/show-rooms?page=1&limit=10`

#### 2. Get Show Room by ID

- **Method:** GET
- **URL:** `{{baseUrl}}/admin/show-rooms/1`

#### 3. Create Show Room

- **Method:** POST
- **URL:** `{{baseUrl}}/admin/show-rooms`
- **Body:**

```json
{
  "countryId": 1,
  "phoneCode": "+966",
  "phone": "512345678",
  "email": "riyadh@example.com",
  "url": "https://maps.google.com/?q=24.7136,46.6753",
  "lat": 24.7136,
  "lng": 46.6753,
  "isActive": true,
  "translations": [
    {
      "langId": "en",
      "name": "Riyadh Showroom",
      "address": "King Fahd Road, Olaya District",
      "city": "Riyadh"
    },
    {
      "langId": "ar",
      "name": "معرض الرياض",
      "address": "طريق الملك فهد، حي العليا",
      "city": "الرياض"
    }
  ]
}
```

#### 4. Update Show Room

- **Method:** PATCH
- **URL:** `{{baseUrl}}/admin/show-rooms/1`
- **Body:**

```json
{
  "phone": "512345679",
  "translations": [{ "langId": "en", "name": "Riyadh Showroom Updated" }]
}
```

#### 5. Delete Show Room

- **Method:** DELETE
- **URL:** `{{baseUrl}}/admin/show-rooms/1`

## Query Parameters Guide

### Pagination

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `paginate` - Enable/disable pagination (1 or 0, default: 1)

### Filtering

Use nested filter syntax: `filters[fieldName]=value`

**Examples:**

- `filters[isActive]=1` - Filter active users
- `filters[isEmailVerified]=1` - Filter verified users
- `filters[userType]=client` - Filter by user type

**Boolean Values:**

- `1` or `true` = true
- `0` or `false` = false

### Sorting

Use nested sort syntax: `sort[fieldName]=direction`

**Examples:**

- `sort[createdAt]=desc` - Sort by creation date descending
- `sort[name]=asc` - Sort by name ascending
- Multiple sorts: `sort[createdAt]=desc&sort[name]=asc`

### Search

- `search=keyword` - Search in name and email fields (case-insensitive)

### Include Relations

- `include=role,image` - Include related data (comma-separated)

## Complete Query Examples

### Example 1: Active users, sorted by creation date

```
GET /users?filters[isActive]=1&sort[createdAt]=desc&page=1&limit=10
```

### Example 2: Search with filters

```
GET /users?search=john&filters[isActive]=1&page=1&limit=10
```

### Example 3: Multiple filters and sorts

```
GET /users?filters[isActive]=1&filters[isEmailVerified]=1&sort[createdAt]=desc&sort[name]=asc&page=1&limit=20
```

### Example 4: Get all users without pagination

```
GET /users?paginate=0&filters[isActive]=1&sort[name]=asc
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Environment Variables

### Local Environment

- `baseUrl` - http://localhost:3000
- `apiVersion` - v1

## Testing Tips

1. **Start the server** before testing:

   ```bash
   pnpm run start:dev
   ```

2. **Create test data** using the Create User endpoint first

3. **Test pagination** by creating multiple users and adjusting page/limit parameters

4. **Test filters** with different combinations of active/inactive users

5. **Test search** with partial names or emails

## Troubleshooting

### Connection Refused

- Ensure the API server is running on port 3000
- Check if the `baseUrl` environment variable is correct

### 404 Not Found

- Verify the endpoint path is correct
- Check if the user ID exists in the database

### 400 Bad Request

- Check the request body format
- Ensure required fields are provided
- Validate email format

### 409 Conflict

- Email or phone already exists - use a different identifier

## Client API Endpoints

Client endpoints use `@ApiContext('client')` which returns thin responses: only the requested language fields at root level, no `en`/`ar` language keys, no `translations` array.

### Authentication

- **Public endpoints** (no auth required): Home, Countries, Cities, Sliders, FAQs, Collections, Products, Attributes, Static Pages, Show Rooms, Product Reviews
- **Authenticated endpoints** (client JWT required): Profile, Addresses, Reviews (create/update/delete), Orders

### Home

| Method | URL            | Auth   | Description               |
| ------ | -------------- | ------ | ------------------------- |
| GET    | `/client/home` | Public | Aggregated home page data |

### Countries

| Method | URL                     | Auth   | Description           |
| ------ | ----------------------- | ------ | --------------------- |
| GET    | `/client/countries`     | Public | List active countries |
| GET    | `/client/countries/:id` | Public | Get country by ID     |

### Cities

| Method | URL                  | Auth   | Description        |
| ------ | -------------------- | ------ | ------------------ |
| GET    | `/client/cities`     | Public | List active cities |
| GET    | `/client/cities/:id` | Public | Get city by ID     |

### Sliders

| Method | URL               | Auth   | Description         |
| ------ | ----------------- | ------ | ------------------- |
| GET    | `/client/sliders` | Public | List active sliders |

### FAQs

| Method | URL            | Auth   | Description      |
| ------ | -------------- | ------ | ---------------- |
| GET    | `/client/faqs` | Public | List active FAQs |

### Collections

| Method | URL                       | Auth   | Description                  |
| ------ | ------------------------- | ------ | ---------------------------- |
| GET    | `/client/collections`     | Public | List active collections      |
| GET    | `/client/collections/:id` | Public | Get collection with children |

### Products

| Method | URL                    | Auth   | Description                        |
| ------ | ---------------------- | ------ | ---------------------------------- |
| GET    | `/client/products`     | Public | List active products with variants |
| GET    | `/client/products/:id` | Public | Get product by ID with variants    |

### Attributes

| Method | URL                      | Auth   | Description                        |
| ------ | ------------------------ | ------ | ---------------------------------- |
| GET    | `/client/attributes`     | Public | List active attributes with values |
| GET    | `/client/attributes/:id` | Public | Get attribute with values          |

### Static Pages

| Method | URL                          | Auth   | Description                    |
| ------ | ---------------------------- | ------ | ------------------------------ |
| GET    | `/client/static-pages`       | Public | List active pages              |
| GET    | `/client/static-pages/:slug` | Public | Get page by slug with sections |

### Show Rooms

| Method | URL                  | Auth   | Description            |
| ------ | -------------------- | ------ | ---------------------- |
| GET    | `/client/show-rooms` | Public | List active show rooms |

### Profile (requires client JWT)

| Method | URL                     | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/client/profile`       | Get profile with avatar and addresses |
| PUT    | `/client/profile`       | Update name, phone                    |
| PUT    | `/client/profile/image` | Update avatar                         |

### Addresses (requires client JWT)

| Method | URL                             | Description           |
| ------ | ------------------------------- | --------------------- |
| GET    | `/client/addresses`             | List user's addresses |
| POST   | `/client/addresses`             | Create address        |
| PUT    | `/client/addresses/:id`         | Update address        |
| DELETE | `/client/addresses/:id`         | Delete address        |
| PUT    | `/client/addresses/:id/default` | Set default address   |

### Reviews

| Method | URL                                   | Auth       | Description              |
| ------ | ------------------------------------- | ---------- | ------------------------ |
| GET    | `/client/reviews/products/:productId` | Public     | List reviews for product |
| POST   | `/client/reviews`                     | Client JWT | Create review            |
| PUT    | `/client/reviews/:id`                 | Client JWT | Update own review        |
| DELETE | `/client/reviews/:id`                 | Client JWT | Delete own review        |

### Orders (requires client JWT)

| Method | URL                         | Description                                                           |
| ------ | --------------------------- | --------------------------------------------------------------------- |
| GET    | `/client/orders`            | List user's orders                                                    |
| GET    | `/client/orders/:id`        | Get order detail                                                      |
| POST   | `/client/orders`            | Create order                                                          |
| POST   | `/client/orders/:id/cancel` | Cancel a `pending` order, refund remaining payment, and restore stock |

### Returns (requires client JWT)

| Method | URL                          | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/client/returns`            | List user's return requests                  |
| POST   | `/client/returns`            | Create return request with one or more items |
| POST   | `/client/returns/:id/cancel` | Cancel return while `requested`              |

### Exchanges (requires client JWT)

| Method | URL                            | Description                                    |
| ------ | ------------------------------ | ---------------------------------------------- |
| GET    | `/client/exchanges`            | List user's exchange requests                  |
| POST   | `/client/exchanges`            | Create exchange request with one or more items |
| POST   | `/client/exchanges/:id/cancel` | Cancel exchange while `requested`              |

### Notifications (requires client JWT)

| Method | URL                                     | Description                             |
| ------ | --------------------------------------- | --------------------------------------- |
| GET    | `/client/notifications?page=1&limit=20` | List the current client's notifications |
| GET    | `/client/notifications?unread=true`     | List unread notifications               |
| GET    | `/client/notifications/unread-count`    | Get unread notification count           |
| PATCH  | `/client/notifications/:id/read`        | Mark one owned notification as read     |
| PATCH  | `/client/notifications/read-all`        | Mark all owned notifications as read    |
| GET    | `/client/notifications/stream`          | Open the notification SSE stream        |

The REST endpoints are the durable notification source. The SSE stream delivers new notifications and heartbeat events while connected.

For reliable SSE testing outside the storefront, use:

```bash
curl -N \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: text/event-stream" \
  -H "Accept-Language: en" \
  http://localhost:3000/client/notifications/stream
```

Postman support for long-lived SSE requests can vary by version. Keep the stream request open and use the REST list endpoint to recover any missed events.

### Wallet (requires client JWT)

| Method | URL                                                                           | Description                                    |
| ------ | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| GET    | `/client/wallet`                                                              | Get current wallet balance                     |
| GET    | `/client/wallet/transactions?filters[type]=deposit&filters[status]=completed` | List wallet transactions with advanced filters |
| POST   | `/client/wallet/deposits`                                                     | Create Stripe wallet deposit                   |
| GET    | `/client/wallet/deposits/:id`                                                 | Get deposit transaction                        |
| POST   | `/client/wallet/deposits/:id/verify`                                          | Verify deposit if webhook is delayed           |
| GET    | `/client/wallet/withdrawals?filters[status]=requested`                        | List withdrawal requests with advanced filters |
| POST   | `/client/wallet/withdrawals`                                                  | Request manual bank transfer withdrawal        |
| GET    | `/client/wallet/withdrawals/:id`                                              | Get withdrawal request                         |
| POST   | `/client/wallet/withdrawals/:id/cancel`                                       | Cancel withdrawal while `requested`            |

## Admin Order, Return, And Exchange Endpoints

### Orders (requires admin JWT)

| Method | URL                                                           | Description                                                                  |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/admin/orders`                                               | List/filter orders                                                           |
| GET    | `/admin/orders/:id`                                           | Get order detail with payment totals and full status audit                   |
| PATCH  | `/admin/orders/:id/status`                                    | Move order through allowed fulfillment transitions or cancel before shipping |
| POST   | `/admin/orders/:id/confirm-payment`                           | Confirm pending/manual payment                                               |
| POST   | `/admin/orders/:orderId/cancellation-refunds/:refundId/retry` | Retry a cancellation refund requiring review                                 |

Cancellation uses `PATCH /admin/orders/:id/status`:

```json
{
  "status": "cancelled",
  "reason": "Customer requested cancellation before shipment"
}
```

There is no standalone admin order-refund endpoint. Cancellation refunds the full remaining payment and restores stock. Partial refunds are available only through return/exchange flows.

### Returns (requires admin JWT)

| Method | URL                           | Description                                                                                   |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/admin/returns`              | List/filter return requests                                                                   |
| GET    | `/admin/returns/:id`          | Get return detail, items, refund state, and status history                                    |
| POST   | `/admin/returns/:id/approve`  | Approve return request                                                                        |
| POST   | `/admin/returns/:id/reject`   | Reject return request                                                                         |
| POST   | `/admin/returns/:id/receive`  | Mark all returned items received, set dispositions, and lock adjusted refund/shipping amounts |
| POST   | `/admin/returns/:id/refund`   | Process or record the locked return refund                                                    |
| POST   | `/admin/returns/:id/complete` | Complete refunded return                                                                      |

### Exchanges (requires admin JWT)

| Method | URL                                      | Description                                                                             |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/admin/exchanges`                       | List/filter exchange requests                                                           |
| GET    | `/admin/exchanges/:id`                   | Get exchange detail, items, reservation, settlement, and status history                 |
| POST   | `/admin/exchanges/:id/approve`           | Approve exchange and reserve replacement stock                                          |
| POST   | `/admin/exchanges/:id/retry-reservation` | Retry replacement reservation after stock becomes available                             |
| POST   | `/admin/exchanges/release-expired`       | Release all expired replacement reservations and move them to review                    |
| POST   | `/admin/exchanges/:id/reject`            | Reject exchange and release reserved stock if needed                                    |
| POST   | `/admin/exchanges/:id/receive`           | Mark all old items received, set dispositions, and lock replacement shipping settlement |
| POST   | `/admin/exchanges/:id/payment`           | Create payment for higher replacement price                                             |
| POST   | `/admin/exchanges/:id/verify-payment`    | Verify exchange difference payment                                                      |
| POST   | `/admin/exchanges/:id/refund-difference` | Refund lower replacement price difference                                               |
| POST   | `/admin/exchanges/:id/waive-adjustment`  | Waive required payment/refund difference                                                |
| POST   | `/admin/exchanges/:id/ship`              | Mark replacement shipped                                                                |
| POST   | `/admin/exchanges/:id/complete`          | Complete shipped exchange                                                               |

The exchange payment endpoints create or verify the gateway payment operation. The admin dashboard does not mark Stripe payments paid; verified webhook/gateway confirmation settles them.

### Notifications (requires admin JWT)

| Method | URL                                    | Description                            |
| ------ | -------------------------------------- | -------------------------------------- |
| GET    | `/admin/notifications?page=1&limit=20` | List the current admin's notifications |
| GET    | `/admin/notifications?unread=true`     | List unread notifications              |
| GET    | `/admin/notifications/unread-count`    | Get unread notification count          |
| PATCH  | `/admin/notifications/:id/read`        | Mark one owned notification as read    |
| PATCH  | `/admin/notifications/read-all`        | Mark all owned notifications as read   |
| GET    | `/admin/notifications/stream`          | Open the notification SSE stream       |

Admin notifications are generated only for active admins whose role has `list` or `read` permission for the related resource.

### Wallet (requires admin JWT)

| Method | URL                                                                   | Description                             |
| ------ | --------------------------------------------------------------------- | --------------------------------------- |
| GET    | `/admin/wallets?search=email&filters[status]=active`                  | List wallets with advanced filters      |
| GET    | `/admin/wallets/:id`                                                  | Get wallet detail                       |
| GET    | `/admin/wallet-transactions?filters[user_id]=1&filters[type]=deposit` | List all wallet transactions            |
| GET    | `/admin/wallet-withdrawals?filters[status]=requested`                 | List withdrawal requests                |
| GET    | `/admin/wallet-withdrawals/:id`                                       | Get withdrawal request                  |
| POST   | `/admin/wallet-withdrawals/:id/approve`                               | Approve manual withdrawal               |
| POST   | `/admin/wallet-withdrawals/:id/paid`                                  | Mark withdrawal as manually transferred |
| POST   | `/admin/wallet-withdrawals/:id/reject`                                | Reject and return pending balance       |
| POST   | `/admin/wallet-withdrawals/:id/fail`                                  | Mark failed and return pending balance  |

## Notes

- All timestamps are in ISO 8601 format
- BigInt IDs are returned as strings in JSON responses
- API responses are returned in `snake_case`
- Order details include `original_paid_amount`, `refunded_amount`, `reserved_refund_amount`, `remaining_refundable_amount`, and `status_history`.
- Client cancellation is allowed only for `pending`; admin cancellation is allowed for `pending` and `processing`.
- Failed/uncertain Stripe cancellation refunds keep order and stock unchanged and require retry/review.
- Return/exchange request bodies in the collection use `snake_case`
- Wallet request bodies in the collection use `snake_case`; wallet list endpoints use advanced query filters.
- Return/exchange create payloads use `items[]`.
- Admin return receive payloads cannot refund more than the calculated item/VAT amount or original shipping fee.
- Admin exchange receive payloads settle `total_price_difference + replacement_shipping_fee`.
- Passwords are automatically hashed using bcrypt
- Default user type is "client" if not specified
- Admin endpoints return all language keys (`en`, `ar`, etc.) plus promoted fields
- Client endpoints return only the requested language (via `Accept-Language` header), no language keys or translation arrays
