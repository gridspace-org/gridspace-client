# User Dashboard

This is the main user dashboard for the GridSpace application. It provides users with quick access to key features and displays their activity and recommended workspaces.

## Components

### DashboardLayout

A reusable layout component that wraps dashboard pages with consistent navigation and styling.

### DashboardNav

The top navigation bar with:

- GridSpace logo
- Search functionality
- User profile section

### DashboardCard

Reusable cards for dashboard actions with:

- Icon
- Title
- Description
- Click handler

### WorkspaceCard

Displays workspace information with:

- Image
- Name
- Location
- Rating
- Price

## Features

- **Find Workspace**: Search for available workspaces
- **My Bookings**: View upcoming bookings
- **Wallet**: Check wallet balance
- **Message**: Chat with hosts
- **Recent Activity**: Shows user's booking history (empty state)
- **Recommended Spaces**: Displays suggested workspaces

## Styling

The dashboard uses a consistent color scheme:

- Primary: #F25417 (Orange)
- Secondary: #002F5B (Navy Blue)
- Background: #F7F5F5 (Light Gray)
- Text: #686767 (Gray)

## Usage

```tsx
import { DashboardLayout, DashboardCard, WorkspaceCard } from "../components";

// Use in your dashboard pages
<DashboardLayout userName="John Doe" memberSince="2024">
  <DashboardCard
    icon={Search}
    title="Find Workspace"
    description="Search workspaces"
  />
</DashboardLayout>;
```
