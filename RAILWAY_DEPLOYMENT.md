# Railway Deployment Guide

This guide walks you through deploying SVG Bulk Vectorizer to Railway with MySQL database, Stripe integration, and custom domain support.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository (already connected)
- Stripe account with API keys
- Custom domain (optional but recommended)

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub account
5. Select your `svg-bulk-vectorizer` repository
6. Click "Deploy"

Railway will automatically detect it's a Node.js project and start building.

## Step 2: Add MySQL Database

1. In your Railway project dashboard, click "Add Service"
2. Select "MySQL"
3. Railway will provision a MySQL database automatically
4. Copy the connection string from the MySQL service details

## Step 3: Configure Environment Variables

In your Railway project, go to **Variables** and add:

### Required Variables

```
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Node Environment
NODE_ENV=production

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OAuth (set up your own OAuth provider or use Manus OAuth)
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your_jwt_secret_key

# App Info
VITE_APP_TITLE=SVG Bulk Vectorizer
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id
```

### Optional Variables

```
# Analytics (if using Manus analytics)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# File Storage (if using S3)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

## Step 4: Run Database Migrations

1. In Railway dashboard, click on your project
2. Go to the "Deployments" tab
3. Click the latest deployment
4. Open the "Logs" tab
5. The migrations should run automatically on first deployment

If migrations don't run automatically, you can manually run:
```bash
pnpm db:push
```

## Step 5: Configure Custom Domain

1. In Railway project dashboard, go to **Settings**
2. Click **Domains**
3. Click **Add Domain**
4. Enter your custom domain (e.g., vectorizer.yourdomain.com)
5. Railway will provide DNS records to add to your domain registrar
6. Add the DNS records to your domain registrar
7. Wait for DNS propagation (usually 5-30 minutes)
8. Railway will automatically provision an SSL certificate

## Step 6: Set Up Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your Railway URL: `https://your-railway-url.railway.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Railway variables

## Step 7: Verify Deployment

1. Open your Railway URL or custom domain in a browser
2. Test the following features:
   - Upload and convert images
   - Download SVG, PDF, AI, EPS, DXF formats
   - Change colors on converted images
   - Bulk operations (change color all, export all formats)
   - Payment/subscription flow (if Stripe configured)

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check MySQL service is running in Railway
- Ensure credentials are correct

### Stripe Not Working
- Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are correct
- Check webhook secret matches in Stripe dashboard
- Look at Railway logs for Stripe API errors

### Images Not Converting
- Check browser console for errors
- Verify Potrace WASM is loading correctly
- Check Railway logs for backend errors

### Custom Domain Not Working
- Wait for DNS propagation (can take 30+ minutes)
- Verify DNS records are added correctly to your domain registrar
- Check Railway domain settings for SSL status

## Scaling & Performance

### For Production Use

1. **Database**: Upgrade to Railway's paid MySQL plan for better performance
2. **Build Optimization**: Railway automatically optimizes Node.js builds
3. **Memory**: Monitor Railway dashboard for memory usage
4. **Monitoring**: Enable Railway's monitoring features

### Recommended Railway Plan

- **Free Tier**: Good for testing (limited resources)
- **Paid Tier**: Recommended for production (better performance, more resources)

## Deployment Checklist

- [ ] GitHub repository connected to Railway
- [ ] MySQL database created and connected
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Stripe webhooks configured
- [ ] Custom domain DNS records added
- [ ] SSL certificate provisioned
- [ ] All features tested on deployed version
- [ ] Monitoring enabled in Railway dashboard

## Support & Resources

- Railway Docs: https://docs.railway.app
- Stripe Docs: https://stripe.com/docs
- Project GitHub: Your repository URL
- Issue Tracker: Your GitHub issues

## Next Steps

1. Monitor your Railway dashboard for performance metrics
2. Set up error tracking (Sentry, Rollbar, etc.)
3. Configure automated backups for MySQL database
4. Set up email notifications for deployment failures
5. Plan for scaling as user base grows
