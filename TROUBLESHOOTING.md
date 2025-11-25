# Troubleshooting Guide - Google Maps Error

## "This page didn't load Google Maps correctly" Error

If you're seeing this error, follow these steps:

### 1. Check API Key Configuration

Make sure your Google Maps API key is set in `frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAeNjtFEJFrJ_fqeuvwosu7KrAYjv7nF9A
```

**Important:** After changing `.env.local`, you MUST restart your Next.js dev server:
```bash
# Stop the server (Ctrl+C) and restart:
npm run dev
```

### 2. Enable Maps JavaScript API

Your API key needs to have the **Maps JavaScript API** enabled:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Library**
4. Search for "Maps JavaScript API"
5. Click on it and click **Enable**

### 3. Check API Key Restrictions

If your API key has restrictions, make sure:

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **Application restrictions**, make sure:
   - Either "None" is selected, OR
   - "HTTP referrers" is selected with your domain (e.g., `localhost:3000/*`)
4. Under **API restrictions**, make sure:
   - Either "Don't restrict key" is selected, OR
   - "Restrict key" includes "Maps JavaScript API"

### 4. Verify API Key

Test your API key by visiting this URL in your browser:
```
https://maps.googleapis.com/maps/api/js?key=AIzaSyAeNjtFEJFrJ_fqeuvwosu7KrAYjv7nF9A
```

If you see JavaScript code, the key is working. If you see an error, check the API key.

### 5. Check Browser Console

Open browser Developer Tools (F12) and check the Console tab for specific error messages. Common errors:

- **"RefererNotAllowedMapError"**: Your API key restrictions are blocking the request
- **"ApiNotActivatedMapError"**: Maps JavaScript API is not enabled
- **"InvalidKeyMapError"**: The API key is invalid

### 6. Required APIs

Make sure these APIs are enabled in Google Cloud Console:
- ✅ Maps JavaScript API
- ✅ Places API (for clinic search)
- ✅ Geocoding API (for address conversion)

### Quick Fix Checklist

- [ ] API key is in `frontend/.env.local`
- [ ] Server was restarted after adding `.env.local`
- [ ] Maps JavaScript API is enabled
- [ ] API key restrictions allow `localhost:3000`
- [ ] No billing issues (check Google Cloud Console)

### Still Not Working?

1. Check the browser console for the exact error message
2. Verify the API key works by testing it directly
3. Try creating a new API key with no restrictions (for testing only)
4. Make sure you're using the same API key that works in the backend


