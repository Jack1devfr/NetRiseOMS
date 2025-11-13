# Railway Deployment Guide

Step-by-step guide to deploy your Message App on Railway.

## Prerequisites

- Your code pushed to GitLab or GitHub
- A Railway account (free tier available)

## Step-by-Step Deployment

### 1. Push Your Code to Git

Make sure all your files are committed and pushed:

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with GitHub or GitLab (easiest way)

### 3. Import Your Repository

1. After logging in, click **"New Project"**
2. Select **"Deploy from GitHub repo"** or **"Deploy from GitLab repo"**
3. Authorize Railway to access your repositories
4. Find and select your `NetRiseOMS` repository
5. Click on it to start deployment

### 4. Skip Database (You Don't Need One)

When Railway asks about databases:
- Click **"Skip"** or **"Continue"**
- Your app uses in-memory storage, no database needed

### 5. Configure Environment Variables

1. Click on your deployed service
2. Go to the **"Variables"** tab
3. Add these variables:

   **Required:**
   - `NODE_ENV` = `production`
   
   **After Railway gives you a URL, add:**
   - `ALLOWED_ORIGINS` = `https://your-app-name.up.railway.app`
     (Replace with your actual Railway URL)

   **Optional (if frontend needs it):**
   - `VITE_API_URL` = `https://your-app-name.up.railway.app`
     (Same as your Railway URL)

### 6. Get Your App URL

1. Railway will show you a URL like: `https://your-app-name.up.railway.app`
2. Copy this URL
3. Update `ALLOWED_ORIGINS` variable with this URL
4. Your app should be live!

### 7. Verify Deployment

1. Open your Railway URL in a browser
2. You should see the login page
3. Try registering a new user
4. Test sending messages

## Railway Auto-Detection

Railway automatically:
- ✅ Detects Node.js from `package.json`
- ✅ Runs `npm install` to install dependencies
- ✅ Runs `npm run build` (from your build script)
- ✅ Runs `npm start` to start your server
- ✅ Supports WebSocket connections
- ✅ Assigns a public URL automatically

## Troubleshooting

### Build Fails

- Check Railway logs: Click on your service → "Deployments" → View logs
- Make sure `package.json` has all dependencies listed
- Verify `npm run install-all` works locally

### App Won't Start

- Check the "Logs" tab in Railway
- Verify `NODE_ENV=production` is set
- Make sure `ALLOWED_ORIGINS` includes your Railway URL

### WebSocket Not Working

- Railway supports WebSockets automatically
- Make sure `VITE_API_URL` is set to your Railway URL (if using separate frontend)
- Check that CORS is configured correctly

### Frontend Can't Connect to Backend

- Set `VITE_API_URL` environment variable to your Railway URL
- Railway will rebuild automatically when you add variables
- Make sure `ALLOWED_ORIGINS` includes your frontend URL

## Railway Free Tier

- $5 credit per month (usually enough for small apps)
- No credit card required
- Auto-sleeps after inactivity (wakes on first request)
- Perfect for testing and small projects

## Custom Domain (Optional)

1. Go to your service → "Settings" → "Networking"
2. Click "Generate Domain" or add custom domain
3. Update `ALLOWED_ORIGINS` with your custom domain

## Need Help?

- Check Railway logs for error messages
- Railway documentation: https://docs.railway.app
- Make sure all files are pushed to Git

Your app should be live on Railway! 🚀

