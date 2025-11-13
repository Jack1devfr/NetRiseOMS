  const express = require('express');
  const bcrypt = require('bcrypt');
  const router = express.Router();

  // Register new user
  router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (req.app.locals.users.has(username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      req.app.locals.users.set(username, {
        id: userId,
        password: hashedPassword,
        username: username,
        profilePicture: null,
        bannedUntil: null,
        deviceBanned: false,
        reports: []
      });

      res.status(201).json({ message: 'User registered successfully', username });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Login user
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = req.app.locals.users.get(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      req.app.locals.sessions.set(sessionId, username);

      res.json({
        message: 'Login successful',
        sessionId,
        username
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout user
  router.post('/logout', (req, res) => {
    const { sessionId } = req.body;
    
    if (sessionId && req.app.locals.sessions.has(sessionId)) {
      req.app.locals.sessions.delete(sessionId);
    }

    res.json({ message: 'Logout successful' });
  });

  // Verify session
  router.get('/verify', (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const username = req.app.locals.sessions.get(sessionId);
    res.json({ username, valid: true });
  });

  // Update profile picture
  router.put('/profile/picture', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { profilePicture } = req.body; // Base64 image data

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const username = req.app.locals.sessions.get(sessionId);
      const user = req.app.locals.users.get(username);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update profile picture (store as base64)
      user.profilePicture = profilePicture || null;
      req.app.locals.users.set(username, user);

      res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
    } catch (error) {
      console.error('Update profile picture error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user profile
  router.get('/profile', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { username } = req.query;

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const targetUsername = username || req.app.locals.sessions.get(sessionId);
      const user = req.app.locals.users.get(targetUsername);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const loggedInUser = req.app.locals.sessions.get(sessionId);
      const isAdmin = loggedInUser === 'Jack_dev' || loggedInUser === 'jack_dev';
      const isOwnProfile = loggedInUser === targetUsername;

      res.json({
        username: user.username,
        profilePicture: user.profilePicture,
        bannedUntil: isAdmin || isOwnProfile ? user.bannedUntil : null,
        deviceBanned: isAdmin ? user.deviceBanned : false,
        reports: isAdmin ? user.reports : []
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Report user
  router.post('/report', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { reportedUsername, reason } = req.body;

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const reporterUsername = req.app.locals.sessions.get(sessionId);

      if (!reportedUsername || !reason) {
        return res.status(400).json({ error: 'Reported username and reason are required' });
      }

      if (reporterUsername === reportedUsername) {
        return res.status(400).json({ error: 'Cannot report yourself' });
      }

      const reportedUser = req.app.locals.users.get(reportedUsername);
      if (!reportedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add report
      if (!reportedUser.reports) {
        reportedUser.reports = [];
      }
      reportedUser.reports.push({
        reportedBy: reporterUsername,
        reason: reason,
        timestamp: new Date().toISOString()
      });

      req.app.locals.users.set(reportedUsername, reportedUser);

      res.json({ message: 'User reported successfully' });
    } catch (error) {
      console.error('Report user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Ban user (admin only)
  router.post('/ban', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { targetUsername, banDuration, deviceBan } = req.body; // banDuration in hours, null for permanent

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const adminUsername = req.app.locals.sessions.get(sessionId);
      const isAdmin = adminUsername === 'Jack_dev' || adminUsername === 'jack_dev';

      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const user = req.app.locals.users.get(targetUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (banDuration) {
        // Temp ban
        const banUntil = new Date();
        banUntil.setHours(banUntil.getHours() + banDuration);
        user.bannedUntil = banUntil.toISOString();
      } else {
        // Permanent ban
        user.bannedUntil = null; // null means permanently banned
      }

      if (deviceBan) {
        user.deviceBanned = true;
      }

      req.app.locals.users.set(targetUsername, user);

      // Disconnect user if online
      req.app.locals.onlineUsers?.delete(targetUsername);

      res.json({ message: 'User banned successfully', bannedUntil: user.bannedUntil });
    } catch (error) {
      console.error('Ban user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Unban user (admin only)
  router.post('/unban', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { targetUsername } = req.body;

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const adminUsername = req.app.locals.sessions.get(sessionId);
      const isAdmin = adminUsername === 'Jack_dev' || adminUsername === 'jack_dev';

      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const user = req.app.locals.users.get(targetUsername);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.bannedUntil = null;
      user.deviceBanned = false;

      req.app.locals.users.set(targetUsername, user);

      res.json({ message: 'User unbanned successfully' });
    } catch (error) {
      console.error('Unban user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all users (admin only)
  router.get('/users', (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const adminUsername = req.app.locals.sessions.get(sessionId);
      const isAdmin = adminUsername === 'Jack_dev' || adminUsername === 'jack_dev';

      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const allUsers = Array.from(req.app.locals.users.entries()).map(([username, user]) => ({
        username: user.username,
        profilePicture: user.profilePicture,
        bannedUntil: user.bannedUntil,
        deviceBanned: user.deviceBanned,
        reports: user.reports || []
      }));

      res.json({ users: allUsers });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete account
  router.delete('/account', async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      const { targetUsername } = req.body; // Username to delete
      const { username: currentUsername } = req.query; // Current user from query

      if (!sessionId || !req.app.locals.sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const loggedInUser = req.app.locals.sessions.get(sessionId);
      const isAdmin = loggedInUser === 'Jack_dev' || loggedInUser === 'jack_dev';
      const isSelf = loggedInUser === targetUsername || loggedInUser === currentUsername;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({ error: 'Not authorized to delete this account' });
      }

      const usernameToDelete = targetUsername || currentUsername || loggedInUser;

      if (!req.app.locals.users.has(usernameToDelete)) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete user
      req.app.locals.users.delete(usernameToDelete);

      // Delete all sessions for this user
      for (const [sid, uname] of req.app.locals.sessions.entries()) {
        if (uname === usernameToDelete) {
          req.app.locals.sessions.delete(sid);
        }
      }

      // Remove from online users
      req.app.locals.onlineUsers?.delete(usernameToDelete);

      // Delete all messages involving this user
      for (const [chatId, chatMessages] of req.app.locals.messages.entries()) {
        req.app.locals.messages.set(chatId, chatMessages.filter(msg => msg.sender !== usernameToDelete));
      }

      // Remove from groups
      for (const [groupId, group] of req.app.locals.groups.entries()) {
        if (group.members.includes(usernameToDelete)) {
          group.members = group.members.filter(m => m !== usernameToDelete);
          if (group.members.length === 0) {
            req.app.locals.groups.delete(groupId);
          }
        }
      }

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = router;

