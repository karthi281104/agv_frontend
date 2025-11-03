# 🔧 CACHE CLEAR & FRESH START GUIDE

## Problem
Browser is serving old bundle (index-RDuKQl1o.js) with hardcoded localhost URLs, even after rebuilding.

## Solution

### Step 1: Clear ALL caches
```powershell
# In your project terminal:
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build
```

### Step 2: Set Railway API URL
Create `.env.local` file in project root:
```env
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

### Step 3: Clear Browser Cache
**Option A: Hard Refresh**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Site Data**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Reload page

**Option C: Use Incognito/Private Window**
- Open new incognito window
- Navigate to your app
- Should load fresh bundle

### Step 4: Verify
In browser DevTools Console, you should see:
```
[apiClient] Base URL: https://your-railway-backend.up.railway.app/api
```

And in Network tab:
- Requests should go to your Railway domain, NOT localhost:3001
- Main bundle should be `index-UCVnoo9L.js` (NOT index-RDuKQl1o.js)

## Quick Runtime Override (No Rebuild Needed)
In browser console:
```javascript
localStorage.setItem('api_base_url', 'https://your-railway-backend.up.railway.app/api');
location.reload();
```

## Still Not Working?
1. Check if you're running dev server vs viewing old dist build
2. Verify .env.local file exists and has correct URL
3. Restart dev server after creating .env.local
4. Use browser's Network tab to confirm which bundle is loaded
