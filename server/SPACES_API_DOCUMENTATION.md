# 🏢 Space API Documentation

## 📋 Overview

The Space API allows hosts to create, manage, and list workspace spaces, while enabling users to search and browse available spaces.

---

## 🔐 Authentication

All protected endpoints require authentication. The API supports two authentication methods:

### 1. HTTP-Only Cookies (Recommended for Browsers)
- Access token is automatically sent with each request via HTTP-only cookie
- Refresh token is used to obtain new access tokens when they expire

### 2. Bearer Token (For API Clients)
```
Authorization: Bearer <access-token>
```

### Required Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>  # For protected routes
```

### Token Refresh
When the access token expires (after 15 minutes), clients should:
1. Make a POST request to `/api/v1/auth/refresh-token` with the refresh token cookie
2. The server will return a new access token and refresh token

---

## 📚 API Endpoints

### 1. 🔍 Search & Browse Spaces

- **Endpoint:** `GET /api/spaces`
- **Description:** Search and filter available spaces with pagination.

#### Query Parameters

| Parameter  | Type         | Description                                | Example                                       |
| :--------- | :----------- | :----------------------------------------- | :-------------------------------------------- |
| `location` | `string`     | Filter by location                         | `Lagos`                                       |
| `priceMin` | `number`     | Minimum price per hour                     | `1000`                                        |
| `priceMax` | `number`     | Maximum price per hour                     | `5000`                                        |
| `capacity` | `number`     | Minimum capacity                           | `4`                                           |
| `purposes` | `array`      | Repeatable query key for purposes          | `purposes=Remote Work&purposes=Team Meetings` |
| `amenities`| `array`      | Repeatable query key for amenities         | `amenities=WiFi&amenities=Air Conditioning`   |
| `page`     | `number`     | Page number (default: `1`)                 | `1`                                           |
| `limit`    | `number`     | Items per page (default: `12`)             | `12`                                          |
| `sortBy`   | `string`     | Sort order                                 | `price_low_high`, `price_high_low`, `newest`  |

#### Example Request

```bash
GET /api/spaces?location=Lagos&priceMin=1000&priceMax=5000&capacity=4&purposes=Remote%20Work&purposes=Team%20Meetings&amenities=WiFi&amenities=Air%20Conditioning&page=1&limit=12&sortBy=price_low_high
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Spaces retrieved successfully",
  "data": {
    "spaces": [
      {
        "_id": "68e3ba50af4d71f165d30511",
        "title": "Premium Co-working Space Lagos",
        "description": "A beautiful co-working space...",
        "location": "Lagos Island",
        "pricePerHour": 3000,
        "capacity": 20,
        "images": [],
        "amenities": ["WiFi", "Air Conditioning", "Coffee/Tea"],
        "purposes": ["Remote Work", "Team Meetings", "Networking"],
        "hostId": {
          "_id": "68e2979197fe59b314fc7f8e",
          "fullname": "Test Host",
          "profilePic": null,
          "emailVerified": false
        },
        "isActive": true,
        "createdAt": "2025-10-06T12:47:12.062Z",
        "updatedAt": "2025-10-06T12:47:12.082Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalSpaces": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. 📄 Get Space Details

- **Endpoint:** `GET /api/spaces/:id`
- **Description:** Get detailed information about a specific space.

#### Parameters

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `id`      | `string` | Space ID    |

#### Example Request

```bash
GET /api/spaces/68e3ba50af4d71f165d30511
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Space details retrieved successfully",
  "data": {
    "_id": "68e3ba50af4d71f165d30511",
    "title": "Premium Co-working Space Lagos",
    "description": "A beautiful co-working space...",
    "location": "Lagos Island",
    "address": "123 Business Avenue",
    "pricePerHour": 3000,
    "capacity": 20,
    "images": [],
    "amenities": ["WiFi", "Air Conditioning", "Coffee/Tea"],
    "purposes": ["Remote Work", "Team Meetings", "Networking"],
    "hostId": {
      "_id": "68e2979197fe59b314fc7f8e",
      "fullname": "Test Host",
      "profilePic": null,
      "emailVerified": false,
      "createdAt": "2025-10-05T16:06:41.601Z"
    },
    "isActive": true,
    "createdAt": "2025-10-06T12:47:12.062Z",
    "updatedAt": "2025-10-06T12:47:12.082Z"
  }
}
```

---

### 3. ➕ Create Space

- **Endpoint:** `POST /api/spaces`
- **Description:** Host creates a new space (Host role & onboarding completed required).
- **Headers:**
    - `Authorization: Bearer <host_jwt_token>`
    - `Content-Type: multipart/form-data` *(let your HTTP client generate the boundary)*

#### Form Fields

| Field | Type | Notes |
| :---- | :---- | :---- |
| `title` | Text | 5–100 chars (required) |
| `description` | Text | 10–1000 chars (required) |
| `location` | Text | 3–200 chars (required) |
| `address` | Text | Optional |
| `pricePerHour` | Number | 500–50,000 ₦ (required) |
| `capacity` | Number | 1–100 (required) |
| `purposes[]` | Text (repeatable) | Values must match list below |
| `amenities[]` | Text (repeatable) | Values must match list below |
| `timeSlots` | JSON array | e.g. `[{"day":"monday","startTime":"09:00","endTime":"17:00"}]` (optional) |
| `images` | File (repeatable, max 5) | JPG/PNG uploads |

> **Tip:** When using Postman select **form-data**, add keys as shown above, and let Postman set the `Content-Type` header automatically so the multipart boundary is present.

#### JSON Reference (for implementing UI forms)

```bash
curl -X POST https://grid-production-cb89.up.railway.app/api/v1/spaces \
  -H "Authorization: Bearer <host_jwt_token>" \
  -F "title=Premium Co-working Space" \
  -F "description=A beautiful co-working space..." \
  -F "location=Lagos Island" \
  -F "address=123 Business Avenue" \
  -F "pricePerHour=3000" \
  -F "capacity=20" \
  -F "purposes[]=Remote Work" \
  -F "purposes[]=Team Meetings" \
  -F "amenities[]=WiFi" \
  -F "amenities[]=Air Conditioning" \
  -F 'timeSlots=[{"day":"monday","startTime":"09:00","endTime":"17:00"}]'
```

Send the `timeSlots` field as a JSON array string when using `curl` or form-data clients. The current API ignores `timeSlots` values until the persistence logic is implemented, so it is optional for now.

#### Field Validations

- `title`: 5–100 characters, required
- `description`: 10–1000 characters, required
- `location`: 3–200 characters, required
- `pricePerHour`: 500–50,000 ₦, required
- `capacity`: 1–100 people, required
- `purposes[]`: Allowed values listed below (case-sensitive)
- `amenities[]`: Allowed values listed below (case-sensitive)
- `images`: up to 5 files
- `timeSlots`: optional array; if provided, include `day`, `startTime`, `endTime`

#### Available Purposes

```json
[
  "Remote Work", "Study Session", "Team Meetings", "Networking", 
  "Presentations", "Creative Work", "Interview", "Training", "Client Meeting"
]
```

#### Available Amenities

```json
[
  "WiFi", "Projector", "Whiteboard", "Air Conditioning", "Power Backup",
  "Parking", "Coffee/Tea", "Printer/Scanner", "Conference Phone", 
  "Monitor", "Kitchen", "Restroom"
]
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Space created successfully",
  "data": {
    "_id": "68e3ba50af4d71f165d30511",
    "hostId": "68e2979197fe59b314fc7f8e",
    "title": "Premium Co-working Space",
    "description": "A beautiful co-working space...",
    "location": "Lagos Island",
    "pricePerHour": 3000,
    "capacity": 20,
    "images": [],
    "amenities": ["WiFi", "Air Conditioning", "Coffee/Tea"],
    "purposes": ["Remote Work", "Team Meetings", "Networking"],
    "isActive": true,
    "createdAt": "2025-10-06T12:47:12.062Z",
    "updatedAt": "2025-10-06T12:47:12.082Z"
  }
}
```

---

### 4. 🏠 Get My Spaces

- **Endpoint:** `GET /api/spaces/my/spaces`
- **Description:** Get all spaces belonging to the authenticated host.
- **Headers:** `Authorization: Bearer <host_jwt_token>`

#### Query Parameters

| Parameter | Type     | Description      | Default |
| :-------- | :------- | :--------------- | :------ |
| `page`    | `number` | Page number      | `1`     |
| `limit`   | `number` | Items per page   | `10`    |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Your spaces retrieved successfully",
  "data": {
    "spaces": [
      {
        "_id": "68e3ba50af4d71f165d30511",
        "title": "Premium Co-working Space Lagos",
        "location": "Lagos Island",
        "pricePerHour": 3000,
        "capacity": 20,
        "images": [],
        "isActive": true,
        "createdAt": "2025-10-06T12:47:12.062Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalSpaces": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 5. ✏️ Update Space

- **Endpoint:** `PUT /api/spaces/:id`
- **Description:** Update a space (Host must own the space).
- **Headers:**
    - `Authorization: Bearer <host_jwt_token>`
    - `Content-Type: multipart/form-data`

#### Parameters

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `id`      | `string` | Space ID    |

#### Form Fields

Send only the fields you wish to change using form-data (same format as creation). You may upload new `images` to append to the existing list (backend trims to max 5).

```json
{
  "title": "Updated Space Name",
  "description": "Updated description...",
  "pricePerHour": 3500,
  "capacity": 15,
  "amenities": ["WiFi", "Air Conditioning", "Projector"],
  "purposes": ["Team Meetings", "Presentations"],
  "timeSlots": [
    {
      "day": "tuesday",
      "startTime": "10:00",
      "endTime": "16:00"
    }
  ]
}
```

> **Note:** Although the reference above is JSON, the request must be `multipart/form-data` when submitting through the API.

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Space updated successfully",
  "data": {
    // Updated space object
  }
}
```

---

### 6. 🗑️ Delete Space

- **Endpoint:** `DELETE /api/spaces/:id`
- **Description:** Soft delete a space (Host must own the space).
- **Headers:** `Authorization: Bearer <host_jwt_token>`

#### Parameters

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `id`      | `string` | Space ID    |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Space deleted successfully"
}
```
**Note:** This is a soft delete - the space is marked as inactive but preserved in the database.

---

## ⚠️ Error Responses

#### Common Error Codes

| Code | Description                               |
| :--- | :---------------------------------------- |
| 400  | Validation errors - check error messages  |
| 401  | Authentication required - missing/invalid token |
| 403  | Permission denied - user role insufficient |
| 404  | Space not found                           |
| 429  | Rate limit exceeded - too many requests   |

#### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific validation errors"],
  "error": "Internal error message"
}
```
**Note:** `errors` is only for validation errors, `error` is only for 500 errors.

---

## 🎯 Frontend Integration Tips

#### 1. Search Implementation

```javascript
// Build search URL with filters
const buildSearchUrl = (filters) => {
  const params = new URLSearchParams();
  if (filters.location) params.append('location', filters.location);
  if (filters.priceMin) params.append('priceMin', filters.priceMin);
  if (filters.priceMax) params.append('priceMax', filters.priceMax);
  if (filters.capacity) params.append('capacity', filters.capacity);
  if (filters.purposes) {
    filters.purposes.forEach(purpose => params.append('purposes', purpose));
  }
  if (filters.amenities) {
    filters.amenities.forEach(amenity => params.append('amenities', amenity));
  }
  params.append('page', filters.page || 1);
  params.append('limit', filters.limit || 12);
  params.append('sortBy', filters.sortBy || 'newest');
  
  return `/api/spaces?${params.toString()}`;
};
```

#### 2. Handle Pagination

```javascript
// Use pagination data from response
const { pagination } = response.data;
const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
```

#### 3. Error Handling

```javascript
try {
  const response = await fetch('/api/spaces', options);
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      redirectToLogin();
    } else if (response.status === 400) {
      // Show validation errors to user
      showErrors(data.errors);
    }
    throw new Error(data.message);
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error);
  showNotification(error.message, 'error');
}
```

---

## 🔄 Rate Limits

- **Search:** 60 requests per minute per IP
- **Space Creation:** 5 spaces per 15 minutes per user
- **General API:** 100 requests per 15 minutes per IP