# Vercel Deployment Guide

This project is configured to deploy the **mobile-version** to Vercel.

## Configuration

The `vercel.json` file is configured to:
- Use `mobile-version` as the root directory
- Build using Vite
- Output to `dist` directory
- Handle SPA routing with rewrites

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect the `vercel.json` configuration
5. The build settings will be:
   - **Framework Preset:** Vite
   - **Root Directory:** `mobile-version`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project root
cd /path/to/servicepromobilelatest

# Deploy
vercel

# For production deployment
vercel --prod
```

## Build Configuration

- **Root Directory:** `mobile-version`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## Environment Variables

If you need to set environment variables:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., API URLs, keys, etc.)

## Notes

- The mobile version uses Vite for building
- All routes are handled by the SPA (Single Page Application) rewrite rule
- The build output will be in `mobile-version/dist`
- Make sure all dependencies are listed in `mobile-version/package.json`

