# PWA Auto-Update System Documentation

## Overview
This PWA implementation automatically updates to the latest version when users open the app after a new deployment. This ensures all users are always running the most recent version without having to manually refresh or close/reopen the app.

## How it Works

### 1. Service Worker Updates
- The service worker automatically clears old caches when a new version is deployed
- It uses cache versioning to differentiate between old and new versions
- The new service worker immediately takes control of all clients (`skipWaiting()` and `clientsClaim()`)

### 2. Automatic Refresh Process
1. When a new version is deployed, the service worker detects it
2. Old caches are automatically cleared
3. The page is automatically reloaded to load the new content
4. Users experience no interruption - just the latest version

### 3. Cache Management
- Each deployment has a unique cache version
- Old caches are automatically deleted during service worker activation
- Only the current version's cache is kept

## Deployment Instructions

To deploy a new version of the PWA:

1. Update the `CACHE_VERSION` in `public/sw.js`:
   ```javascript
   const CACHE_VERSION = 'itiket-pwa-v1.2'; // Increment this for each deployment
   ```

2. Deploy your updated application files

3. The new service worker will automatically:
   - Detect the version change
   - Clear old caches
   - Force all users to load the new version

## Files Involved

- `public/sw.js` - Service worker with auto-update logic
- `src/context/PWAContext.tsx` - React context that handles service worker communication
- `src/components/AddToHomeScreenPrompt.tsx` - PWA installation prompt
- `src/app/layout.tsx` - Main layout that wraps the app with PWAProvider

## Browser Compatibility

This system works across:
- Chrome and Chrome-based browsers (Android, Desktop)
- Safari (iOS PWA standalone mode)
- Firefox
- Edge

## Key Features

- **Automatic Cache Clearing**: Old cached files are automatically removed
- **Immediate Updates**: New service worker takes control immediately
- **No User Action Required**: Updates happen automatically
- **Cross-Platform**: Works on mobile and desktop platforms
- **Reliable**: Uses standard PWA technologies with fallbacks

## Troubleshooting

If updates are not happening automatically:

1. Check that `CACHE_VERSION` was incremented in `public/sw.js`
2. Verify that `PWAProvider` is wrapping your application in `layout.tsx`
3. Ensure the service worker file is accessible at `/sw.js`
4. Check browser console for service worker errors

## Notes

- The cache version must be manually incremented with each deployment
- Development mode may disable service workers depending on browser settings
- Users need to visit the app once after deployment to receive the update
- Network connectivity affects the initial update detection