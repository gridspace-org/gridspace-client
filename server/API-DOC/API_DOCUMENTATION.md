# GridSpace API Documentation

## Table of Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Token Refresh](#token-refresh)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Cookies](#cookies)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-1)
  - [Profile](#profile)
  - [Password Management](#password-management)
  - [Email Verification](#email-verification)
  - [OAuth](#oauth)

## Base URLs

```
Development:  http://localhost:5002/api/v1
Production:   Set API_URL in environment variables (no hardcoded URLs)

**Note:** Production URL should be set via `API_URL` environment variable. Check your `.env` file or deployment configuration.
```

## Authentication

### Access Token

- **Lifetime**: 15 minutes
- **Storage**: HTTP-only cookie
- **Path**: `/`
- **Required for**: All protected routes

### Refresh Token

- **Lifetime**: 7 days
- **Storage**: HTTP-only cookie
- **Path**: `/api/v1/auth/refresh-token`
- **Used for**: Obtaining new access tokens

### Request Headers

For API clients that can't use cookies, include the access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## Cookies

The API uses HTTP-only cookies for secure token storage:

| Cookie Name  | Description      | Path                       | Max Age | HTTP Only | Secure | SameSite |
| ------------ | ---------------- | -------------------------- | ------- | --------- | ------ | -------- |
| accessToken  | JWT access token | /                          | 15m     | Yes       | Yes\*  | Strict   |
| refreshToken | Refresh token    | /api/v1/auth/refresh-token | 7d      | Yes       | Yes\*  | Strict   |

\*Secure flag is enabled in production only

## Token Refresh

When an access token expires:

1. The client should make a POST request to `/api/v1/auth/refresh-token`
2. The request must include the refresh token in an HTTP-only cookie
3. The server will respond with:
   - A new access token in the response body
   - A new refresh token in an HTTP-only cookie
   - Both tokens in the response headers (for non-browser clients)

**Example Request:**

```
POST /api/v1/auth/refresh-token
Cookie: refreshToken=<refresh-token>
```

**Example Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "expiresIn": 900
  }
}
```

### Automatic Refresh

For browser-based clients, the refresh process is handled automatically by the `refreshIfNeeded` middleware.

## Rate Limiting

| Endpoint Type    | Limit        | Window     |
| ---------------- | ------------ | ---------- |
| Authentication   | 5 requests   | 15 minutes |
| API Endpoints    | 100 requests | 15 minutes |
| Public Endpoints | 200 requests | 1 hour     |

## Error Handling

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## Endpoints

## Authentication

### Register New User

**POST** `/auth/signup`

Register a new user account.

**Request Body (multipart/form-data):**

| Field       | Type   | Required | Description                           |
| ----------- | ------ | -------- | ------------------------------------- |
| fullname    | string | Yes      | User's full name                      |
| email       | string | Yes      | User's email address (must be unique) |
| password    | string | Yes      | Password (min 6 characters)           |
| phonenumber | string | Yes      | User's phone number (must be unique)  |
| profilePic  | file   | No       | Optional profile picture              |

**Example Request:**

```bash
curl -X POST "http://localhost:5002/api/v1/auth/signup" \
  -F "fullname=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "phonenumber=+1234567890" \
  -F "profilePic=@/path/to/avatar.jpg"
```

**Form Data:**

- `profilePic` (optional): Image file for profile picture (max 5MB)

**Response:**

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email to continue.",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "phonenumber": "+1234567890",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/...",
      "emailVerified": false,
      "onboardingCompleted": false,
      "accountStatus": {
        "isActive": true,
        "isEmailVerified": false,
        "onboardingCompleted": false
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "emailVerificationRequired": true,
    "nextSteps": [
      "Check your email for verification link",
      "Click the verification link to activate your account",
      "Complete your profile setup"
    ]
  },
  "metadata": {
    "registeredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** No tokens are returned on signup. User must verify email before they can sign in.

**Error Responses:**

- `400` - Invalid input data
- `409` - Email already registered
- `413` - Profile picture too large
- `500` - Server error

### User Login

**POST** `/auth/signin`

Authenticate user and return access and refresh tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/...",
      "emailVerified": true,
      "onboardingCompleted": true,
      "accountStatus": {
        "isActive": true,
        "isEmailVerified": true,
        "onboardingCompleted": true
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "abc123def456...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  },
  "metadata": {
    "authenticatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Cookies Set:**

- `accessToken` - HTTP-only, secure, same-site=strict
- `refreshToken` - HTTP-only, secure, same-site=strict, path=/api/v1/auth/refresh-token

**Error Responses:**

- `400` - Invalid input data
- `401` - Invalid credentials
- `403` - Account not verified or suspended
- `429` - Too many attempts

### Refresh Access Token

**POST** `/auth/refresh-token`

Get a new access token using a refresh token.

**Cookies Required:**

- `refreshToken` - Must be a valid refresh token

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token-here",
    "refreshToken": "new-refresh-token-here",
    "expiresIn": 900,
    "tokenType": "Bearer"
  },
  "metadata": {
    "refreshedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** New tokens are also set in HTTP-only cookies automatically.

**Error Responses:**

- `401` - Invalid or expired refresh token
- `403` - Refresh token not found or revoked

### Logout

**POST** `/auth/logout`

Invalidate the current session and clear tokens.

**Cookies Required:**

- `refreshToken` - To identify the session to invalidate

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**

- `accessToken`
- `refreshToken`

## Profile

### Get Current User Profile

**GET** `/auth/profile`

Get the authenticated user's profile.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "phonenumber": "+1234567890",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/...",
      "emailVerified": true,
      "onboardingCompleted": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Password Management

### Request Password Reset

**POST** `/auth/request-password-reset`

Send a password reset email with a one-time token.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### Reset Password

**POST** `/auth/reset-password`

Reset password using the token from the email.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "new-secure-password",
  "passwordConfirm": "new-secure-password"
}
```

## Email Verification

### Send Verification Email

**POST** `/auth/send-verification-email`

Request a new verification email.

**Headers:**

```
Authorization: Bearer <access-token>
```

### Verify Email

**GET** `/auth/verify-email?token=verification-token`

Verify email using the token from the email.

## OAuth

### Google OAuth - Method 1: ID Token (Mobile/Web SDK) - Recommended

**POST** `/api/v1/auth/google`

Authenticate with Google using ID token from Google Sign-In SDK. This is the recommended method for mobile apps and web applications using Google SDK.

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "google authentication successful",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profilePic": "https://lh3.googleusercontent.com/...",
      "emailVerified": true,
      "onboardingCompleted": false,
      "accountStatus": {
        "isActive": true,
        "isEmailVerified": true,
        "onboardingCompleted": false
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "abc123def456...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    },
    "provider": "google",
    "connectedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Cookies Set:**

- `accessToken` - HTTP-only cookie
- `refreshToken` - HTTP-only cookie

**Error Responses:**

- `400` - Missing or invalid idToken
- `401` - Token verification failed

**Frontend Integration Example:**

```javascript
// Using Google Sign-In SDK
function handleGoogleSignIn(response) {
  fetch("/api/v1/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important for cookies
    body: JSON.stringify({ idToken: response.credential }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // Tokens are in cookies automatically
        // Also available in data.data.tokens
        localStorage.setItem("accessToken", data.data.tokens.accessToken);
        // Redirect to dashboard
      }
    });
}
```

### Google OAuth - Method 2: Server-Side Flow (Web Redirect)

**Step 1: Get Google OAuth URL**

**GET** `/api/v1/auth/google/url`

Get Google OAuth authorization URL for server-side redirect flow.

**Response:**

```json
{
  "success": true,
  "message": "Google OAuth URL generated successfully",
  "data": {
    "googleAuthUrl": "https://accounts.google.com/oauth/authorize?client_id=...&redirect_uri=...&scope=...",
    "clientId": "your-google-client-id"
  }
}
```

**Step 2: Redirect User to Google**

Redirect the user to the `googleAuthUrl` from step 1.

**Step 3: Handle Google Callback**

**GET** `/api/v1/auth/google/callback`

This endpoint is called by Google after user authorization. It exchanges the authorization code for user info, creates/updates the user account, and redirects to your frontend.

**Query Parameters:**

- `code` (required): Authorization code from Google
- `error` (optional): OAuth error from Google

**Response:**

Redirects to frontend with tokens:

```
http://localhost:3000/auth/google/success?accessToken=...&refreshToken=...
```

Or on error:

```
http://localhost:3000/auth/google/error?message=error-message
```

**Frontend Integration Example:**

```javascript
// Step 1: Get auth URL
async function initiateGoogleAuth() {
  const response = await fetch("/api/v1/auth/google/url");
  const data = await response.json();
  if (data.success) {
    // Redirect user to Google
    window.location.href = data.data.googleAuthUrl;
  }
}

// Step 2: Handle callback (create /auth/google/success page)
// Extract tokens from URL query params
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get("accessToken");
const refreshToken = urlParams.get("refreshToken");

if (accessToken) {
  // Store tokens
  localStorage.setItem("accessToken", accessToken);
  // Redirect to dashboard
  window.location.href = "/dashboard";
}
```

### 6. Get User Profile

**GET** `/profile`

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Update User Profile

**PUT** `/profile`

Update user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567891"
}
```

**Form Data:**

- `profilePic` (optional): New profile picture image file

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "user-id",
    "fullname": "John Smith",
    "email": "john@example.com",
    "phonenumber": "+1234567891",
    "role": "user",
    "profilePic": "new-cloudinary-url",
    "emailVerified": false,
    "onboardingCompleted": false,
    "purposes": [],
    "location": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 8. Complete Onboarding

**POST** `/onboarding`

Complete user onboarding process with profile information and role assignment.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

**Form Data (multipart/form-data):**

- `role` (required): User role - "user" or "host"
- `fullname` (required): User's full name
- `phonenumber` (required): Contact number (required for hosts)
- `bio` (required): User bio (required if role is host, min 10 characters)
- `location` (required): User's location
- `company` (optional): Company name (optional for hosts, max 100 characters)
- `profilePic` (optional): Profile picture image file

**Example Request:**

```
Content-Type: multipart/form-data

role: "host"
fullname: "John Doe"
phonenumber: "+1234567890"
bio: "Experienced event organizer with 10+ years in the industry"
location: "New York, NY"
company: "Events Co."
profilePic: [file]
```

**Required Fields:**

- `role` (string): User role - "user" or "host"
- `fullname` (string): User's full name
- `phonenumber` (string): Contact number (required for hosts)
- `bio` (string): User bio (required if role is host, min 10 characters)
- `location` (string): User's location

**Optional Fields:**

- `company` (string): Company name (optional for hosts, max 100 characters)
- `profilePic` (file): Profile picture image file (use multipart/form-data)

**Field Validations:**

- `fullname`: Required, minimum 2 characters, maximum 100 characters
- `role`: Must be either "user" or "host"
- `bio`: Required for hosts, minimum 10 characters, maximum 500 characters
- `phonenumber`: Required for hosts, must match phone number pattern
- `location`: Required for hosts, minimum 5 characters, maximum 200 characters
- `company`: Optional, maximum 100 characters

**Response:**

```json
{
  "success": true,
  "message": "Onboarding completed successfully. Welcome to the platform!",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "fullname": "John Doe",
      "email": "john@example.com",
      "phonenumber": "+1234567890",
      "role": "host",
      "profilePic": "cloudinary-url",
      "emailVerified": false,
      "onboardingCompleted": true,
      "location": "New York, NY",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
      "lastUpdated": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Validation error or missing required fields
- `401` - Unauthorized - authentication required

### 9. Change Password

**PUT** `/change-password`

Change user's password.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**

````json
{

**POST** `/request-password-reset`

Request a password reset token.

**Request Body:**

```json
{
  "email": "john@example.com"
}
````

**Example Request:**

```bash
curl -X POST "https://grid-production-cb89.up.railway.app/api/v1/auth/request-password-reset" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent to your email address"
}
```

#### 2. Check Email for Reset Link

- Look for an email with subject "Password Reset Request"
- **Important**: The email contains a link with a `token` parameter
- The token is a long string in the format: `?token=abc123...`

#### 3. Reset Password (Using Token from Email)

**POST** `/reset-password`

Reset password using the token from the reset link.

**Request Body:**

```json
{
  "email": "john@example.com",
  "token": "YOUR_RESET_TOKEN_FROM_EMAIL",
  "newPassword": "NewSecurePassword123!"
}
```

**Example Request:**

```bash
curl -X POST "https://grid-production-cb89.up.railway.app/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "YOUR_RESET_TOKEN_FROM_EMAIL",
    "newPassword": "NewSecurePassword123!"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Notes:**

- The token is valid for 1 hour
- Password must be at least 8 characters with:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character
- After successful reset, all active sessions will be invalidated

### 11. Reset Password

**POST** `/reset-password`

Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 12. Delete Account

**POST** `/delete-account`

Permanently deactivate user account (soft delete). Requires password confirmation for security.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "password": "current-password"
}
```

**Example Request:**

```bash
curl -X POST "https://grid-production-cb89.up.railway.app/api/v1/auth/delete-account" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "YourPassword123!"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Account successfully deleted. Your data has been deactivated."
}
```

**Notes:**

- **Soft Delete**: Account is deactivated (`isActive: false`) but data is preserved
- **Password Required**: Must provide current password for security
- **Immediate Effect**: User is logged out and all tokens are cleared
- **Data Retention**: Booking history and transactions are preserved for records
- **Recovery**: Contact support if you need to recover your account

**Error Responses:**

- `400` - Password is required
- `401` - Invalid password or unauthorized
- `404` - User not found

### 13. Request Email Verification

**POST** `/request-email-verification`

Request an email verification token.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verification token generated",
  "verificationToken": "verification-token-here"
}
```

### 13. Verify Email

**POST** `/verify-email`

Verify email using verification token.

**Request Body:**

```json
{
  "token": "verification-token-here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 14. Logout

**POST** `/logout`

Logout user (client-side token removal).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 15. Refresh Token

**POST** `/refresh-token`

Refresh JWT token.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "new-jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 16. Delete Account

**DELETE** `/account`

Delete user account permanently.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "password": "currentpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Payments & Wallet

### Initialize Payment

**POST** `/api/v1/payments/initialize`

Initialize payment for a booking using Monnify.

**Request Body:**

```json
{
  "bookingId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "checkoutUrl": "https://sandbox.monnify.com/checkout/...",
    "paymentReference": "GS-1234567890-60f7b3b3b3b3b3b3b3b3b3b3",
    "transactionReference": "MNFY|20|20250113...",
    "amount": 11500
  }
}
```

**Frontend Flow:**

1. User creates booking
2. Call this endpoint with `bookingId`
3. Redirect user to `checkoutUrl`
4. User completes payment on Monnify
5. Monnify redirects back (webhook handles confirmation)

### Verify Payment

**GET** `/api/v1/payments/verify/{paymentReference}`

Check payment status.

**Response:**

```json
{
  "success": true,
  "message": "Payment verified",
  "data": {
    "paymentStatus": "paid",
    "amount": 11500,
    "paymentMethod": "CARD",
    "paidAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Wallet Balance

**GET** `/api/v1/wallet`

Get user's wallet balance.

**Response:**

```json
{
  "success": true,
  "message": "Wallet retrieved successfully",
  "data": {
    "availableBalance": 10000,
    "pendingBalance": 5000,
    "totalBalance": 15000,
    "currency": "NGN",
    "dailyWithdrawalLimit": 50000,
    "monthlyWithdrawalLimit": 500000
  }
}
```

### Get Wallet Transactions

**GET** `/api/v1/wallet/transactions?page=1&limit=20&category=host_earning`

Get wallet transaction history with pagination.

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional): `booking_payment`, `host_earning`, `platform_fee`, `withdrawal`, `refund`, `deposit`
- `status` (optional): `pending`, `completed`, `failed`

### Request Withdrawal

**POST** `/api/v1/wallet/withdraw`

Request withdrawal to bank account (hosts only).

**Request Body:**

```json
{
  "amount": 10000,
  "accountNumber": "0123456789",
  "accountName": "John Doe",
  "bankName": "GTBank",
  "bankCode": "058"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "reference": "WD-1234567890-60f7b3b3b3b3b3b3b3b3b3b3",
    "amount": 10000,
    "status": "pending",
    "bankAccount": {
      "accountNumber": "0123456789",
      "accountName": "John Doe",
      "bankName": "GTBank"
    }
  }
}
```

**Note:** Withdrawals require admin approval. Status will be `pending` until approved.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"] // Optional
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Consider implementing rate limiting for:

- Login attempts
- Password reset requests
- Email verification requests

## Security Notes

1. **JWT Tokens**: Tokens expire after 7 days by default
2. **Password Reset**: Tokens expire after 1 hour
3. **Email Verification**: Tokens expire after 24 hours
4. **Password Hashing**: Uses bcrypt with salt rounds of 12
5. **File Uploads**: Profile pictures are uploaded to Cloudinary with automatic optimization

## Environment Variables Required

```env
MONGO_URI=mongodb://localhost:27017/gridspace
JWT_SECRET=your-jwt-secret
JWT_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
LOG_LEVEL=info

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5002/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```
