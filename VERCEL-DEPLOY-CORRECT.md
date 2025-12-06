# 🚀 CORRECT VERCEL DEPLOYMENT STEPS

## ⚠️ IMPORTANT: Don't Use vercel.json

For projects with subdirectories, configure Vercel through the **Dashboard Settings**, not vercel.json.

## ✅ CORRECT DEPLOYMENT STEPS

### Step 1: Push Your Code
```bash
git add .
git commit -m "Fix Vercel build configuration"
git push
```

### Step 2: Configure in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → General**

**Set these EXACT values:**

1. **Framework Preset:** `Vite`

2. **Root Directory:** `Frontend` ← **CRITICAL!**
   - Click "Edit" next to Root Directory
   - Type: `Frontend`
   - Click "Save"

3. **Build & Development Settings:**
   - **Build Command:** `npm run build` (leave as default)
   - **Output Directory:** `dist` (leave as default)
   - **Install Command:** `npm install` (leave as default)

4. **Node.js Version:** `18.x` or higher

### Step 3: Add Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these for **Production, Preview, AND Development**:

```
VITE_SUPABASE_URL=<your-new-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-new-supabase-key>
VITE_GEMINI_API_KEY=<your-new-gemini-key>
VITE_API_BASE_URL=<your-backend-url>
```

⚠️ **Use NEW keys** (not the exposed ones from Git)

### Step 4: Deploy

**Option A - Automatic:**
- Just push to your main branch
- Vercel will auto-deploy

**Option B - Manual:**
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" → Check "Use existing Build Cache" OFF
- Click "Redeploy"

## 🎯 Why This Works

1. **Root Directory = Frontend** tells Vercel to run all commands from the Frontend folder
2. Vercel will automatically run `npm install` in the Frontend directory
3. Then it runs `npm run build` (which is already configured in Frontend/package.json)
4. Output goes to `dist` (relative to Frontend directory)

## 🔍 Verify Settings

After configuring, your Vercel settings should show:

```
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## 🆘 If Build Still Fails

### 1. Clear Build Cache
- Deployments → ... → Redeploy
- **Uncheck** "Use existing Build Cache"
- Click Redeploy

### 2. Check Build Logs
Look for the actual error in Vercel's deployment logs:
- Deployments → Click on failed deployment
- Check "Building" section for errors

### 3. Verify Environment Variables
- All must start with `VITE_`
- Must be added to all environments (Production, Preview, Development)
- Rebuild after adding new variables

### 4. Check Node Version
- Settings → General → Node.js Version
- Should be 18.x or higher

## 📋 Deployment Checklist

- [ ] Code pushed to Git
- [ ] Root Directory set to `Frontend` in Vercel
- [ ] Build Command is `npm run build`
- [ ] Output Directory is `dist`
- [ ] All environment variables added
- [ ] Environment variables added to all scopes
- [ ] Build cache cleared (if redeploying)
- [ ] Node.js version is 18.x+

## ✅ Expected Build Output

When successful, you'll see:

```
[Building]
Running "npm install"
...
Running "npm run build"
vite v7.2.4 building for production...
✓ 2127 modules transformed.
✓ built in 17.48s
[Success] Build completed
```

## 🎉 After Successful Deployment

1. Visit your Vercel URL
2. Check browser console for errors
3. Test authentication (Supabase)
4. Test API calls (if backend deployed)
5. Test all major features

---

**Status:** ✅ READY TO DEPLOY  
**Method:** Configure via Vercel Dashboard (not vercel.json)  
**Root Directory:** `Frontend` ← Most important setting!
