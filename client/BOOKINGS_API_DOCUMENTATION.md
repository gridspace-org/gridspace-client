# 📅 Booking API Documentation

## 📋 Overview

The Booking API enables users to create, manage, and track space bookings, while providing hosts with tools to manage their space reservations. It includes comprehensive booking lifecycle management with status tracking, payment processing, and cancellation policies.

---

## 🔐 Authentication

All endpoints require JWT authentication in the `Authorization` header. Some endpoints require specific user roles (host, admin).

```
Authorization: Bearer <jwt_token>
```

---

## 📚 API Endpoints

### 1. 📋 Get User Bookings

- **Endpoint:** `GET /api/bookings`
- **Description:** Retrieve authenticated user's bookings with filtering and pagination
- **Method:** GET
- **Headers:**
    - `Authorization: Bearer <user_jwt_token>`

#### Query Parameters

| Parameter | Type     | Description                                | Default | Options |
| :-------- | :------- | :----------------------------------------- | :------ | :------ |
| `page`    | `number` | Page number                                | `1`     | 1-n     |
| `limit`   | `number` | Items per page                             | `10`    | 1-50    |
| `status`  | `string` | Filter by booking status                   |         | `pending`, `upcoming`, `in_progress`, `completed`, `cancelled` |

#### Status Values
- `pending`: New booking awaiting host confirmation
- `upcoming`: Confirmed booking in future
- `in_progress`: Active booking currently in use
- `completed`: Finished booking with payment settled
- `cancelled`: Cancelled booking (by user or host)

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/bookings?page=1&limit=5&status=upcoming" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "_id": "672f8a123456789abcdef0",
        "space": {
          "_id": "672f89123456789abcdef1",
          "title": "Modern Conference Room Lagos",
          "location": "Lagos Island",
          "images": ["image1.jpg"],
          "amenities": ["WiFi", "Air Conditioning"]
        },
        "date": "October 15th, 2025",
        "time": "10:00 AM to 2:00 PM",
        "price": "₦10,000",
        "guestCount": 5,
        "status": "upcoming",
        "paymentStatus": "paid",
        "canReschedule": true,
        "canCancel": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalBookings": 28,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. ➕ Create Booking

- **Endpoint:** `POST /api/bookings`
- **Description:** Create a new space booking (User authentication required)
- **Method:** POST
- **Headers:**
    - `Authorization: Bearer <user_jwt_token>`
    - `Content-Type: application/json`

#### Request Body

```json
{
  "spaceId": "672f89123456789abcdef1",
  "startTime": "2025-10-15T10:00:00.000Z",
  "endTime": "2025-10-15T14:00:00.000Z",
  "guestCount": 5,
  "bookingType": "hourly",
  "specialRequests": "Need projector setup for presentation"
}
```

#### Field Validations

- `spaceId`: Valid 24-character MongoDB ObjectId, required
- `startTime`: ISO date string, must be future date, required
- `endTime`: ISO date string, must be after startTime, required
- `guestCount`: 1-100 guests, defaults to 1
- `bookingType`: `"hourly"` or `"daily"`, defaults to `"hourly"`
- `specialRequests`: Max 500 characters, optional

#### Business Rules
- Start time must be at least 1 hour from now
- Booking duration minimum: 1 hour
- Space must be available (no conflicting bookings)
- User cannot double-book same time slot

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Booking created successfully. Awaiting host confirmation.",
  "data": {
    "_id": "672f8a123456789abcdef0",
    "spaceId": "672f89123456789abcdef1",
    "userId": "672f890123456789abcde9",
    "startTime": "2025-10-15T10:00:00.000Z",
    "endTime": "2025-10-15T14:00:00.000Z",
    "duration": 4,
    "guestCount": 5,
    "totalAmount": 10000,
    "status": "pending",
    "paymentStatus": "pending",
    "bookingType": "hourly",
    "specialRequests": "Need projector setup for presentation",
    "createdAt": "2025-10-10T18:30:00.000Z",
    "updatedAt": "2025-10-10T18:30:00.000Z"
  }
}
```

---

### 3. ❌ Cancel Booking (User)

- **Endpoint:** `DELETE /api/bookings/:id/cancel`
- **Description:** User cancels their own booking with automatic refund calculation
- **Method:** DELETE
- **Headers:**
    - `Authorization: Bearer <user_jwt_token>`
- **Parameters:**
    - `id`: Booking ID to cancel

#### Cancellation Policy
- **48+ hours before**: Full refund (`100%`)
- **2-48 hours before**: Partial refund (`50%`)
- **< 2 hours before**: No refund (`0%`)

#### Example Request

```bash
DELETE http://localhost:5000/api/bookings/672f8a123456789abcdef0/cancel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "_id": "672f8a123456789abcdef0",
      "status": "cancelled",
      "paymentStatus": "refunded",
      "refundAmount": 10000,
      "cancellationTime": "2025-10-10T18:35:00.000Z"
    },
    "refund": {
      "amount": 10000,
      "type": "full",
      "message": "Refund of ₦10000 will be processed to your wallet"
    }
  }
}
```

---

## 🎩 Host-Only Endpoints

### 4. 🏠 Get Host Bookings

- **Endpoint:** `GET /api/bookings/host`
- **Description:** Host views all bookings for spaces they own (Host role required)
- **Method:** GET
- **Headers:**
    - `Authorization: Bearer <host_jwt_token>`
- **Required Role:** Host

#### Query Parameters

| Parameter | Type     | Description                                | Default |
| :-------- | :------- | :----------------------------------------- | :------ |
| `page`    | `number` | Page number                                | `1`     |
| `limit`   | `number` | Items per page                             | `10`    |
| `spaceId` | `string` | Filter by specific space                   |         |
| `status`  | `string` | Filter by booking status                   |         |

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/bookings/host?page=1&limit=5&status=pending" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Host bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "_id": "672f8a123456789abcdef0",
        "user": {
          "_id": "672f890123456789abcde9",
          "fullname": "John Doe",
          "email": "john@example.com",
          "profilePic": null
        },
        "space": {
          "_id": "672f89123456789abcdef1",
          "title": "Modern Conference Room Lagos",
          "location": "Lagos Island"
        },
        "date": "October 15th, 2025",
        "time": "10:00 AM to 2:00 PM",
        "guestCount": 5,
        "totalAmount": "₦10,000",
        "hostEarnings": "₦9,000",
        "status": "pending",
        "paymentStatus": "paid",
        "specialRequests": "Need projector setup"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBookings": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 5. 🔄 Update Booking Status (Host)

- **Endpoint:** `PUT /api/bookings/:id/status`
- **Description:** Host confirms, cancels, or rejects a booking
- **Method:** PUT
- **Headers:**
    - `Authorization: Bearer <host_jwt_token>`
    - `Content-Type: application/json`
- **Required Role:** Host
- **Parameters:**
    - `id`: Booking ID to update

#### Valid Status Transitions

| Current Status | Can Change To |
| :------------- | :------------- |
| `pending`      | `confirmed`, `cancelled`, `rejected` |
| `confirmed`    | `cancelled` |
| `upcoming`     | `cancelled` |

#### Request Body

```json
{
  "status": "confirmed",
  "hostNotes": "Welcome! We'll have the projector set up for you.",
  "cancellationReason": "host_request"
}
```

#### Field Validations

- `status`: One of `"confirmed"`, `"cancelled"`, `"rejected"`, required
- `hostNotes`: Max 500 characters, optional
- `cancellationReason`: Required only for cancelled bookings
  - `"user_request"`, `"host_request"`, `"payment_timeout"`, `"other"`

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking": {
      "_id": "672f8a123456789abcdef0",
      "status": "confirmed",
      "paymentStatus": "paid",
      "hostNotes": "Welcome! We'll have the projector set up for you.",
      "user": {
        "fullname": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

---

## ⚠️ Error Responses

#### Common Error Codes

| Code | Description                               |
| :--- | :---------------------------------------- |
| 400  | Validation errors - check error messages  |
| 401  | Authentication required - missing/invalid token |
| 403  | Permission denied - insufficient role or ownership |
| 404  | Booking or space not found                |
| 409  | Booking conflict - space already booked   |
| 429  | Rate limit exceeded - too many requests   |
| 500  | Internal server error                     |

#### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific validation errors"],
  "error": "Internal error message"
}
```

#### Common Validation Errors
- `"Start time must be in the future"`
- `"End time must be after start time"`
- `"Space not available for selected time slot"`
- `"Cannot cancel booking within 2 hours of start time"`
- `"Access denied. Insufficient permissions."`

---

## 💰 Payment & Refund Logic

### Price Calculation
```javascript
// Hourly Booking
totalAmount = space.pricePerHour × durationHours × guestCount
// Note: Guest count affects overall pricing but not per-hour

// Daily Booking (if implemented)
totalAmount = space.pricePerDay × durationDays × guestCount
```

### Refund Policy Implementation
```javascript
// Refund percentage based on notice time
const hoursUntilStart = (startTime - Date.now()) / (1000 * 60 * 60);

let refundPercentage = 0;
if (hoursUntilStart > 48) refundPercentage = 100;     // Full refund
else if (hoursUntilStart > 2) refundPercentage = 50;   // 50% refund
// else: 0% refund (less than 2 hours)
```

### Host Earnings
```javascript
// Platform fee (20%) deducted, host gets 80%
hostEarnings = totalAmount × 0.8;
platformFee = totalAmount × 0.2;
```

---

## 🔄 Rate Limits

- **Viewing Bookings:** 30 requests per minute per user
- **Creating Bookings:** 3 bookings per 15 minutes per user
- **Host Status Updates:** 10 updates per minute per host
- **Cancellation Requests:** 5 cancellations per hour per user

---

## 🎯 Frontend Integration Tips

#### 1. Booking Creation Flow

```javascript
// Step 1: Check Space Availability
const checkAvailability = async (spaceId, startTime, endTime) => {
  try {
    const response = await fetch(`/api/spaces/${spaceId}`);
    const data = await response.json();

    if (!data.success) throw new Error(data.message);

    // Verify time slot is available
    // This should be done on backend, but helps with UX
    return data.availableSlots?.includes(selectedTime);
  } catch (error) {
    console.error('Availability check failed:', error);
    throw error;
  }
};

// Step 2: Create Booking
const createBooking = async (bookingData) => {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        showError('This time slot is no longer available');
      } else if (response.status === 400) {
        showValidationErrors(result.errors);
      }
      throw new Error(result.message);
    }

    return result.data;
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error;
  }
};

// Step 3: Handle Success
const onBookingSuccess = (booking) => {
  if (booking.paymentStatus === 'pending') {
    redirectToPayment(booking._id);
  } else {
    redirectToBookingConfirmation(booking._id);
  }
};
```

#### 2. Status Polling for Real-Time Updates

```javascript
// Poll booking status for realtime updates
const pollBookingStatus = (bookingId, callback) => {
  const interval = setInterval(async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      callback(data);

      // Stop polling if booking is final
      if (['completed', 'cancelled'].includes(data.status)) {
        clearInterval(interval);
      }
    } catch (error) {
      console.error('Status poll failed:', error);
    }
  }, 30000); // Poll every 30 seconds

  return interval;
};
```

#### 3. Cancellation with Refund Preview

```javascript
// Show refund amount before canceling
const calculateRefund = (startTime) => {
  const hoursUntilStart = (new Date(startTime) - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilStart > 48) return { type: 'full', amount: 100 };
  if (hoursUntilStart > 2) return { type: 'partial', amount: 50 };
  return { type: 'none', amount: 0 };
};

const cancelBooking = async (bookingId, startTime) => {
  const refund = calculateRefund(startTime);

  // Ask user to confirm
  const confirmed = await showConfirmation(
    `Cancel booking and receive ${refund.amount}% refund?`
  );

  if (!confirmed) return;

  // Proceed with cancellation
  const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const result = await response.json();
  // Handle result...
};
```

---

## 🚀 Booking Lifecycle Overview

```
1. USER CREATES BOOKING
   Status: pending → Payment prompt

2. PAYMENT PROCESSED
   Status: confirmed → Host notification

3. HOST CONFIRMS/REJECTS
   Status: confirmed/rejected/cancelled → User notification

4. BOOKING EXECUTED
   Status: in_progress → Available to user

5. BOOKING COMPLETED
   Status: completed → Payment settlement & review request

6. CANCELLATION (if applicable)
   Status: cancelled → Refund processing
```

---

## 📊 Business Rules Summary

- **Booking Window:** Minimum 1 hour in advance
- **Cancellation Deadline:** Full refund >48h, 50% >2h, none <2h
- **Host Earnings:** 80% of booking amount
- **Platform Fee:** 20% of booking amount
- **Guest Limits:** 1-100 guests per booking
- **Duration Limits:** Minimum 1 hour, maximum per space policy

This comprehensive documentation ensures smooth frontend integration and clarifies all booking flows, payment logic, and business rules.
