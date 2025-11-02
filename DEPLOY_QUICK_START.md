# 🎯 Quick Deployment Reference

## ✅ What's Ready

Your application is now configured for deployment with:

### 📦 Files Created

- ✅ `railway.json` - Railway deployment configuration
- ✅ `vercel.json` - Vercel deployment configuration  
- ✅ `backend/src/config/cloudinary.ts` - Cloudinary file upload setup
- ✅ `backend/src/routes/upload.ts` - File upload endpoints (updated)
- ✅ `.env.example` - Frontend environment template
- ✅ `backend/.env.example` - Backend environment template
- ✅ `DEPLOYMENT.md` - Complete deployment guide

### 🔧 Updates Made

- ✅ Cloudinary packages installed (`cloudinary`, `multer`, `multer-storage-cloudinary`)
- ✅ Backend package.json scripts updated for Railway
- ✅ API client configured to use environment variables
- ✅ Upload routes migrated from local to Cloudinary storage

---

## 🚀 Deploy Now - 3 Steps

### STEP 1: Cloudinary (5 minutes)

1. Sign up: https://cloudinary.com/users/register/free
2. Get credentials from dashboard:
   - Cloud Name
   - API Key  
   - API Secret
3. Keep these for Step 2!

### STEP 2: Railway (10 minutes)

1. Go to: https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `agv-gold-lendr` repository
5. Add PostgreSQL database (New → Database → PostgreSQL)
6. Set environment variables:
   ```
   DATABASE_URL=(auto-provided)
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=from-step-1
   CLOUDINARY_API_KEY=from-step-1
   CLOUDINARY_API_SECRET=from-step-1
   ```
7. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
8. Generate domain → **Copy your Railway URL**

### STEP 3: Vercel (5 minutes)

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Import `agv-gold-lendr` repository
4. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
6. Deploy!

---

## 🔄 Update CORS

After Vercel deployment, go back to Railway and update:

```
CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
```

---

## ✨ You're Done!

Your application is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.up.railway.app/api
- **Files**: Cloudinary (automatic CDN)

---

## 📚 Need Help?

See `DEPLOYMENT.md` for detailed instructions with screenshots and troubleshooting.

---

**Total Time**: ~20 minutes  
**Total Cost**: $0/month (free tier) 🎉
