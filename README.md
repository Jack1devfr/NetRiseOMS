# Full-Stack Real-Time Message App

A modern, real-time messaging application built with React and Node.js, featuring one-on-one chats, group messaging, and real-time updates.

## Features

- **User Authentication**: Register and login system with secure password hashing
- **Real-Time Messaging**: Instant message delivery using WebSockets (Socket.io)
- **Private Chats**: One-on-one messaging between users
- **Group Chats**: Create and participate in group conversations
- **Online Status**: See which users are currently online
- **Modern UI**: Beautiful, responsive interface with gradient designs

## Technology Stack

### Backend
- Node.js with Express
- Socket.io for real-time communication
- bcrypt for password hashing
- In-memory storage (no database required)

### Frontend
- React 18
- Vite for fast development
- Socket.io-client for real-time updates
- Modern CSS with responsive design

## Installation

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install client dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the convenience script:
   ```bash
   npm run install-all
   ```

## Running the Application

### Development Mode (Recommended)

Run both server and client concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend client on `http://localhost:5173`

### Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Start chatting:
   - Click on a user in the chat list to start a private conversation
   - Click "New Group" to create a group chat and add members
   - Send messages in real-time!

## Deployment

### Deploying to Render (Recommended)

Render is a free platform for deploying Node.js applications. Here's how to deploy:

#### Step 1: Push to GitHub

Your code is already on GitHub at: `https://github.com/Jack1devfr/NetRiseOMS`

If you need to push updates:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

#### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (connects automatically)

#### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** next to GitHub
3. Authorize Render to access your repositories
4. Select: **`Jack1devfr/NetRiseOMS`**

#### Step 4: Configure Service

**Settings:**
- **Name:** `netrise-oms` (or any name)
- **Environment:** `Node`
- **Region:** Choose closest to you
- **Branch:** `main`

**Build & Deploy:**
- **Build Command:** `npm run install-all && npm run build`
- **Start Command:** `npm start`

#### Step 5: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

- `NODE_ENV` = `production`

**After Render gives you a URL (after first deploy), add:**
- `ALLOWED_ORIGINS` = `https://your-app-name.onrender.com` (your Render URL)
- `VITE_API_URL` = `https://your-app-name.onrender.com` (same URL)

#### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. You'll get a URL like: `https://netrise-oms.onrender.com`
4. Update environment variables with your actual URL

**Render Features:**
- ✅ Free tier available (750 hours/month)
- ✅ Auto-deploys from GitHub
- ✅ Supports WebSockets
- ✅ Builds React frontend automatically
- ⚠️ Free tier spins down after 15 min inactivity (wakes on first request)

### Detailed Guide

See `RENDER_DEPLOY.md` for complete step-by-step instructions with troubleshooting.

### Other Platforms

See `RAILWAY_DEPLOY.md` for Railway instructions (note: Railway free tier only allows databases).

## Project Structure

```
/
├── server/
│   ├── index.js          # Express server + Socket.io setup
│   └── routes/
│       └── auth.js       # Authentication endpoints
├── client/
│   ├── src/
│   │   ├── App.jsx      # Main app component
│   │   ├── components/  # React components
│   │   │   ├── Login.jsx
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── MessageInput.jsx
│   │   └── utils/
│   │       ├── socket.js # Socket.io client setup
│   │       └── api.js    # API configuration
│   └── package.json
├── package.json
└── README.md
```

## Notes

- Messages are stored in-memory and will be lost when the server restarts
- Sessions are maintained in localStorage on the client side
- The app uses WebSockets for real-time communication
- All passwords are hashed using bcrypt before storage

## Future Enhancements

- Persistent database storage (MongoDB/PostgreSQL)
- File/image sharing
- Message reactions and emojis
- Typing indicators
- Message search functionality
- User profiles and avatars

