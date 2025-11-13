const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS configuration
// In production, allow requests from the same origin (since frontend is served from same server)
// In development, allow localhost
const isProduction = process.env.NODE_ENV === 'production';
const defaultOrigins = isProduction ? ['*'] : ['http://localhost:5173'];
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : defaultOrigins;

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
  const fs = require('fs');
  // Try multiple possible paths for the built frontend
  // Render uses /opt/render/project/src/ as base, so paths are relative to that
  const distPath1 = path.join(__dirname, '../client/dist');
  const distPath2 = path.join(process.cwd(), 'client/dist');
  const distPath3 = path.join(process.cwd(), 'dist');
  const distPath4 = path.join(process.cwd(), 'src/client/dist'); // Render's structure
  const distPath5 = '/opt/render/project/src/client/dist'; // Render absolute path
  
  console.log('Looking for frontend build...');
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('Checking paths:');
  console.log('  Path 1:', distPath1, 'exists:', fs.existsSync(distPath1));
  console.log('  Path 2:', distPath2, 'exists:', fs.existsSync(distPath2));
  console.log('  Path 3:', distPath3, 'exists:', fs.existsSync(distPath3));
  console.log('  Path 4:', distPath4, 'exists:', fs.existsSync(distPath4));
  console.log('  Path 5:', distPath5, 'exists:', fs.existsSync(distPath5));
  
  // Find which path exists
  let staticPath = null;
  const paths = [distPath1, distPath2, distPath3, distPath4, distPath5];
  for (let i = 0; i < paths.length; i++) {
    if (fs.existsSync(paths[i])) {
      staticPath = paths[i];
      console.log(`Using path ${i + 1}:`, staticPath);
      break;
    }
  }
  
  if (staticPath && fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log('Static files serving from:', staticPath);
    
    app.get('*', (req, res) => {
      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error('index.html not found at:', indexPath);
        res.status(500).send('Frontend index.html not found.');
      }
    });
  } else {
    console.error('Frontend build directory not found!');
    console.error('Tried paths:', paths);
    app.get('*', (req, res) => {
      res.status(500).send('Frontend build not found. Please ensure build completed successfully. Check build logs.');
    });
  }
}

// Routes
app.use('/api/auth', authRoutes);

// In-memory storage
const users = new Map(); // username -> { password, id, profilePicture }
const sessions = new Map(); // sessionId -> username
const messages = new Map(); // chatId -> [{ id, sender, message, timestamp }]
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

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
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

  // Handle deleting a message
  socket.on('deleteMessage', ({ chatId, messageId }) => {
    if (!socket.username) return;

    const chatMessages = messages.get(chatId);
    if (!chatMessages) return;

    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const message = chatMessages[messageIndex];
    // Only allow deleting own messages
    if (message.sender !== socket.username) return;

    // Remove message
    chatMessages.splice(messageIndex, 1);
    messages.set(chatId, chatMessages);

    // Notify all users in chat
    io.to(`chat:${chatId}`).emit('messageDeleted', { chatId, messageId });
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
    // Ensure all messages have IDs for deletion
    const messagesWithIds = chatMessages.map(msg => ({
      ...msg,
      id: msg.id || `msg_${msg.timestamp}_${Math.random().toString(36).substr(2, 9)}`
    }));
    socket.emit('chatHistory', { chatId, messages: messagesWithIds });
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
const HOST = '0.0.0.0'; // Required for Render - bind to all network interfaces
server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
