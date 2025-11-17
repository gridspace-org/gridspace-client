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
   - For development: `http://localhost:5002/api/v1/auth/google/callback`
   - For production: `https://yourdomain.com/api/v1/auth/google/callback` (use your actual API URL)
5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5002/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

**Important:** 
- Use port `5002` for development (not 5000)
- The redirect URI must match exactly what you configured in Google Cloud Console
- For production, update `GOOGLE_REDIRECT_URI` and `FRONTEND_URL` to your production URLs

## Step 5: Frontend Integration

### Option 1: Client-Side Flow with ID Token (Recommended for Web/Mobile)

Use the Google Sign-In JavaScript library or mobile SDK:

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
async function handleCredentialResponse(response) {
  try {
    // Send the ID token to your backend
    const res = await fetch('/api/v1/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        idToken: response.credential
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Tokens are automatically set in HTTP-only cookies
      // Also available in response for manual storage if needed
      if (data.data?.tokens) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
      }
      
      // Redirect to dashboard or handle success
      window.location.href = '/dashboard';
    } else {
      console.error('Google auth failed:', data.message);
    }
  } catch (error) {
    console.error('Error during Google auth:', error);
  }
}

// Render the sign-in button
function renderGoogleSignInButton() {
  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large' }
  );
}
```

**For React Native / Mobile Apps:**
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// Sign in
async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;
    
    // Send to backend
    const response = await fetch('https://api.gridspace.com.ng/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    // Handle response...
  } catch (error) {
    console.error(error);
  }
}
```

### Option 2: Server-Side Flow (Web Redirect)

```javascript
// Step 1: Get the Google OAuth URL
async function initiateGoogleAuth() {
  try {
    const response = await fetch('/api/v1/auth/google/url');
    const data = await response.json();
    
    if (data.success) {
      // Redirect user to Google
      window.location.href = data.data.googleAuthUrl;
    }
  } catch (error) {
    console.error('Failed to get Google auth URL:', error);
  }
}

// Step 2: Handle callback (create /auth/google/success page)
// The server redirects to: /auth/google/success?accessToken=...&refreshToken=...

function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('accessToken');
  const refreshToken = urlParams.get('refreshToken');
  const error = urlParams.get('message');
  
  if (error) {
    // Handle error
    console.error('Google auth error:', error);
    return;
  }
  
  if (accessToken && refreshToken) {
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
}
```

## Step 6: Testing

1. Start your server: `npm start`
2. Run the test script: `node test-google-auth.js`
3. Test the complete flow in your frontend

## API Endpoints

### POST `/api/v1/auth/google`
Authenticate with Google ID token (client-side flow - Recommended)

**Request:**
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
      "_id": "user-id",
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

**Note:** Tokens are also automatically set in HTTP-only cookies.

### GET `/api/v1/auth/google/url`
Get Google OAuth authorization URL (server-side flow)

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

### GET `/api/v1/auth/google/callback`
Handle Google OAuth callback (server-side flow)

**Query Parameters:**
- `code` (required): Authorization code from Google
- `error` (optional): OAuth error from Google

**Response:**
Redirects to frontend:
- Success: `{FRONTEND_URL}/auth/google/success?accessToken=...&refreshToken=...`
- Error: `{FRONTEND_URL}/auth/google/error?message=...`

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
