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
│   │       └── socket.js # Socket.io client setup
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

