# 🐛 Debug Guide: "Please login first" Issue in Driving Mode

## Current Issue
User is logged in but Driving Mode keeps showing "Please login first" error.

## Debug Steps

### Step 1: Check localStorage After Login
After logging in, open browser console (F12) and run:
```javascript
console.log('authToken:', localStorage.getItem('authToken'));
console.log('token:', localStorage.getItem('token'));
console.log('currentUser:', localStorage.getItem('currentUser'));
console.log('All keys:', Object.keys(localStorage));
```

**Expected output:**
- `authToken` should show a long JWT string
- `currentUser` should show user info JSON
- Both should NOT be null

### Step 2: Test API Authentication
In browser console, test if the token works:
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/entries/random?limit=5', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**Expected output:**
- Should return array of Thai words
- Should NOT return "Unauthorized" error

### Step 3: Check Driving Mode Console
1. Navigate to Driving Mode
2. Select any mode (Random/Recent/Due)
3. Click Play
4. Check console for these messages:
   - 🔍 Driving Mode: Checking authentication
   - 🔑 Token from localStorage: exists (length: XXX)
   - ✅ Token found, loading items for mode: random

**If you see:**
- ❌ "Token from localStorage: NOT FOUND" → token is lost after navigation
- 📦 "All localStorage keys: []" → localStorage was cleared

## Possible Causes & Fixes

### Cause 1: Page Reload Clears Token
**Symptom:** Token exists after login but disappears after page reload/navigation

**Fix:** The app should automatically save token to localStorage. Check if you see page reload right after login.

### Cause 2: Wrong Token Key
**Symptom:** Token saved as 'authToken' but Driving Mode reads 'token'

**Status:** ✅ FIXED - Now checks both keys

### Cause 3: CORS or Cookie Issues
**Symptom:** Token exists but API calls fail with CORS errors

**Fix:** Already using Bearer token in Authorization header (not cookies)

### Cause 4: Database Has No Words
**Symptom:** "No items available" instead of "Please login first"

**Status:** ✅ Database has 51 Thai words confirmed

## Quick Test Sequence

1. **Login Test:**
   ```
   1. Open https://3001-ik0v75642hq1r9v9istbr-c07dda5e.sandbox.novita.ai
   2. Login with test account
   3. Wait for redirect to dashboard
   4. F12 → Console → type: localStorage.getItem('authToken')
   5. Should see a long JWT string
   ```

2. **API Test:**
   ```
   1. In same console, type:
      fetch('/api/entries/random?limit=5', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
      }).then(r => r.json()).then(console.log)
   2. Should see array of Thai words
   ```

3. **Driving Mode Test:**
   ```
   1. Click "Driving Mode" in menu
   2. Select "Random Words"
   3. Click Play
   4. Check console for debug messages
   5. Should start playing audio
   ```

## Current Version Info
- **Version:** 1.6.0
- **Test URL:** https://3001-ik0v75642hq1r9v9istbr-c07dda5e.sandbox.novita.ai
- **Features:** Password Reset + Driving Mode + 51 Thai Words
- **Debug logging:** ✅ Enabled in driving-mode.js

## Next Steps if Still Failing

1. Share screenshot of browser console showing:
   - localStorage keys
   - Driving Mode debug messages
   - Any error messages in red

2. Try in different browser (Chrome recommended)

3. Try incognito mode (fresh localStorage)

4. Check if localStorage is disabled in browser settings
