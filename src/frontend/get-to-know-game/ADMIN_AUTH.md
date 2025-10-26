# Admin Authentication Guide

## Overview

The admin section now uses **header-based authentication** instead of query parameters for improved security and functionality.

## Authentication Methods

The backend supports two header formats:

1. **Authorization Header (Bearer Token)**:
   ```
   Authorization: Bearer your-admin-key-here
   ```

2. **Custom Header (Fallback)**:
   ```
   X-Admin-Key: your-admin-key-here
   ```

## Browser Extension Setup

### Using ModHeader (Chrome/Edge)

1. Install [ModHeader](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj) extension
2. Open the extension and add a new header:
   - **Name**: `Authorization`
   - **Value**: `Bearer your-admin-key-here`
3. Enable the header for your domain
4. Navigate to `/admin` - you'll be prompted for the admin key if not already set

### Using Requestly (Chrome/Firefox)

1. Install [Requestly](https://requestly.io/) extension
2. Create a new rule:
   - **Rule Type**: Modify Headers
   - **When**: URL contains your domain
   - **Add Header**: `Authorization: Bearer your-admin-key-here`

### Using Tampermonkey (All Browsers)

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Create a new script:

```javascript
// ==UserScript==
// @name         Admin Auth Header
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add admin auth header
// @author       You
// @match        https://yourdomain.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Add header to all fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('/api/admin/')) {
            if (!args[1]) args[1] = {};
            if (!args[1].headers) args[1].headers = {};
            args[1].headers['Authorization'] = 'Bearer your-admin-key-here';
        }
        return originalFetch.apply(this, args);
    };
})();
```

## Frontend Integration

The frontend automatically handles authentication through the `adminApi` service:

```javascript
import { adminApi } from '$lib/services/adminApi.js';

// Set admin key (stored in localStorage)
adminApi.setAdminKey('your-admin-key-here');

// All API calls automatically include the auth header
const stats = await adminApi.getStats();
const sessions = await adminApi.getSessions();
```

## Security Benefits

1. **No URL Exposure**: Admin keys are not visible in URLs, logs, or browser history
2. **All HTTP Methods**: Works with GET, POST, PUT, DELETE requests
3. **Standard Practice**: Uses industry-standard Authorization header format
4. **Automatic Handling**: Frontend service manages headers automatically

## Environment Setup

Make sure your backend has the admin key configured:

```bash
# In your .env file
ADMIN_KEY=your-super-secret-admin-key-change-this
```

## Testing

You can test the authentication using curl:

```bash
# Test with Authorization header
curl -H "Authorization: Bearer your-admin-key" \
     https://yourdomain.com/api/admin/stats

# Test with X-Admin-Key header
curl -H "X-Admin-Key: your-admin-key" \
     https://yourdomain.com/api/admin/stats
```

## Troubleshooting

1. **401 Unauthorized**: Check that your admin key is correct and the header is being sent
2. **CORS Issues**: Ensure your backend allows the Authorization header in CORS settings
3. **Extension Not Working**: Try refreshing the page after enabling the extension
4. **Key Not Persisting**: The frontend stores the key in localStorage for convenience

## Migration from Query Parameters

If you were previously using query parameters, simply:

1. Set up a browser extension with the header
2. Remove any `?admin_key=...` from URLs
3. The frontend will automatically use the new authentication method
