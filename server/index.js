const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);

// In-memory storage
const users = new Map(); // username -> { password, id }
const sessions = new Map(); // sessionId -> username
const messages = new Map(); // chatId -> [{ sender, message, timestamp }]
const groups = new Map(); // groupId -> { name, members: [usernames] }
const onlineUsers = new Set(); // Set of usernames

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login via socket
  socket.on('login', ({ username, sessionId }) => {
    if (sessions.has(sessionId) && sessions.get(sessionId) === username) {
      socket.username = username;
      socket.join(`user:${username}`);
      onlineUsers.add(username);
      
      // Notify others that user is online
      socket.broadcast.emit('userOnline', username);
      
      // Send current online users to the newly connected user
      socket.emit('onlineUsers', Array.from(onlineUsers));
    }
  });

  // Handle joining a chat (private or group)
  socket.on('joinChat', ({ chatId, chatType }) => {
    socket.join(`chat:${chatId}`);
    if (chatType === 'group') {
      socket.join(`group:${chatId}`);
    }
  });

  // Handle leaving a chat
  socket.on('leaveChat', ({ chatId }) => {
    socket.leave(`chat:${chatId}`);
    socket.leave(`group:${chatId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', ({ chatId, chatType, message }) => {
    if (!socket.username) return;

    const messageData = {
      sender: socket.username,
      message: message,
      timestamp: new Date().toISOString()
    };

    // Store message in memory
    if (!messages.has(chatId)) {
      messages.set(chatId, []);
    }
    messages.get(chatId).push(messageData);

    // Emit to all users in the chat
    io.to(`chat:${chatId}`).emit('receiveMessage', {
      chatId,
      chatType,
      ...messageData
    });
  });

  // Handle creating a group
  socket.on('createGroup', ({ groupName, members }) => {
    if (!socket.username) return;

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const group = {
      id: groupId,
      name: groupName,
      members: [socket.username, ...members],
      createdBy: socket.username
    };
    groups.set(groupId, group);

    // Add all members to the group chat room
    group.members.forEach(member => {
      io.to(`user:${member}`).emit('groupCreated', group);
    });

    socket.emit('groupCreated', group);
  });

  // Handle requesting chat history
  socket.on('getChatHistory', ({ chatId }) => {
    const chatMessages = messages.get(chatId) || [];
    socket.emit('chatHistory', { chatId, messages: chatMessages });
  });

  // Handle requesting user's groups
  socket.on('getMyGroups', () => {
    if (!socket.username) return;
    const userGroups = Array.from(groups.values()).filter(group =>
      group.members.includes(socket.username)
    );
    socket.emit('myGroups', userGroups);
  });

  // Handle requesting available users for private chat
  socket.on('getAvailableUsers', () => {
    const availableUsers = Array.from(users.keys()).filter(
      username => username !== socket.username
    );
    socket.emit('availableUsers', availableUsers);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      socket.broadcast.emit('userOffline', socket.username);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make storage accessible to routes
app.locals.users = users;
app.locals.sessions = sessions;
app.locals.messages = messages;
app.locals.groups = groups;
app.locals.onlineUsers = onlineUsers;

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
