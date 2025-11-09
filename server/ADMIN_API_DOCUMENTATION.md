# 🛡️ Admin API Documentation

## 📋 Overview

The Admin API exposes secured endpoints for internal moderators to review accounts, manage space approvals, and maintain platform integrity. All endpoints are protected by the `adminOnly` middleware, which combines authentication and role enforcement.

---

## 🔐 Authentication & Headers

Use the seeded admin credentials to obtain a JWT via the public auth API:

```bash
POST /api/auth/signin
{
  "email": "<ADMIN_EMAIL>",
  "password": "<ADMIN_PASSWORD>"
}
```

Include the token in every request:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Base URLs
```
Development:  http://localhost:5002/api/v1
Production:   https://grid-production-cb89.up.railway.app/api/v1
```

---

## 📚 Endpoint Catalogue

### 1. 👥 List Users
- **Endpoint:** `GET /api/admin/users`
- **Description:** Fetch paginated users/hosts.
- **Query Parameters:**
  | Parameter | Type | Description |
  | :-- | :-- | :-- |
  | `page` | number | Page number (default `1`). |
  | `limit` | number | Items per page (default `10`, max `50`). |
  | `role` | string | Filter by `user`, `host`, or `admin`. |
  | `status` | string | `active` or `suspended`. |
  | `search` | string | Case-insensitive match on name/email/phone. |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "6712f9...",
        "fullname": "Ada Hosts",
        "email": "ada@example.com",
        "role": "host",
        "isActive": true,
        "suspension": {
          "isSuspended": false,
          "reason": null,
          "details": null,
          "suspendedBy": null,
          "suspendedAt": null,
          "resumeAt": null
        },
        "createdAt": "2025-10-09T12:17:30.112Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 12,
      "totalUsers": 115,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. 🏢 List Spaces
- **Endpoint:** `GET /api/admin/spaces`
- **Description:** Review spaces across the platform.
- **Query Parameters:**
  | Parameter | Type | Description |
  | :-- | :-- | :-- |
  | `page`, `limit` | number | Pagination controls (same defaults as users). |
  | `status` | string | `pending`, `approved`, `rejected`. |
  | `hostId` | string | Filter by host Mongo ID. |
  | `search` | string | Match title/location. |

Response mirrors the users endpoint with `spaces` array and pagination metadata. Each space includes moderation fields (`status`, `moderation.reviewedBy`, `reviewedAt`, `reason`).

---

### 3. 📅 List Bookings
- **Endpoint:** `GET /api/admin/bookings`
- **Description:** Inspect bookings with optional filters.
- **Query Parameters:**
  | Parameter | Type | Description |
  | :-- | :-- | :-- |
  | `page`, `limit` | number | Pagination controls. |
  | `status` | string | `pending`, `upcoming`, `in_progress`, `completed`, `cancelled`. |
  | `paymentStatus` | string | `pending`, `paid`, `failed`, `refunded`. |
  | `userId` / `hostId` | string | Filter by participant IDs. |

Results include booking details, associated user/space references, and status flags.

---

## ⚖️ Moderation Actions

### 4. 🚫 Suspend User
- **Endpoint:** `POST /api/admin/users/:id/suspend`
- **Description:** Disable account access and record rationale.
- **Request Body:**
  ```json
  {
    "reason": "policy_violation",
    "details": "Submitted fraudulent documents",
    "resumeAt": "2025-12-01T00:00:00.000Z"
  }
  ```
  - `reason` *(required)*: one of `fraud`, `policy_violation`, `chargeback_dispute`, `abuse`, `other`.
  - `details` *(optional)*: max 500 characters.
  - `resumeAt` *(optional)*: ISO timestamp when suspension auto-lifts.

#### Success Response (200)
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "userId": "6709cd...",
    "suspension": {
      "isSuspended": true,
      "reason": "policy_violation",
      "details": "Submitted fraudulent documents",
      "suspendedBy": "6908b4...",
      "suspendedAt": "2025-11-03T14:05:30.221Z",
      "resumeAt": "2025-12-01T00:00:00.000Z"
    }
  }
}
```

The server prevents an admin from suspending their own account and returns `403` with an explanatory message.

---

### 5. ✅ Reactivate User
- **Endpoint:** `POST /api/admin/users/:id/reactivate`
- **Description:** Lift suspension and optionally capture closure notes.
- **Request Body:**
  ```json
  {
    "reason": "Issue resolved after manual review"
  }
  ```
  `reason` is optional and stored in the `AdminActionLog` metadata for traceability.

---

### 6. 👍 Approve Space
- **Endpoint:** `POST /api/admin/spaces/:id/approve`
- **Description:** Mark pending space as approved and activate listing.
- **Request Body:**
  ```json
  {
    "notes": "Images and compliance docs verified"
  }
  ```
  Notes are optional and stored in the moderation record.

#### Success Response (200)
```json
{
  "success": true,
  "message": "Space approved successfully",
  "data": {
    "spaceId": "671a12...",
    "status": "approved",
    "isActive": true,
    "moderation": {
      "reviewedBy": "6908b4...",
      "reviewedAt": "2025-11-03T14:10:45.012Z",
      "reason": "Images and compliance docs verified"
    }
  }
}
```

---

### 7. 👎 Reject Space
- **Endpoint:** `POST /api/admin/spaces/:id/reject`
- **Description:** Decline listing and capture rejection reason.
- **Request Body:**
  ```json
  {
    "reason": "Photos do not match actual venue"
  }
  ```
  `reason` *(required)*: max 500 characters. The response mirrors the approve endpoint but with `status: "rejected"` and `isActive: false`.

---

## 🧾 Audit Logging
Every admin mutation writes to `AdminActionLog` with:
- `adminId`, `action`, `entityType`, `entityId`
- `metadata` (request body payload, reason strings)
- `requestInfo` (method, path, IP, user-agent)

Use Mongo to inspect recent activity:
```js
db.adminactionlogs.find().sort({ createdAt: -1 }).limit(10)
```

---

## ⚠️ Error Responses
Common envelope across endpoints:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Reason is required"],
  "error": "Optional stack trace in non-production"
}
```

| Status | Scenario |
| :-- | :-- |
| 400 | Joi validation failed (`reason` missing, invalid enum). |
| 401 | Missing/invalid JWT. |
| 403 | Actor lacks permissions (self-suspension attempt). |
| 404 | Target user/space not found. |
| 409 | Space already approved/rejected, user already suspended/active. |
| 500 | Unexpected server error (logged via Winston). |

Rate limiting mirrors operational settings:
- `GET` endpoints: 60 requests/minute/IP.
- Mutations: 10 actions/minute/IP.

---

## 🧪 Quick Smoke Test Snippets
Replace placeholders with real IDs and JWTs.

```bash
# List pending spaces
curl "https://<base-url>/api/admin/spaces?status=pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Suspend user
curl -X POST "https://<base-url>/api/admin/users/USER_ID/suspend" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"fraud", "details":"Chargeback dispute"}'

# Approve space
curl -X POST "https://<base-url>/api/admin/spaces/SPACE_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Compliant listing"}'
```

---

## 🤝 Frontend Integration Tips
- Reuse pagination metadata (`pagination.totalPages`, `hasNextPage`) to drive tables.
- Show suspension reasons and resume dates when present to aid support workflows.
- After moderation actions, invalidate cached lists or trigger dashboard refresh.
- Surface action success messages returned by backend (`message` field) for user feedback.

---


