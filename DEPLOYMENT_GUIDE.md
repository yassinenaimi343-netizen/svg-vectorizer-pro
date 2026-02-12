# Deployment Guide - SVG Vectorizer Pro

## 🚂 Railway Deployment (Recommended)

### Step 1: Prepare Your Repository

1. **Create a new GitHub repository**
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit changes
   git commit -m "Initial commit - SVG Vectorizer Pro"
   
   # Create a new repository on GitHub
   # Then connect it:
   git remote add origin https://github.com/YOUR_USERNAME/svg-vectorizer-pro.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Click "Start a New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** (svg-vectorizer-pro)
5. **Configure settings**:
   - Railway will auto-detect Node.js
   - Build command: `pnpm build`
   - Start command: `pnpm start`
   - No additional environment variables needed!

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live!

### Step 3: Custom Domain (Optional)

1. Go to your Railway project settings
2. Click "Domains"
3. Click "Generate Domain" for a free railway.app domain
4. Or add your custom domain

## 🌐 Alternative Deployment Options

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Render

1. Create a new "Web Service" on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create svg-vectorizer-pro

# Deploy
git push heroku main
```

## 🔧 Environment Variables

The app works out of the box without any required environment variables. Optional:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

## 🏗️ Build Configuration

### Railway Configuration

The `railway.json` file is already configured:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Nixpacks Configuration

The `nixpacks.toml` file configures the build:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "pnpm start"
```

## ✅ Pre-Deployment Checklist

- [ ] All changes committed to git
- [ ] Repository pushed to GitHub
- [ ] Dependencies installed (`pnpm install`)
- [ ] Build successful (`pnpm build`)
- [ ] Local test passed (`pnpm dev`)
- [ ] README updated
- [ ] License file included

## 🔍 Troubleshooting

### Build Fails

1. Check Node.js version (requires 18+)
2. Verify all dependencies in `package.json`
3. Run `pnpm build` locally to reproduce

### Port Already in Use

The app automatically finds an available port if 3000 is busy.

### WASM Module Errors

Ensure your hosting platform supports WebAssembly. All major platforms do.

## 📊 Monitoring

After deployment:
- Check Railway logs for errors
- Monitor memory usage (should be ~500MB)
- Test with multiple file uploads
- Verify SVG output quality

## 🎉 Success!

Your SVG Vectorizer Pro should now be live!

Test URL formats:
- Railway: `https://your-app-name.up.railway.app`
- Vercel: `https://your-app-name.vercel.app`
- Render: `https://your-app-name.onrender.com`

---

Need help? Open an issue on GitHub!
