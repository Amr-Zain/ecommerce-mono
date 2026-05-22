# Fayendra API - Postman Collection

This directory contains Postman collections and environments for testing the Fayendra API.

## Files

- `Fayendra-API.postman_collection.json` - Main API collection with all endpoints
- `Fayendra-Local.postman_environment.json` - Local development environment

## Import Instructions

### Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Fayendra-API.postman_collection.json`
4. Click **Import**

### Import Environment
1. Click the **Environments** icon (gear icon)
2. Click **Import**
3. Select `Fayendra-Local.postman_environment.json`
4. Click **Import**
5. Select **Fayendra Local** from the environment dropdown

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
*Note:* Also supports `type: "phone"` with `"phone"` and required `"phoneCode"`.

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
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "1234567890",
  "phoneCode": "+1"
}
```

#### 5. Login (Admins only, password login)
- **Method:** POST
- **URL:** `{{baseUrl}}/auth/login`
- **Headers:** `x-platform: browser`
- **Body:**
```json
{
  "email": "admin@fayendra.com",
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
*Note:* Read from cookie first if browser platform.

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
- Validate email format and password length (min 6 characters)

### 409 Conflict
- Email already exists - use a different email address

## Notes

- All timestamps are in ISO 8601 format
- BigInt IDs are returned as strings in JSON responses
- Passwords are automatically hashed using bcrypt
- Default user type is "client" if not specified
