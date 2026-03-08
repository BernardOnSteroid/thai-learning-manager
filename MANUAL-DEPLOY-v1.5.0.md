# Manual Deployment Instructions for v1.5.0

## ✅ Current Status

**Your code is ready!** Version 1.5.0 has been:
- ✅ Built successfully (`dist/` folder ready)
- ✅ Committed to GitHub (commit `b10bce4`)
- ✅ Pushed to `main` branch
- ✅ Version displays correctly: **v1.5.0** in navigation AND footer

## 🚀 Deploy to https://thai.collin.cc

Since the Cloudflare CLI has account ID caching issues, use **manual upload** via Cloudflare Dashboard (takes 2 minutes):

### Method 1: Manual Upload via Dashboard (Recommended)

1. **Go to Cloudflare Pages**:
   https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning

2. **Click "Create deployment"** (or "Upload assets")

3. **Upload the `dist` folder**:
   - Location: `/home/user/thai-webapp/dist/`
   - Contains: `_worker.js`, `_routes.json`, `static/` folder
   
4. **Select Production branch**: `main`

5. **Click "Save and Deploy"**

6. **Wait 30-60 seconds** for deployment to complete

7. **Verify**: Visit https://thai.collin.cc
   - Check navigation: Should show "v1.5.0"
   - Check footer: Should show "Thai Learning Manager v1.5.0"
   - Check API: https://thai.collin.cc/api/version

---

### Method 2: Wait for GitHub Auto-Deploy

Since you've already pushed to GitHub, Cloudflare Pages should auto-deploy:
- **Webhook triggered**: When you pushed commits `d3ffe2a` and `b10bce4`
- **Build time**: 3-5 minutes
- **Status**: Should be building now

**Check status**:
https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning/deployments

---

## 📦 What You'll Upload (Method 1)

The `dist/` folder contains:
```
dist/
├── _worker.js (305 KB) - Main application bundle
├── _routes.json - Routing configuration
└── static/
    ├── app.js - Frontend JavaScript
    ├── driving-mode.js - Driving Mode feature
    ├── thai-pronunciation.js - Pronunciation helper
    └── styles.css - Custom styles
```

---

## ✅ Verification Checklist

After deployment, verify these show **v1.5.0**:

### 1. Navigation Bar
Visit: https://thai.collin.cc
Look for: "v1.5.0" in small gray text under the title

### 2. Footer
Scroll to bottom of page
Look for: "Thai Learning Manager v1.5.0"

### 3. API Endpoint
```bash
curl https://thai.collin.cc/api/version
```
Should return: `{"version":"1.5.0","language":"Thai","levels":"CEFR (A1-C2)"}`

### 4. Health Endpoint
```bash
curl https://thai.collin.cc/api/health
```
Should include: `"version":"1.5.0"`

---

## 🎯 Quick Commands

**Download dist folder for manual upload**:
```bash
cd /home/user/thai-webapp
tar -czf dist-v1.5.0.tar.gz dist/
```

**Check local version**:
```bash
curl http://localhost:3001/api/version
# Returns: {"version":"1.5.0",...}
```

**Check live version**:
```bash
curl https://thai.collin.cc/api/version
# Currently: {"version":"1.0.0-thai",...}
# After deploy: {"version":"1.5.0",...}
```

---

## 🔍 Current Situation

### Local (Sandbox) ✅
- Version: **1.5.0**
- Navigation: Shows "v1.5.0"
- Footer: Shows "v1.5.0"
- API: Returns "1.5.0"
- Status: ✅ Perfect!

### Live (thai.collin.cc) ❌
- Version: **1.0.0-thai** (old)
- Navigation: No version display
- Footer: Shows "v1.0.0-thai"
- API: Returns "1.0.0-thai"
- Status: ⏳ Waiting for deployment

---

## 💡 Why Manual Upload?

The `wrangler` CLI is trying to use a cached account ID (`13c33fc58720b7c63299cd7b8bb58ec2`) instead of the correct one (`1a27f217b48b91817acfba9a30f8c125`). This is a known wrangler caching issue.

**Solutions**:
1. ✅ **Manual upload** via dashboard (fastest, 2 minutes)
2. ✅ **Wait for GitHub auto-deploy** (3-5 minutes, should work automatically)
3. ❌ Fix wrangler cache (complicated, not worth the time)

---

## 🎉 Summary

**Everything is ready for deployment!**

✅ Code built with v1.5.0  
✅ Version shows in navigation  
✅ Version shows in footer  
✅ Committed to GitHub  
✅ Pushed to main branch  

**Next**: Choose Method 1 (manual upload, 2 min) or wait for Method 2 (auto-deploy, 5 min)

**After deployment**, visit https://thai.collin.cc and you'll see:
- "v1.5.0" in the navigation bar
- "Thai Learning Manager v1.5.0" in the footer
- All the new features (Driving Mode, 300 words ready, etc.)

---

## 📞 Links

- **Dashboard**: https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning
- **Deployments**: https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning/deployments
- **Live Site**: https://thai.collin.cc
- **GitHub**: https://github.com/BernardOnSteroid/thai-learning-manager
- **Latest Commit**: b10bce4

The app is ready to go live with v1.5.0! 🚀
