# Cloudinary Setup Guide

## Overview
Cloudinary is used for image uploads and management in the GridSpace application. This guide will help you set up Cloudinary for profile picture uploads.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the [Dashboard](https://cloudinary.com/console)
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Configure Environment Variables

1. In your `server` directory, create a `.env` file (if it doesn't exist)
2. Add the following variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=myapp123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456789
```

## Step 4: Test the Configuration

Run the test script to verify your configuration:

```bash
cd server
node test-cloudinary.js
```

You should see:
```
✅ Cloudinary connection successful!
```

## Step 5: Restart Your Server

After setting up the environment variables, restart your server:

```bash
npm start
# or
node server.js
```

## Troubleshooting

### Error: "Cloudinary configuration is missing"
- Make sure all three environment variables are set in your `.env` file
- Check that there are no extra spaces or quotes around the values
- Restart your server after making changes

### Error: "Cloudinary connection failed"
- Verify your credentials are correct
- Check that your Cloudinary account is active
- Ensure you're using the correct cloud name, API key, and API secret

### Error: "Failed to upload profile picture"
- Check the server console for detailed error messages
- Verify your Cloudinary account has sufficient storage quota
- Ensure the image file is valid and under 5MB

## Features

The Cloudinary integration includes:
- **Automatic image optimization** (quality: auto, format: auto)
- **Face detection and cropping** (400x400px with face gravity)
- **Organized storage** (images stored in `gridspace/profiles` folder)
- **Secure URLs** (HTTPS by default)

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

This should be sufficient for development and small-scale production use.

## Security Notes

- Never commit your `.env` file to version control
- Keep your API secret secure
- Consider using environment-specific configurations for production
