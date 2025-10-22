# Host Dashboard

This is the host dashboard for the GridSpace application. It provides hosts with tools to manage their workspace listings, view bookings, track earnings, and communicate with guests.

## Components

### HostNav

The top navigation bar with:

- Back button and dashboard title
- Search functionality
- Host profile section with ratings and booking stats

### HostSidebar

The left sidebar navigation with:

- My Listings (active by default)
- Calendar
- Earnings
- Messages
- Profile

### HostListingCard

Individual workspace listing cards showing:

- Workspace image
- Name and location
- Rating and booking count
- Pricing
- Status indicators (Live, Pending, Paused)
- Action buttons (View, Edit, Toggle Status)

### HostMainContent

The main content area containing:

- Header with listing count and "Add Listing" button
- Grid of workspace listing cards

## Features

- **Listing Management**: View all workspace listings with status indicators
- **Status Control**: Toggle between Live, Pending, and Paused states
- **Quick Actions**: View and edit listings directly from cards
- **Search**: Find specific listings quickly
- **Navigation**: Easy access to different dashboard sections

## Status Types

- **Live**: Active listing accepting bookings (green badge)
- **Pending**: Listing awaiting approval (yellow badge)
- **Paused**: Temporarily disabled listing (blue badge)

## Styling

The host dashboard uses the same color scheme as the user dashboard:

- Primary: #F25417 (Orange)
- Secondary: #002F5B (Navy Blue)
- Background: #F7F5F5 (Light Gray)
- Text: #686767 (Gray)

## Usage

```tsx
import { HostNav, HostSidebar, HostMainContent } from "../components";

// Use in host dashboard pages
<div className="min-h-screen bg-[#F7F5F5]">
  <HostNav userName="Sarah Johnson" ratings={3} bookings={279} />
  <div className="flex gap-6">
    <HostSidebar />
    <HostMainContent />
  </div>
</div>;
```

## Data Structure

Each listing contains:

- Image URL
- Name and location
- Rating and booking count
- Price per day
- Status (live/pending/paused)
- Creation and last booking dates
- Action handlers for view/edit/toggle operations
