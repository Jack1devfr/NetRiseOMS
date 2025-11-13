# Render Deployment Guide

Step-by-step guide to deploy your Message App on Render.

## Prerequisites

- Your code pushed to GitHub: `https://github.com/Jack1devfr/NetRiseOMS`
- A Render account (free tier available)

## Step-by-Step Deployment

### 1. Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign Up"**
3. Sign up with GitHub (easiest - connects automatically)

### 2. Create New Web Service

1. After logging in, click **"New +"** in the top right
2. Select **"Web Service"**
3. Click **"Connect account"** next to GitHub
4. Authorize Render to access your GitHub repositories

### 3. Select Your Repository

1. Find and select: **`Jack1devfr/NetRiseOMS`**
2. Click **"Connect"**

### 4. Configure Your Service

Render will auto-fill most settings, but verify:

**Basic Settings:**
- **Name:** `netrise-oms` (or any name you like)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** Leave empty (or `/`)

**Build & Deploy:**
- **Environment:** `Node`
- **Build Command:** `npm run install-all && npm run build`
- **Start Command:** `npm start`

### 5. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

**Required:**
- `NODE_ENV` = `production`

**After Render gives you a URL, add:**
- `ALLOWED_ORIGINS` = `https://your-app-name.onrender.com`
  (Replace with your actual Render URL - you'll get this after first deploy)

**Optional (if frontend needs it):**
- `VITE_API_URL` = `https://your-app-name.onrender.com`
  (Same as your Render URL)

### 6. Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying automatically
3. Watch the build logs - it will show progress
4. When done, you'll get a URL like: `https://netrise-oms.onrender.com`

### 7. Update Environment Variables

After first deployment:

1. Go to your service → **"Environment"** tab
2. Update `ALLOWED_ORIGINS` with your actual Render URL
3. Add `VITE_API_URL` if needed
4. Render will automatically redeploy

## Render Free Tier

- ✅ Free tier available
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Takes ~30 seconds to wake up on first request
- ✅ Perfect for testing and small projects

## Troubleshooting

### Build Fails

- Check build logs in Render dashboard
- Make sure `package.json` has all dependencies
- Verify `npm run install-all` works locally

### App Won't Start

- Check the "Logs" tab in Render
- Verify `NODE_ENV=production` is set
- Make sure `ALLOWED_ORIGINS` includes your Render URL

### WebSocket Not Working

- Render supports WebSockets automatically
- Make sure `VITE_API_URL` is set to your Render URL
- Check that CORS is configured correctly

### App Spins Down

- Free tier apps sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- This is normal for free tier

## Custom Domain (Optional)

1. Go to your service → **"Settings"** → **"Custom Domains"**
2. Add your domain
3. Update `ALLOWED_ORIGINS` with your custom domain

## Auto-Deploy

Render automatically deploys when you push to GitHub:
- Push to `main` branch → Auto-deploys
- No manual deployment needed

Your app should be live on Render! 🚀

