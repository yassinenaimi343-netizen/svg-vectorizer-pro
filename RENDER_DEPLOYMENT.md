# Render.com Deployment Guide

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: https://github.com/yassinenaimi343-netizen/svg-bulk-vectorizer
- ✅ Render configuration file added (`render.yaml`)

## 🚀 Deploy to Render (Quick & Easy)

### Method 1: One-Click Deploy via render.yaml (Fastest!)

1. **Go to**: https://dashboard.render.com/select-repo?type=web
2. **Click**: "Connect account" (if not already connected)
3. **Authorize**: Render to access your GitHub repositories
4. **Select**: `yassinenaimi343-netizen/svg-bulk-vectorizer`
5. **Render will auto-detect** the `render.yaml` file and configure everything automatically!
6. **Click**: "Apply" to deploy

That's it! Render will:
- ✅ Auto-detect the configuration from `render.yaml`
- ✅ Set up environment variables (NODE_ENV, PORT)
- ✅ Build with `pnpm install && pnpm build`
- ✅ Start with `pnpm start`
- ✅ Assign you a free `.onrender.com` URL

---

### Method 2: Manual Setup (Alternative)

If you prefer manual setup:

1. **Go to**: https://dashboard.render.com/
2. **Click**: "New +" → "Web Service"
3. **Connect GitHub** and select: `yassinenaimi343-netizen/svg-bulk-vectorizer`
4. **Fill in the details**:

   ```
   Name: svg-bulk-vectorizer
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: pnpm install --frozen-lockfile && pnpm build
   Start Command: pnpm start
   Instance Type: Free
   ```

5. **Add Environment Variables**:
   - Click "Advanced"
   - Add: `NODE_ENV = production`
   - Add: `PORT = 3000`

6. **Click**: "Create Web Service"

---

## 🌐 Your Live URL

After deployment (takes 2-5 minutes), your app will be live at:
```
https://svg-bulk-vectorizer.onrender.com
```
(or similar - check your Render dashboard for exact URL)

---

## 📊 What Gets Deployed

✅ Clean minimalist UI with emerald accents  
✅ Background removal toggle feature  
✅ Bulk upload support (up to 250 images)  
✅ Client-side SVG conversion (Potrace WASM)  
✅ ZIP download functionality  
✅ No GPL license references  

---

## 🔧 Optional Environment Variables

For full functionality with database/auth (optional):

```bash
# Database
DATABASE_URL=<your-postgres-url>

# Authentication
JWT_SECRET=<random-secret-string>
OAUTH_SERVER_URL=<your-oauth-server>

# Stripe (if needed)
STRIPE_SECRET_KEY=<your-key>
```

**Note**: The SVG conversion happens entirely client-side, so these are optional!

---

## 🔍 Troubleshooting

### Build Fails
- Check that `pnpm` is used (not `npm`)
- Verify build logs in Render dashboard

### App Returns 502
- Wait 2-3 minutes for deployment to complete
- Check logs for startup errors

### Free Tier Spins Down
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds

---

## ✨ Deployment Complete!

Once deployed, test your app:
1. Upload an image
2. Toggle "Remove Background" on/off
3. Convert and download SVG
4. Test bulk upload with multiple images

Enjoy your new minimalist SVG vectorizer! 🎉
