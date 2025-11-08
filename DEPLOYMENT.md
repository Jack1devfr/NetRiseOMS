# Deployment Guide

This guide covers multiple deployment options for the Message App.

## Option 1: Render (Recommended - Easiest)

Render can host both frontend and backend together.

### Steps:

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Select "Web Service"
   - Use these settings:
     - **Build Command:** `npm run install-all && npm run build`
     - **Start Command:** `npm start`
     - **Environment:** Node

3. **Set Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (or leave default)
   - `ALLOWED_ORIGINS` = `https://your-app-name.onrender.com` (update with your actual URL)

4. **Deploy!** Render will automatically build and deploy your app.

Your app will be available at `https://your-app-name.onrender.com`

---

## Option 2: Vercel (Frontend) + Render/Railway (Backend)

### Deploy Backend First:

#### Using Render:
1. Create a new Web Service on Render
2. **Build Command:** `npm install`
3. **Start Command:** `node server/index.js`
4. **Root Directory:** Leave empty (or set to root)
5. Set environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app` (you'll update this after deploying frontend)

#### Using Railway:
1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Railway auto-detects Node.js
4. Set environment variables (same as Render)
5. Deploy

### Deploy Frontend to Vercel:

1. **Create Vercel account** at [vercel.com](https://vercel.com)

2. **Import your GitHub repository**

3. **Configure project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Set Environment Variable:**
   - `VITE_API_URL` = `https://your-backend-url.onrender.com` (or your Railway URL)

5. **Deploy!**

6. **Update Backend CORS:**
   - Go back to your backend service
   - Update `ALLOWED_ORIGINS` to include your Vercel URL: `https://your-app.vercel.app`

---

## Option 3: Docker Deployment

### Build and Run Locally:

```bash
# Build the image
docker build -t message-app .

# Run the container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e ALLOWED_ORIGINS=http://localhost:3001 \
  message-app
```

### Deploy to Docker Hosting:

**Fly.io:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch`
3. Set environment variables
4. Deploy: `fly deploy`

**DigitalOcean App Platform:**
1. Connect GitHub repository
2. Select Dockerfile
3. Set environment variables
4. Deploy

---

## Option 4: Heroku

1. **Install Heroku CLI** and login
2. **Create app:** `heroku create your-app-name`
3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
   ```
4. **Deploy:** `git push heroku main`

Note: Heroku now requires a paid plan for most features.

---

## Environment Variables Reference

### Backend (Server):
- `NODE_ENV` - Set to `production` for production
- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs
  - Example: `https://myapp.vercel.app,https://myapp.onrender.com`

### Frontend (Client):
- `VITE_API_URL` - Backend API URL
  - Example: `https://my-backend.onrender.com`
  - If not set, defaults to `http://localhost:3001`

---

## Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend environment variable `VITE_API_URL` points to backend
- [ ] Backend `ALLOWED_ORIGINS` includes frontend URL
- [ ] Test user registration
- [ ] Test login
- [ ] Test sending messages
- [ ] Test group creation
- [ ] Verify WebSocket connections work (check browser console)

---

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` includes your frontend URL exactly (with https://)
- Check that credentials are enabled in CORS config

### WebSocket Connection Issues
- Verify `VITE_API_URL` is set correctly in frontend
- Check that backend URL uses `wss://` for secure connections (HTTPS)
- Some platforms require specific WebSocket configuration

### Build Failures
- Ensure all dependencies are in `package.json` (not just `devDependencies`)
- Check Node.js version compatibility (requires Node 18+)

### Static Files Not Serving
- Verify build output directory is correct
- Check that server is configured to serve static files in production

---

## Quick Start Commands

```bash
# Install all dependencies
npm run install-all

# Build for production
npm run build

# Start production server
npm start

# Development mode
npm run dev
```

