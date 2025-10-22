# Admin Dashboard

This is the admin dashboard for the GridSpace application. It provides administrators with tools to manage workspace listings, users, and bookings across the platform.

## Components

### AdminNav

The top navigation bar with:

- Back button and dashboard title
- Search functionality
- Admin profile section with admin since date

### AdminSidebar

The left sidebar navigation with:

- Listing Management (active by default)
- User Management
- Booking Management

### AdminListingRow

Individual listing rows in the table showing:

- Workspace image and details
- Host information
- Submission date
- Status indicators (Pending, Approved, Rejected)
- Action buttons (View, Approve, Reject)

### AdminMainContent

The main content area containing:

- Header with "Listing Management" title
- Status filter dropdown
- Table with listing rows

## Features

- **Listing Management**: View and manage all workspace listings
- **Status Control**: Approve, reject, or view pending listings
- **Search**: Find specific listings quickly
- **Filtering**: Filter listings by status
- **Navigation**: Easy access to different admin sections

## Status Types

- **Pending**: Listing awaiting admin approval (yellow badge)
- **Approved**: Admin-approved listing (green badge)
- **Rejected**: Admin-rejected listing (red badge)

## Styling

The admin dashboard uses the same color scheme as other dashboards:

- Primary: #F25417 (Orange)
- Secondary: #002F5B (Navy Blue)
- Background: #F7F5F5 (Light Gray)
- Text: #686767 (Gray)

## Usage

```tsx
import { AdminNav, AdminSidebar, AdminMainContent } from "../components";

// Use in admin dashboard pages
<div className="min-h-screen bg-[#F7F5F5]">
  <AdminNav userName="Sarah Johnson" adminSince="2024" />
  <div className="flex gap-6">
    <AdminSidebar />
    <AdminMainContent />
  </div>
</div>;
```

## Data Structure

Each listing contains:

- Image URL
- Name and location
- Host name and email
- Submission date
- Status (pending/approved/rejected)
- Action handlers for view/approve/reject operations
