# Google Maps Integration Setup

This document explains how to set up Google Maps integration for the booking page.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Maps API key

## Setup Steps

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (optional, for enhanced features)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

Create a `.env.local` file in the client directory with the following content:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual Google Maps API key.

### 3. Features

The map integration includes:

- **Interactive Map**: Shows the exact location of the workspace
- **Marker**: Pinpoints the workspace location with a custom marker
- **Info Window**: Displays workspace information when marker is clicked
- **Geocoding**: Automatically converts location text to coordinates
- **Responsive Design**: Works on both desktop and mobile devices
- **Loading States**: Shows loading spinner while map loads
- **Error Handling**: Displays helpful error messages if map fails to load

### 4. Usage

The Map component is used in the booking page (`/search/book/[id]`) and automatically:

1. Takes the workspace location as a prop
2. Geocodes the location to get coordinates
3. Displays an interactive map centered on the location
4. Places a marker at the exact location
5. Shows an info window with workspace details when clicked

### 5. Customization

You can customize the map by modifying the `Map.tsx` component:

- **Map Style**: Change the `styles` array in `mapOptions`
- **Zoom Level**: Adjust the `zoom` property
- **Map Type**: Change `mapTypeId` (ROADMAP, SATELLITE, HYBRID, TERRAIN)
- **Controls**: Enable/disable various map controls
- **Marker Icon**: Customize the marker appearance
- **Info Window**: Modify the content and styling

### 6. Security Notes

- Always restrict your API key to specific domains
- Monitor your API usage in the Google Cloud Console
- Consider implementing usage quotas to prevent unexpected charges
- Never commit your API key to version control

### 7. Troubleshooting

**Map not loading:**
- Check if the API key is correctly set in `.env.local`
- Verify that the required APIs are enabled in Google Cloud Console
- Check browser console for error messages

**Location not found:**
- Ensure the location string is specific enough (e.g., "Victoria Island, Lagos, Nigeria" instead of just "Lagos")
- Check if the Geocoding API is enabled

**Performance issues:**
- Consider implementing map lazy loading for better performance
- Use map clustering for multiple locations
- Optimize map styles to reduce rendering complexity

## Example Usage

```tsx
import Map from '@/components/Map';

function MyComponent() {
  return (
    <Map 
      location="Victoria Island, Lagos, Nigeria" 
      className="w-full h-96"
    />
  );
}
```

## Dependencies

- `@googlemaps/js-api-loader`: For loading Google Maps JavaScript API
- Google Maps JavaScript API
- Geocoding API
