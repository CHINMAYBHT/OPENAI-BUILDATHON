# 🚀 Vercel Deployment Guide

## Overview
This project has two separate deployments:
- **Backend** (Express.js API) - Deployed as Vercel Serverless Functions
- **Frontend** (React + Vite) - Deployed as Static Site

---

## 📋 Prerequisites

1. Install Vercel CLI (optional but recommended):
```bash
npm install -g vercel
```

2. Create a [Vercel Account](https://vercel.com/signup)

3. Have your environment variables ready:
   - Gemini API Key
   - Supabase URL & Keys
   - ElevenLabs API Key (optional)

---

## 🔧 Backend Deployment (API)

### Step 1: Deploy Backend First

1. **Login to Vercel:**
```bash
vercel login
```

2. **Navigate to Backend folder:**
```bash
cd Backend
```

3. **Deploy:**
```bash
vercel
```

4. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `job-helper-backend` (or your choice)
   - In which directory is your code located? `./`
   - Want to modify settings? `N`

5. **For production deployment:**
```bash
vercel --prod
```

### Step 2: Add Backend Environment Variables

Go to your Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ELEVENLABS_API_KEY=your_elevenlabs_key (optional)
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
PORT=5000
NODE_ENV=production
API_BASE_URL=https://job-helper-backend.vercel.app
```

**Important:** Replace `https://job-helper-backend.vercel.app` with your actual backend URL

### Step 3: Note Your Backend URL

After deployment, Vercel will give you a URL like:
```
https://job-helper-backend-xxxx.vercel.app
```

**Copy this URL - you'll need it for frontend deployment!**

---

## 🎨 Frontend Deployment

### Step 1: Update Frontend Environment Variables

Before deploying, you need your backend URL from the previous step.

Go to Vercel Dashboard (or use CLI in the next step).

### Step 2: Deploy Frontend

1. **Navigate to Frontend folder:**
```bash
cd ../Frontend
```

2. **Deploy:**
```bash
vercel
```

3. **Follow prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `job-helper-frontend` (or your choice)
   - In which directory is your code located? `./`
   - Want to modify settings? `N`

4. **For production deployment:**
```bash
vercel --prod
```

### Step 3: Add Frontend Environment Variables

Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add these variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://job-helper-backend-xxxx.vercel.app
```

**Important:** Use your actual backend URL from Step 3 of Backend deployment!

### Step 4: Redeploy Frontend

After adding environment variables, redeploy:
```bash
vercel --prod
```

---

## 🌐 Alternative: Deploy via Vercel Dashboard

### Backend:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Root Directory:** Select `Backend`
5. **Framework Preset:** Other
6. **Build Command:** Leave empty (or `npm install`)
7. **Output Directory:** Leave empty
8. Add all environment variables
9. Click **Deploy**

### Frontend:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the same GitHub repository (create new project)
4. **Root Directory:** Select `Frontend`
5. **Framework Preset:** Vite
6. **Build Command:** `npm run build`
7. **Output Directory:** `dist`
8. Add all environment variables (with your backend URL)
9. Click **Deploy**

---

## ⚙️ Backend CORS Configuration

After deployment, update your backend CORS settings to allow your frontend domain.

In `Backend/server.js`, the CORS is already configured to accept all origins:
```javascript
app.use(cors());
```

For production, you might want to restrict it:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend environment variables set
- [ ] Frontend deployed and accessible
- [ ] Frontend environment variables set (with correct backend URL)
- [ ] Test API endpoints from frontend
- [ ] Test Supabase authentication
- [ ] Test Gemini AI features
- [ ] Test file uploads (resume builder)
- [ ] Verify CORS is working
- [ ] Check browser console for errors

---

## 🔍 Troubleshooting

### Backend Issues:

**Error: "Missing environment variables"**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Verify all required variables are set
- Redeploy the project

**Error: "CORS policy"**
- Check your CORS configuration in `server.js`
- Ensure frontend domain is allowed

### Frontend Issues:

**Error: "Failed to fetch"**
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is deployed and running
- Open browser DevTools → Network tab to see actual error

**Error: "Missing Supabase credentials"**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Make sure they start with `VITE_` prefix

**Blank page after deployment:**
- Check browser console for errors
- Verify build completed successfully
- Check vercel.json routing configuration

---

## 🔄 Redeployment

### After making code changes:

**Via CLI:**
```bash
vercel --prod
```

**Via Git:**
- Push changes to your main branch
- Vercel will auto-deploy (if connected to Git)

### After changing environment variables:

1. Update variables in Vercel Dashboard
2. Trigger a new deployment (or redeploy via CLI)

---

## 📊 Monitoring

- **Vercel Dashboard:** Monitor deployments, logs, and analytics
- **Backend Logs:** Vercel Dashboard → Your Backend Project → Deployments → Click deployment → Runtime Logs
- **Frontend Logs:** Browser DevTools → Console

---

## 💡 Tips

1. **Use Environment Variables:** Never hardcode API keys
2. **Test Locally First:** Run `npm run build` locally before deploying
3. **Check Build Logs:** Review build logs in Vercel Dashboard for errors
4. **Use Preview Deployments:** Test changes in preview deployments before production
5. **Set up Custom Domain:** Add a custom domain in Vercel Dashboard for professional URLs

---

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- Check the `.env.example` file for required variables
- Review error logs in Vercel Dashboard

---

**Your app should now be live! 🎉**

Frontend: `https://your-frontend.vercel.app`
Backend: `https://your-backend.vercel.app`
