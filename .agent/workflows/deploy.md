---
description: how to deploy changes to Vercel and Inngest
---

To deploy your new **Watchlist** changes to Vercel and sync them with Inngest, follow these steps:

### 1. Push to GitHub (Recommended)
If your Vercel project is connected to a GitHub repository, simply push your local changes:
```bash
git add .
git commit -m "Add watchlist feature and fix build errors"
git push origin main
```
*Vercel will automatically detect the push and start a new build.*

### 2. Manual Deployment (Vercel CLI)
If you are not using Git integration, you can use the Vercel CLI:
```bash
vercel --prod
```

### 3. Syncing Inngest Functions
Inngest functions are served via your API route (likely `https://your-app.vercel.app/api/inngest`). 
- **Automatic**: When Vercel finishes the deployment, Inngest usually detects the new code automatically if you have configured the **Inngest Webhook** in Vercel settings.
- **Manual**: If they don't sync, go to your [Inngest Cloud Dashboard](https://app.inngest.com/), select your app, and click **"Sync"** or **"Refresh"** to force it to pull the latest metadata from your live Vercel URL.

### 4. Verification
Once deployed:
1. Visit your live site.
2. Go to the `/watchlist` page to ensure it loads.
3. Test adding a stock from the search bar to confirm the **Server Actions** are working in the production environment.
