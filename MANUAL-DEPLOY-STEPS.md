# Manual Deployment Steps for Thai Learning Manager v1.5.0

## Issue
The live site at https://thai.collin.cc is still showing **v1.0.0-thai** instead of **v1.5.0**.

## Root Cause
Cloudflare Pages auto-deployment is not working despite code being pushed to GitHub.

## Solution: Manual Upload via Cloudflare Dashboard

### Steps:

1. **Download the deployment package**:
   - Location: `/home/user/thai-webapp/dist/` folder
   - Or download: `thai-learning-v1.5.0-dist-FINAL.tar.gz` (114 KB)

2. **Access Cloudflare Pages Dashboard**:
   - URL: https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages
   - Find project: `thai-learning`

3. **Create Manual Deployment**:
   - Click on the `thai-learning` project
   - Click "Create deployment" button
   - Select branch: `main`
   - Upload **all files from the `dist/` folder**:
     * `_worker.js` (305 KB) - Contains v1.5.0 code
     * `_routes.json` (54 B)
     * `static/` folder (all files)
   
4. **Deploy**:
   - Click "Save and Deploy"
   - Wait 1-2 minutes for deployment
   - Custom domain should automatically update: https://thai.collin.cc

5. **Verify**:
   ```bash
   curl https://thai.collin.cc/api/version
   # Should return: {"version":"1.5.0","language":"Thai","levels":"CEFR (A1-C2)"}
   ```
   
   Visit https://thai.collin.cc and check:
   - Navigation bar should show "v1.5.0" in small gray text
   - Footer should show "Thai Learning Manager v1.5.0"

## Alternative: Fix Auto-Deploy

To enable automatic deployments from GitHub:

1. Go to project settings in Cloudflare Pages
2. Check "Build & deployments" section
3. Ensure GitHub repository is connected: `BernardOnSteroid/thai-learning-manager`
4. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Production branch**: `main`
5. Save settings
6. Future pushes to `main` branch will auto-deploy

## Files Ready for Deployment

All files are in `/home/user/thai-webapp/dist/`:
- `_worker.js` - Contains entire v1.5.0 application
- `_routes.json` - Routing configuration
- `static/` - Static assets

## Current Status

✅ **Built**: v1.5.0
✅ **GitHub**: v1.5.0 (pushed to main)
✅ **Local**: v1.5.0 (running at localhost:3001)
❌ **Live**: v1.0.0-thai (needs manual upload)

## Download Links

- Deployment package: Available in `/home/user/thai-webapp/thai-learning-v1.5.0-dist-FINAL.tar.gz`
- Extract and upload all contents to Cloudflare Pages

---
**Date**: March 7, 2026
**Version**: 1.5.0
**Priority**: HIGH - Manual deployment required
