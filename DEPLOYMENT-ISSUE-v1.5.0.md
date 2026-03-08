# Deployment Issue: Thai Learning Manager v1.5.0

## Current Status

✅ **Code Ready**: v1.5.0 fully built and tested
✅ **GitHub**: v1.5.0 pushed to main branch
✅ **Local**: v1.5.0 running successfully at localhost:3001
❌ **Live Site**: Still showing v1.0.0-thai at https://thai.collin.cc

## Root Cause

**Cloudflare API Token Account Mismatch**:
- Token is scoped to account: `13c33fc58720b7c63299cd7b8bb58ec2`
- Your actual account ID: `1a27f217b48b91817acfba9a30f8c125`
- Wrangler CLI cannot access the `thai-learning` project due to this mismatch

**Error Message**:
```
✘ [ERROR] A request to the Cloudflare API (/accounts/13c33fc58720b7c63299cd7b8bb58ec2/pages/projects/thai-learning) failed.
Authentication error [code: 10000]
```

## Solution: Manual Deployment via Dashboard

Since the CLI cannot deploy due to token permissions, you need to upload manually through the Cloudflare Dashboard.

### Step-by-Step Deployment Instructions

#### 1. Access Cloudflare Dashboard
- Go to: https://dash.cloudflare.com
- Navigate to "Workers & Pages"
- Find project: `thai-learning`

#### 2. Download Deployment Package
Two options:

**Option A**: Download from this location
- File: `/home/user/thai-webapp/thai-learning-v1.5.0-dist-FINAL.tar.gz` (114 KB)
- Extract to get the `dist/` folder contents

**Option B**: Use files directly from
- `/home/user/thai-webapp/dist/` folder
  - `_worker.js` (305 KB) ← **This file contains v1.5.0**
  - `_routes.json` (54 bytes)
  - `static/` folder (all contents)

#### 3. Upload via Cloudflare Dashboard
1. Click on the `thai-learning` project
2. Go to "Deployments" tab
3. Click "Create deployment" button (or similar)
4. Select production branch: `main`
5. Upload all files from the `dist/` folder:
   - Drag and drop the entire `dist` folder contents
   - OR upload individual files listed above
6. Click "Save and Deploy"
7. Wait 1-2 minutes for deployment to complete

#### 4. Verify Deployment
After deployment completes:

**Check API Version**:
```bash
curl https://thai.collin.cc/api/version
# Expected: {"version":"1.5.0","language":"Thai","levels":"CEFR (A1-C2)"}
```

**Check Website**:
- Visit: https://thai.collin.cc
- Look for "**v1.5.0**" in the navigation bar (small gray text)
- Check footer: Should say "Thai Learning Manager **v1.5.0**"

## Alternative: Fix API Token Permissions

If you want to enable CLI deployments for future updates:

### Option 1: Update Token Permissions
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find your current API token
3. Edit permissions to include:
   - **Account** → **Cloudflare Pages** → **Edit**
   - Ensure it's scoped to account: `1a27f217b48b91817acfba9a30f8c125`
4. Save changes
5. Update the token in Deploy tab

### Option 2: Create New API Token
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create new token with template: **"Edit Cloudflare Workers"**
3. Ensure permissions include:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Account Settings** → **Read**
4. **Important**: Scope to account `1a27f217b48b91817acfba9a30f8c125`
5. Save and copy the new token
6. Update in Deploy tab

## What's New in v1.5.0

### Version Display
- ✅ Navigation bar shows "v1.5.0" in small gray text
- ✅ Footer shows "Thai Learning Manager v1.5.0"
- ✅ API endpoints return version 1.5.0

### New Features
- 🚗 **Driving Mode**: Hands-free learning with audio playback
- 📚 **300-Word Vocabulary**: Complete CEFR A1-C2 coverage
- 📖 **Documentation**: 5 comprehensive guides
- 🚀 **Quick-Start Guide**: Easy onboarding for new users

### Files Modified
- `package.json` → version: "1.5.0"
- `src/index.tsx` → VERSION = '1.5.0'
- `dist/_worker.js` → Compiled with v1.5.0
- `CHANGELOG.md` → Full release notes
- `README.md` → Updated status

## Important Links

- **Live Site**: https://thai.collin.cc
- **GitHub Repo**: https://github.com/BernardOnSteroid/thai-learning-manager
- **Latest Commit**: eb5c577
- **Deployment Package**: `/home/user/thai-webapp/thai-learning-v1.5.0-dist-FINAL.tar.gz`
- **Cloudflare Dashboard**: https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages

## Next Steps

1. ⚠️ **HIGH PRIORITY**: Manual deployment via Cloudflare Dashboard
2. 🔧 **RECOMMENDED**: Fix API token permissions for future CLI deployments
3. ✅ **VERIFY**: Check thai.collin.cc shows v1.5.0 after deployment
4. 📊 **MONITOR**: Test all features work correctly in production

---
**Document Created**: March 7, 2026
**Priority**: HIGH - Immediate Action Required
**Status**: Awaiting Manual Deployment
