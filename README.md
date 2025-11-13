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

### Deploying to Railway (Recommended)

Railway is a simple platform for deploying Node.js applications. Here's how to deploy:

#### Step 1: Push to GitLab/GitHub

Make sure your code is pushed to GitLab or GitHub:
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

#### Step 2: Import to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up or log in (free tier available)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"** or **"Deploy from GitLab repo"**
5. Authorize Railway to access your repository
6. Select your repository (`NetRiseOMS` or your repo name)
7. Railway will automatically detect Node.js and start deploying

#### Step 3: Configure Environment Variables

After deployment starts, go to your project settings:

1. Click on your service
2. Go to **"Variables"** tab
3. Add these environment variables:
   - `NODE_ENV` = `production`
   - `ALLOWED_ORIGINS` = `https://your-app-name.up.railway.app` (Railway will show your URL)
   - `PORT` = Railway sets this automatically (usually `3000` or `$PORT`)

#### Step 4: Get Your App URL

1. Railway will generate a URL like: `https://your-app-name.up.railway.app`
2. Update the `ALLOWED_ORIGINS` variable with this URL
3. Your app should be live!

#### Step 5: Update Frontend API URL (if needed)

If your frontend can't connect, you may need to rebuild with the Railway URL:

1. In Railway, go to **Settings** → **Variables**
2. Add: `VITE_API_URL` = `https://your-app-name.up.railway.app`
3. Redeploy (Railway will rebuild automatically)

**Railway Auto-Detection:**
- Railway automatically detects Node.js from `package.json`
- Uses `npm start` command to run your app
- Builds your React frontend automatically
- Supports WebSockets out of the box

### Other Platforms

See `DEPLOYMENT.md` for detailed deployment instructions for Render, Vercel, and other platforms.

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

