# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your GridSpace application.

## Prerequisites

- Google Cloud Console account
- Node.js application with the Google OAuth dependencies installed

## Step 1: Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: "GridSpace"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (for development)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## Step 5: Frontend Integration

### Option 1: Client-Side Flow (Recommended)

Use the Google Sign-In JavaScript library:

```html
<!-- Add to your HTML -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

```javascript
// Initialize Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleCredentialResponse
  });
}

// Handle the credential response
function handleCredentialResponse(response) {
  // Send the ID token to your backend
  fetch('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: response.credential
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Store the JWT token
      localStorage.setItem('authToken', data.token);
      // Redirect to dashboard or handle success
      window.location.href = '/dashboard';
    }
  });
}

// Render the sign-in button
function renderGoogleSignInButton() {
  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large' }
  );
}
```

### Option 2: Server-Side Flow

```javascript
// Get the Google OAuth URL
async function getGoogleAuthUrl() {
  const response = await fetch('/api/auth/google/url');
  const data = await response.json();
  if (data.success) {
    window.location.href = data.authUrl;
  }
}

// Handle the callback (create a callback page)
// The server will redirect to: /auth/callback?token=JWT_TOKEN&success=true
```

## Step 6: Testing

1. Start your server: `npm start`
2. Run the test script: `node test-google-auth.js`
3. Test the complete flow in your frontend

## API Endpoints

### POST `/api/auth/google`
Authenticate with Google ID token (client-side flow)

**Request:**
```json
{
  "idToken": "google-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google signin successful",
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "fullname": "John Doe",
    "email": "john@example.com",
    "authProvider": "google",
    "googleId": "google-user-id",
    "emailVerified": true
  }
}
```

### GET `/api/auth/google/url`
Get Google OAuth authorization URL (server-side flow)

**Response:**
```json
{
  "success": true,
  "message": "Google auth URL generated",
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

### GET `/api/auth/google/callback`
Handle Google OAuth callback (server-side flow)

Redirects to frontend with token or error.

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production
2. **Token Validation**: The backend validates Google ID tokens
3. **User Data**: Only store necessary user information
4. **Error Handling**: Implement proper error handling for failed authentications

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check your Client ID and Client Secret
2. **"Redirect URI mismatch"**: Ensure the redirect URI matches exactly
3. **"Access blocked"**: Check OAuth consent screen configuration
4. **"Invalid token" error**: Ensure the ID token is valid and not expired

### Debug Steps

1. Check environment variables are loaded correctly
2. Verify Google Cloud Console configuration
3. Test with Google's OAuth 2.0 Playground
4. Check server logs for detailed error messages

## Production Deployment

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Ensure HTTPS is enabled
4. Update CORS settings for production domain
5. Test the complete flow in production environment

## Support

For issues with Google OAuth setup, refer to:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In JavaScript Library](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console Help](https://cloud.google.com/docs)
