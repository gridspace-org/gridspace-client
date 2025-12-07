# 🚀 Frontend Integration Guide - GridSpace API

> **Quick reference for frontend developers integrating with GridSpace backend**

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Authentication Flow](#authentication-flow)
- [Google OAuth Integration](#google-oauth-integration)
- [Token Management](#token-management)
- [Error Handling](#error-handling)
- [Response Formats](#response-formats)
- [Common Patterns](#common-patterns)

---

## 🎯 Quick Start

### Base URL
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';
```

### Default Headers
```javascript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

---

## 🔐 Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/v1/auth/signup`

**Important:** No tokens returned on signup. User must verify email first.

```javascript
const formData = new FormData();
formData.append('fullname', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'securePassword123');
formData.append('phonenumber', '+1234567890');
formData.append('profilePic', file); // Optional

const response = await fetch(`${API_BASE_URL}/auth/signup`, {
  method: 'POST',
  body: formData,
  credentials: 'include' // Important for cookies
});

const data = await response.json();
// Response: { success: true, message: "...", data: { user: {...}, emailVerificationRequired: true } }
```

### 2. User Login

**Endpoint:** `POST /api/v1/auth/signin`

```javascript
const response = await fetch(`${API_BASE_URL}/auth/signin`, {
  method: 'POST',
  headers: defaultHeaders,
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const data = await response.json();
// Tokens are automatically set in HTTP-only cookies
// Also available in: data.data.tokens.accessToken
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 900,
      "tokenType": "Bearer"
    }
  }
}
```

### 3. Making Authenticated Requests

**Option A: Using Cookies (Recommended for Browsers)**
```javascript
// Tokens are automatically sent in cookies
const response = await fetch(`${API_BASE_URL}/spaces`, {
  method: 'GET',
  credentials: 'include' // Required for cookies
});
```

**Option B: Using Authorization Header**
```javascript
const accessToken = localStorage.getItem('accessToken');
const response = await fetch(`${API_BASE_URL}/spaces`, {
  method: 'GET',
  headers: {
    ...defaultHeaders,
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🔄 Google OAuth Integration

### Method 1: ID Token (Recommended for Web/Mobile)

**Best for:** React, React Native, Vue, Angular, Mobile Apps

```javascript
// Step 1: Get ID token from Google SDK
function handleGoogleSignIn(response) {
  const idToken = response.credential; // From Google Sign-In SDK
  
  // Step 2: Send to backend
  fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: defaultHeaders,
    credentials: 'include',
    body: JSON.stringify({ idToken })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Tokens are in cookies automatically
      // Store access token for manual requests if needed
      if (data.data?.tokens?.accessToken) {
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
      }
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  });
}
```

**React Native Example:**
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.idToken;
    
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    // Handle response...
  } catch (error) {
    console.error(error);
  }
}
```

### Method 2: Server-Side Flow (Web Redirect)

**Best for:** Traditional web applications

```javascript
// Step 1: Get Google OAuth URL
async function initiateGoogleAuth() {
  const response = await fetch(`${API_BASE_URL}/auth/google/url`);
  const data = await response.json();
  
  if (data.success) {
    // Redirect user to Google
    window.location.href = data.data.googleAuthUrl;
  }
}

// Step 2: Handle callback (create /auth/google/success page)
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

---

## 🔑 Token Management

### Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh-token`

```javascript
async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include' // Refresh token must be in cookie
  });
  
  const data = await response.json();
  
  if (data.success) {
    // New tokens are automatically set in cookies
    // Also available in response
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }
    return data.data.accessToken;
  }
  
  throw new Error('Token refresh failed');
}
```

### Auto Token Refresh on 401

```javascript
async function apiRequest(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: 'include'
  });
  
  // Handle token expiration
  if (response.status === 401) {
    try {
      // Try to refresh token
      const newToken = await refreshToken();
      
      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        },
        credentials: 'include'
      });
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
  
  return response;
}
```

### Logout

**Endpoint:** `POST /api/v1/auth/logout`

```javascript
async function logout() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login
  window.location.href = '/login';
}
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Resource created |
| 400 | Bad Request | Check request data |
| 401 | Unauthorized | Refresh token or re-login |
| 403 | Forbidden | Account suspended or insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email/phone already exists |
| 429 | Too Many Requests | Wait before retrying |
| 500 | Server Error | Contact support |

### Error Handler Example

```javascript
async function handleApiError(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred'
    }));
    
    switch (response.status) {
      case 401:
        // Try refresh, then redirect if fails
        try {
          await refreshToken();
          return { retry: true };
        } catch {
          window.location.href = '/login';
        }
        break;
      case 403:
        alert('Your account has been suspended. Please contact support.');
        break;
      case 409:
        alert('This email is already registered. Please sign in instead.');
        break;
      case 429:
        alert('Too many requests. Please wait a moment.');
        break;
      default:
        alert(error.message || 'An error occurred');
    }
    
    throw new Error(error.message);
  }
  
  return response.json();
}
```

---

## 📦 Response Formats

### Success Response Structure

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "metadata": {
    // Optional metadata (timestamps, etc.)
  }
}
```

### Paginated Responses

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🎨 Common Patterns

### 1. API Client Class

```javascript
class GridSpaceAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = localStorage.getItem('accessToken');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers
      },
      credentials: 'include'
    };
    
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Auto-refresh token
      const newToken = await this.refreshToken();
      config.headers['Authorization'] = `Bearer ${newToken}`;
      return fetch(url, config);
    }
    
    return response.json();
  }
  
  async refreshToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return data.data.accessToken;
    }
    throw new Error('Token refresh failed');
  }
  
  // Auth methods
  async signup(userData) {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    }).then(res => res.json());
  }
  
  async signin(email, password) {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
  
  async googleAuth(idToken) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  }
  
  // Resource methods
  async getSpaces(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/spaces?${params}`);
  }
  
  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }
  
  // Payment methods
  async initializePayment(bookingId) {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify({ bookingId })
    });
  }
  
  async verifyPayment(paymentReference) {
    return this.request(`/payments/verify/${paymentReference}`);
  }
  
  // Wallet methods
  async getWallet() {
    return this.request('/wallet');
  }
  
  async getWalletTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/wallet/transactions?${params}`);
  }
  
  async requestWithdrawal(withdrawalData) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    });
  }
}

// Usage
const api = new GridSpaceAPI('http://localhost:5002/api/v1');
```

### 2. React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  async function checkAuth() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function signin(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      setUser(data.data.user);
      return data;
    }
    throw new Error(data.message);
  }
  
  async function logout() {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    localStorage.removeItem('accessToken');
  }
  
  return { user, loading, signin, logout, checkAuth };
}
```

---

## 💳 Payment Integration Example

```javascript
// Payment flow for booking
async function handleBookingPayment(bookingId) {
  try {
    // Step 1: Initialize payment
    const paymentResponse = await api.initializePayment(bookingId);
    
    if (paymentResponse.success) {
      const { checkoutUrl, paymentReference } = paymentResponse.data;
      
      // Step 2: Redirect user to Monnify checkout
      window.location.href = checkoutUrl;
      
      // Step 3: After redirect back, verify payment
      // (This can be done on your success page)
      const verifyResponse = await api.verifyPayment(paymentReference);
      
      if (verifyResponse.data.paymentStatus === 'paid') {
        // Payment successful, update UI
        console.log('Payment confirmed!');
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
}

// Wallet balance check
async function checkWalletBalance() {
  const response = await api.getWallet();
  if (response.success) {
    console.log('Available:', response.data.availableBalance);
    console.log('Pending:', response.data.pendingBalance);
  }
}
```

## 📚 Additional Resources

- [Complete API Documentation](./API_DOCUMENTATION.md) - Includes Payments & Wallet
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Spaces API Documentation](./SPACES_API_DOCUMENTATION.md)
- [Bookings API Documentation](./BOOKINGS_API_DOCUMENTATION.md)
- [Admin API Documentation](./ADMIN_API_DOCUMENTATION.md)

---

## 🆘 Support

For questions or issues:
1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review error messages in browser console
3. Check Swagger UI at `http://localhost:5002/api-docs`
4. Contact backend team

---

**Last Updated:** 2025-01-13
**API Version:** v1

