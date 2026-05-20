# Fayendra Auth Module & Passwordless Flow Documentation

This document describes the modern passwordless authentication architecture, guest session handling, and admin-only secure credential flows implemented in the Fayendra API.

---

## 1. High-Level Architecture Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client / Browser / Mobile
    participant API as AuthController / AuthService
    participant DB as UsersRepository / Prisma

    alt Client Login/Registration (Passwordless OTP)
        Client->>API: POST /auth/send-otp (email/phone)
        API->>DB: Find or auto-register client
        API->>Client: Send 4-digit code (simulated via stdout logs)
        Client->>API: POST /auth/login-otp (code + guestToken)
        API->>DB: Verify code & merge guest records if guestToken exists
        Note over API,DB: Merges Address, Order, & Review records. Deletes guest.
        API->>Client: Return Access Token (+ Set Secure HttpOnly cookie for browser platform)
    
    alt Guest Session Initialization
        Client->>API: POST /auth/create-guest
        API->>DB: Create unverified user (userType: client, guestToken generated)
        API->>Client: Return Guest JWT + guestToken
    
    alt Admin Login (Credentials)
        Client->>API: POST /auth/login (email + password)
        API->>DB: Verify credentials (MUST be userType: admin)
        API->>Client: Set secure HttpOnly cookie & return tokens
    end
```

---

## 2. Key Flows & Merging Logic

### A. Passwordless OTP Flow
1. **Send OTP (`POST /auth/send-otp`)**:
   - The user provides an `email` or a `phone` with a required `phoneCode`.
   - If the user does not exist, a new `client` record is **auto-created** with `isActive: true` and verified flags set to `false`.
   - A random secure 4-digit verification code is generated, stored in the database with a 15-minute expiration, and logged to stdout for local development testing.

2. **Verify OTP (`POST /auth/login-otp`)**:
   - The user provides the `code` and the login key (`email` or `phone`).
   - If the code matches and hasn't expired, the user's verified status is set to `true`.
   - If a `guestToken` is supplied in the payload, the server merges all relations (Orders, Addresses, Reviews) from the guest user profile to the newly verified client profile, and safely deletes the guest account.
   - Generates and signs JWT Access and Refresh tokens.

### B. Guest Profiles & Data Merging
To allow clients to browse, add reviews, configure shipping addresses, and create orders before signing in, Fayendra supports transient **Guest Users**:
- **Creation**: `POST /auth/create-guest` creates a standard user with `userType: "client"` and a unique `guestToken` UUID in the database.
- **Relational Merging**: When a client performs an OTP login/verification and passes a `guestToken`, the database execution is wrapped in a secure database Transaction (`prisma.$transaction`) to safely migrate:
  1. `Address` records linked to the guest user ID.
  2. `Order` records linked to the guest user ID.
  3. `Review` records linked to the guest user ID.
- After successful migration, the guest profile is permanently deleted to keep database tables clean and optimized.

### C. Secure Platform Cookie Settings (`x-platform` routing)
Both `/auth/login`, `/auth/login-otp`, `/auth/create-guest` and `/auth/refresh` support the custom header **`x-platform`**:
- **`x-platform: browser` (or default)**:
  - The `refreshToken` is removed from the JSON body response and set as a secure, `HTTPOnly`, `SameSite: Lax` cookie named `refreshToken`.
  - Only the `accessToken` and `user` payload are returned in the response body.
- **`x-platform: mobile`**:
  - Both `accessToken` and `refreshToken` are returned in the JSON body response for application state storage.

---

## 3. Endpoints & Payload Schema Reference

### 1. Send OTP
* **URL**: `POST /auth/send-otp`
* **Public**: Yes
* **Body Schema**:
  ```json
  {
    "type": "email", // "email" | "phone"
    "email": "john.doe@example.com", // Required if type is "email"
    "phone": "551234567", // Required if type is "phone"
    "phoneCode": "+966" // Required if type is "phone"
  }
  ```
* **Success Response (201)**:
  ```json
  {
    "message": "Verification code sent successfully"
  }
  ```

---

### 2. Login OTP
* **URL**: `POST /auth/login-otp`
* **Public**: Yes
* **Headers**: `x-platform` (optional, `"browser"` | `"mobile"`)
* **Body Schema**:
  ```json
  {
    "type": "email", // "email" | "phone"
    "email": "john.doe@example.com", // Required if type is "email"
    "phone": "551234567", // Required if type is "phone"
    "phoneCode": "+966", // Required if type is "phone"
    "code": "1111", // Required, 4-digit code
    "guestToken": "8aeef142-b054-47be-b333-6cfc3c8612bb" // Optional guest token to merge relations
  }
  ```
* **Success Response (201 - Platform Mobile)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "12",
      "name": "Client User",
      "email": "john.doe@example.com",
      "phone": null,
      "userType": "client"
    }
  }
  ```
* **Success Response (201 - Platform Browser)**:
  - *Response Headers*: `Set-Cookie: refreshToken=eyJhbGciOi...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`
  - *Response Body*:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "12",
        "name": "Client User",
        "email": "john.doe@example.com",
        "phone": null,
        "userType": "client"
      }
    }
    ```

---

### 3. Create Guest
* **URL**: `POST /auth/create-guest`
* **Public**: Yes
* **Headers**: `x-platform` (optional, `"browser"` | `"mobile"`)
* **Body Schema**: None (Empty)
* **Success Response (201 - Platform Mobile)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "45",
      "name": "Guest User",
      "email": null,
      "phone": null,
      "userType": "client",
      "guestToken": "8aeef142-b054-47be-b333-6cfc3c8612bb"
    }
  }
  ```

---

### 4. Admin Login (Password Credentials)
* **URL**: `POST /auth/login`
* **Public**: Yes
* **Headers**: `x-platform: browser`
* **Body Schema**:
  ```json
  {
    "email": "admin@fayendra.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201)**:
  - *Response Headers*: `Set-Cookie: refreshToken=eyJhbGciOi...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`
  - *Response Body*:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "1",
        "name": "Admin User",
        "email": "admin@fayendra.com",
        "userType": "admin"
      }
    }
    ```

---

### 5. Refresh Access Token
* **URL**: `POST /auth/refresh`
* **Public**: Yes (Guard protected via Refresh Strategy)
* **Headers**: `x-platform` (optional)
* **Body Schema**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..." // Optional if browser cookie is set
  }
  ```
* **Success Response (201 - Platform Browser)**:
  - *Response Headers*: `Set-Cookie: refreshToken=eyJhbGciOi...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`
  - *Response Body*:
    ```json
    {
      "accessToken": "eyJhbGciOi..."
    }
    ```

---

### 6. Get Profile (Me)
* **URL**: `GET /auth/me`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Success Response (200)**:
  ```json
  {
    "id": "12",
    "name": "Client User",
    "email": "john.doe@example.com",
    "phone": null,
    "role": null,
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "isActive": true
  }
  ```
