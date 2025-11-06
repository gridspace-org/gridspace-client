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
Development:  http://localhost:5000/api/v1
Production:   https://api.gridspace.com.ng/api/v1
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

| Cookie Name   | Description          | Path                      | Max Age  | HTTP Only | Secure | SameSite |
|---------------|----------------------|---------------------------|----------|-----------|--------|----------|
| accessToken   | JWT access token     | /                         | 15m      | Yes       | Yes*   | Strict   |
| refreshToken  | Refresh token        | /api/v1/auth/refresh-token| 7d       | Yes       | Yes*   | Strict   |

*Secure flag is enabled in production only

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

| Endpoint Type        | Limit      | Window    |
|----------------------|------------|-----------|
| Authentication       | 5 requests | 15 minutes|
| API Endpoints        | 100 requests| 15 minutes|
| Public Endpoints     | 200 requests| 1 hour   |

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

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phonenumber": "+1234567890"
}
```

**Form Data:**
- `profilePic` (optional): Image file for profile picture (max 5MB)

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "phonenumber": "+1234567890",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/...",
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

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
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "profilePic": "https://res.cloudinary.com/...",
      "emailVerified": true,
      "onboardingCompleted": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
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
    "expiresIn": 900
  }
}
```

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

### Google OAuth

**GET** `/auth/google`

Start Google OAuth flow.

**Response:**
Redirects to Google consent screen, then to:
- Success: `/?success=true&token=<jwt-token>`
- Error: `/?success=false&error=error-message`

### Google OAuth (Direct Token)

**POST** `/auth/google/token`

Authenticate with a Google ID token.

**Request Body:**
```json
{
  "idToken": "google-id-token-here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullname": "John Doe",
      "email": "john@example.com",
      "profilePic": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```
    "authProvider": "google",
    "googleId": "google-user-id",
    "onboardingCompleted": false,
    "purposes": [],
    "location": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Get Google OAuth URL

**GET** `/google/url`

Get Google OAuth authorization URL for server-side flow.

**Response:**

```json
{
  "success": true,
  "message": "Google auth URL generated",
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

### 5. Google OAuth Callback

**GET** `/google/callback`

Handle Google OAuth callback (server-side flow). This endpoint redirects to the frontend.

**Query Parameters:**

- `code`: Authorization code from Google

**Response:**

Redirects to frontend with token:
```
http://localhost:3000/auth/callback?token=jwt-token&success=true
```

Or on error:
```
http://localhost:3000/auth/callback?success=false&error=error-message
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

Complete user onboarding process with role, purposes, and location.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Form Data:**

- `role` (required): User role - "user", "host", or "admin"
- `purposes` (optional): JSON string array of user purposes
- `location` (optional): User's location
- `profilePic` (optional): Profile picture image file

**Example Request:**

```
Content-Type: multipart/form-data

role: "host"
purposes: ["networking", "collaboration", "events"]
location: "New York, NY"
profilePic: [file]
```

**Response:**

```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "host",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "onboardingCompleted": true,
    "purposes": ["networking", "collaboration", "events"],
    "location": "New York, NY",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

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

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 10. Request Password Reset

**POST** `/request-password-reset`

Request a password reset token.

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
  "message": "Password reset token generated",
  "resetToken": "reset-token-here"
}
```

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

### 12. Request Email Verification

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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```
