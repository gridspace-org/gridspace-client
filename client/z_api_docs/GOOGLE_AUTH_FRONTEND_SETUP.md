# Google Auth Frontend Setup Guide

This guide will help you set up Google OAuth authentication in your GridSpace frontend.

## Prerequisites

- Google Cloud Console project with OAuth 2.0 credentials
- Backend server running with Google OAuth endpoints
- Next.js application with the required dependencies

## Step 1: Environment Variables

Create a `.env.local` file in your client directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important:** Make sure to use the same Google Client ID that you configured in your backend.

## Step 2: Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for server-side flow)
   - `http://localhost:3000/auth/callback` (for client-side flow)

## Step 3: Components Available

### GoogleAuthButton Component

The `GoogleAuthButton` component provides a ready-to-use Google Sign-In button:

```tsx
import GoogleAuthButton from "../components/GoogleAuthButton";

<GoogleAuthButton
  text="Continue with Google"
  className="w-full"
  onError={(error) => setError(error)}
/>
```

**Props:**
- `text`: Button text (default: "Continue with Google")
- `className`: CSS classes for styling
- `onSuccess`: Callback for successful authentication
- `onError`: Callback for authentication errors
- `disabled`: Disable the button

### useGoogleAuth Hook

The `useGoogleAuth` hook provides programmatic access to Google authentication:

```tsx
import { useGoogleAuth } from "../hooks/useGoogleAuth";

const { handleGoogleAuth, redirectToGoogleAuth } = useGoogleAuth({
  onSuccess: () => console.log("Auth successful"),
  onError: (error) => console.error("Auth failed:", error),
});
```

## Step 4: Integration Examples

### Sign In Page Integration

The sign-in page now includes Google authentication:

```tsx
// In signin/page.tsx
<GoogleAuthButton
  text="Continue with Google"
  className="w-full"
  onError={(error) => setError(error)}
/>
```

### Sign Up Page Integration

The sign-up page also includes Google authentication:

```tsx
// In signup/page.tsx
<GoogleAuthButton
  text="Continue with Google"
  className="w-full"
  onError={(error) => setError(error)}
/>
```

### Custom Integration

For custom implementations, you can use the hook:

```tsx
import { useGoogleAuth } from "../hooks/useGoogleAuth";

function CustomAuthComponent() {
  const { redirectToGoogleAuth } = useGoogleAuth({
    onSuccess: () => {
      // Handle successful authentication
      router.push("/dashboard");
    },
    onError: (error) => {
      // Handle authentication error
      setError(error);
    },
  });

  return (
    <button onClick={redirectToGoogleAuth}>
      Sign in with Google
    </button>
  );
}
```

## Step 5: Authentication Flow

### Client-Side Flow (Recommended)

1. User clicks Google Sign-In button
2. Google Sign-In popup appears
3. User authenticates with Google
4. Google returns ID token
5. Frontend sends ID token to backend
6. Backend verifies token and returns JWT
7. User is authenticated and redirected

### Server-Side Flow

1. User clicks Google Sign-In button
2. User is redirected to Google OAuth
3. User authenticates with Google
4. Google redirects to backend callback
5. Backend processes authentication
6. Backend redirects to frontend with token
7. Frontend handles the callback and stores token

## Step 6: Error Handling

The Google Auth components include comprehensive error handling:

```tsx
<GoogleAuthButton
  onError={(error) => {
    // Handle different types of errors
    if (error.includes("popup")) {
      setError("Please allow popups for this site");
    } else if (error.includes("network")) {
      setError("Network error. Please check your connection");
    } else {
      setError("Authentication failed. Please try again");
    }
  }}
/>
```

## Step 7: Testing

1. Start your development server: `npm run dev`
2. Navigate to `/signin` or `/signup`
3. Click the "Continue with Google" button
4. Complete the Google authentication flow
5. Verify that you're redirected to the appropriate page

## Step 8: Production Deployment

1. Update environment variables for production
2. Update Google Cloud Console with production URLs
3. Ensure HTTPS is enabled
4. Test the complete authentication flow

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check your Google Client ID
2. **"Origin mismatch" error**: Verify authorized JavaScript origins
3. **"Redirect URI mismatch" error**: Check authorized redirect URIs
4. **Button not appearing**: Ensure Google Sign-In script is loaded

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test with Google's OAuth 2.0 Playground
4. Check network requests in browser dev tools

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production
2. **Token Storage**: JWT tokens are stored in localStorage
3. **CSRF Protection**: Google Sign-In includes CSRF protection
4. **Token Validation**: Backend validates all Google ID tokens

## Support

For issues with Google OAuth setup, refer to:
- [Google Sign-In JavaScript Library](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
