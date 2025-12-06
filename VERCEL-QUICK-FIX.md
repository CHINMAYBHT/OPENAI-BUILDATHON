# ✅ VERCEL DEPLOYMENT - QUICK FIX

## 🎯 THE PROBLEM
You're getting build errors because Vercel needs to be configured through the **Dashboard**, not vercel.json.

## ✅ THE SOLUTION

### In Vercel Dashboard → Settings → General:

**Set Root Directory to:** `Frontend`

That's the most important setting! ⬆️

### Then set:
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: `Vite`

### Add Environment Variables:
```
VITE_SUPABASE_URL=<new-url>
VITE_SUPABASE_ANON_KEY=<new-key>
VITE_GEMINI_API_KEY=<new-key>
VITE_API_BASE_URL=<backend-url>
```

### Deploy:
```bash
git add .
git commit -m "Remove vercel.json - use dashboard config"
git push
```

## 🔑 Key Points

1. **Root Directory = `Frontend`** ← This is critical!
2. Don't use vercel.json for subdirectory projects
3. Configure everything in Vercel Dashboard
4. Use NEW API keys (old ones were exposed)

## 📚 Full Guide
See `VERCEL-DEPLOY-CORRECT.md` for complete instructions.

---

**Status:** ✅ READY  
**Action:** Set Root Directory to `Frontend` in Vercel Dashboard
