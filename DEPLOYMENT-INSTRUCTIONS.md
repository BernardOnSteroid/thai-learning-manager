# 🚀 Thai Learning App - Manual Deployment Instructions

## ✅ **Status: Ready for Deployment**

The Thai Learning App with **Driving Mode** feature is built and ready to deploy to Cloudflare Pages.

---

## 📦 **What's Been Prepared**

- ✅ Built successfully (dist folder: 420KB)
- ✅ All files optimized (_worker.js: 298KB)
- ✅ Driving mode fully implemented
- ✅ Committed to GitHub (commit: 8ce55fc)
- ✅ Tested and working locally

---

## 🌐 **Option 1: Manual Upload via Dashboard (Recommended - 2 minutes)**

This is the **fastest and most reliable** method:

### **Steps:**

1. **Go to Cloudflare Pages Dashboard:**
   ```
   https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning
   ```

2. **Create New Deployment:**
   - Click the **"Create deployment"** button (top right)
   - Or click **"Deployments"** tab → **"Create deployment"**

3. **Upload Files:**
   - **Method A: Drag & Drop** (Easiest)
     - Open local file manager
     - Navigate to: `/home/user/thai-webapp/dist/`
     - Select ALL files in dist folder:
       - `_worker.js` (298KB - main app)
       - `_routes.json` (54B - routing config)
       - `static/` folder (contains driving-mode.js, thai-pronunciation.js, app.js, style.css)
     - Drag and drop onto the Cloudflare upload area
   
   - **Method B: Browse & Select**
     - Click **"Browse files"**
     - Navigate to `/home/user/thai-webapp/dist/`
     - Select all files and folders
     - Click **"Open"** or **"Upload"**

4. **Deploy:**
   - Production branch: `main` (should auto-detect)
   - Click **"Save and Deploy"**
   - Wait ~30-60 seconds for deployment to complete

5. **Verify:**
   - You'll see: "✅ Deployment successful"
   - Production URL: `https://thai-learning.pages.dev`
   - Deployment URL: `https://[random-id].thai-learning.pages.dev`

---

## 🔗 **Option 2: GitHub Auto-Deploy (Recommended for ongoing updates - 5 minutes)**

This connects your GitHub repo so every push automatically deploys:

### **Steps:**

1. **Go to Project Settings:**
   ```
   https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning/settings/builds
   ```

2. **Connect GitHub Repository:**
   - Click **"Connect to Git"** or **"Change source"**
   - Select **"GitHub"**
   - Authorize Cloudflare if needed
   - Select repository: **`BernardOnSteroid/thai-learning-manager`**
   - Branch: **`main`**

3. **Configure Build Settings:**
   ```
   Build command:     npm run build
   Build output dir:  dist
   Root directory:    /
   Production branch: main
   ```

4. **Add Environment Variables** (if not already set):
   - Click **"Environment variables"** tab
   - Add these (if missing):
     ```
     DATABASE_URL = postgresql://neondb_owner:npg_Z0aA9PDdMvhC@ep-winter-salad-a1koss01-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
     JWT_SECRET = TP1ItWkueiKKRexM9xLCCSl/bVUjEx/jDCXBv2lPe1JC62Bq4hKhp8sF1OfeisdcGPqfHU8TUnjy+LCu16m+0A==
     GEMINI_API_KEY = AIzaSyCwHQiN7T-FkWcdoAWKPHqO4LsEPxCOQNk
     ```
   - Apply to: **Both Production and Preview**

5. **Save and Deploy:**
   - Click **"Save and Deploy"**
   - Wait ~2-3 minutes for first build
   - All future git pushes will auto-deploy!

---

## 🔧 **Option 3: Wrangler CLI (If account issue resolved)**

If you want to try wrangler again later:

```bash
cd /home/user/thai-webapp

# Clear all caches
rm -rf .wrangler ~/.wrangler ~/.config/.wrangler

# Deploy
npx wrangler pages deploy dist --project-name thai-learning --commit-dirty=true
```

**Note:** Currently has account ID mismatch issue. Use Option 1 or 2 instead.

---

## ✅ **After Deployment - Verification Checklist**

Once deployed, test these URLs:

### **1. Homepage:**
```
https://thai-learning.pages.dev
```
Expected: Login/Register page loads

### **2. Health Check:**
```
https://thai-learning.pages.dev/api/health
```
Expected JSON:
```json
{
  "status": "ok",
  "message": "Thai Learning Manager API",
  "version": "1.0.0-thai",
  "database": "Neon PostgreSQL"
}
```

### **3. Test Driving Mode:**
1. Register account / Login
2. Click **"Driving Mode"** in top menu
3. See 3 mode cards (Recent/Due/Random)
4. Click **"Random Words"**
5. Should load 20 words
6. Click **"Play"**
7. Should hear: Thai word → Romanization → Meaning → ...

---

## 📱 **Deployment URLs**

After deployment, your app will be available at:

- **Production:** `https://thai-learning.pages.dev`
- **Latest Deploy:** `https://[random-hash].thai-learning.pages.dev`
- **Custom Domain** (if configured): `https://thai.collin.cc`

---

## 🎯 **What's Included in This Deployment**

### **New Features:**
- ✅ **Driving Mode** - Hands-free audio learning
- ✅ **3 Learning Modes** - Recent/Due/Random
- ✅ **Player Controls** - Play/Pause/Skip/Previous
- ✅ **Speed Settings** - 0.7x to 1.2x
- ✅ **Customizable** - Repeat word, examples on/off
- ✅ **Progress Tracking** - Visual progress bar
- ✅ **Mobile Support** - Added to mobile menu

### **Updated Files:**
```
dist/
├── _worker.js          (304KB - includes all backend + driving mode)
├── _routes.json        (54B)
└── static/
    ├── driving-mode.js (12KB - new file!)
    ├── thai-pronunciation.js (7KB)
    ├── app.js          (87KB)
    └── style.css       (49B)
```

### **API Endpoints Added:**
- `GET /api/user-progress?limit=20&sort=recently_learned`
- `GET /api/user-progress/due?limit=20`
- `GET /api/entries/random?limit=20`

---

## 🛡️ **Environment Variables Needed**

Make sure these are set in Cloudflare Pages (already configured if existing project):

```bash
DATABASE_URL = postgresql://neondb_owner:npg_Z0aA9PDdMvhC@ep-winter-salad-a1koss01-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET = TP1ItWkueiKKRexM9xLCCSl/bVUjEx/jDCXBv2lPe1JC62Bq4hKhp8sF1OfeisdcGPqfHU8TUnjy+LCu16m+0A==

GEMINI_API_KEY = AIzaSyCwHQiN7T-FkWcdoAWKPHqO4LsEPxCOQNk
```

---

## 📊 **Deployment Timeline**

| Method | Time | Complexity | Auto-updates |
|--------|------|------------|--------------|
| **Manual Upload** | ~2 min | Easy | No |
| **GitHub Connect** | ~5 min | Medium | Yes ✅ |
| **Wrangler CLI** | ~1 min | Easy | No |

**Recommendation:** Use **Manual Upload** for immediate deployment, then set up **GitHub Auto-Deploy** for future updates.

---

## 🎉 **What Your Client Will Get**

After deployment, your client can:

1. **Login** at `https://thai-learning.pages.dev`
2. **Click "Driving Mode"** in menu
3. **Choose learning mode** (Recent/Due/Random)
4. **Press Play** and learn while driving! 🚗🇹🇭

---

## 🔗 **Quick Links**

- **Dashboard:** https://dash.cloudflare.com/1a27f217b48b91817acfba9a30f8c125/pages/view/thai-learning
- **GitHub Repo:** https://github.com/BernardOnSteroid/thai-learning-manager
- **Backup Download:** https://www.genspark.ai/api/files/s/4kUctTMk
- **Documentation:** DRIVING-MODE-README.md

---

## 🆘 **Troubleshooting**

### **Issue: Environment variables not set**
- **Solution:** Go to Settings → Environment variables → Add them
- Must be in **both** Production and Preview

### **Issue: 500 error on API calls**
- **Solution:** Check DATABASE_URL is correct
- Test connection in dashboard logs

### **Issue: Driving Mode not showing**
- **Solution:** Hard refresh browser (Ctrl+Shift+R)
- Clear cache
- Check dist/static/driving-mode.js exists in deployment

### **Issue: Thai voice not working**
- **Solution:** Browser compatibility issue
- Try Chrome (best Thai voice support)
- Check device has Thai language pack installed

---

## ✅ **Deployment Complete Checklist**

After deploying, verify:

- [ ] Homepage loads successfully
- [ ] Login/Register works
- [ ] Dashboard shows stats
- [ ] Browse entries works
- [ ] **"Driving Mode" link visible in menu**
- [ ] **Driving Mode page loads**
- [ ] **Can select learning mode**
- [ ] **Play button works**
- [ ] **Thai audio plays**
- [ ] **Controls work (pause/skip/previous)**
- [ ] Mobile menu includes Driving Mode

---

## 🚀 **Ready to Deploy!**

Everything is prepared. Just follow **Option 1** or **Option 2** above to deploy to production.

**Estimated time:** 2-5 minutes  
**Status:** ✅ Ready  
**Risk:** Low (well-tested)

---

**Questions?** Check the DRIVING-MODE-README.md for full documentation.

**Need help?** All files are in `/home/user/thai-webapp/dist/` ready to upload.
