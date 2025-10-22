# GridSpace Authentication API Documentation

## Base URL

```
http://localhost:5000/api/auth
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. User Registration

**POST** `/signup`

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

- `profilePic` (optional): Image file for profile picture

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "token": "jwt-token-here",
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

### 2. User Login

**POST** `/signin`

Authenticate user and return JWT token.

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
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "cloudinary-url",
    "emailVerified": false,
    "authProvider": "local",
    "googleId": null,
    "onboardingCompleted": false,
    "purposes": [],
    "location": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Google OAuth Authentication

**POST** `/google`

Authenticate user with Google ID token (client-side flow).

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
  "message": "Google signin successful",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phonenumber": "+1234567890",
    "role": "user",
    "profilePic": "google-profile-pic-url",
    "emailVerified": true,
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
