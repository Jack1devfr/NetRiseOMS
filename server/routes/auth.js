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
      username: username
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

module.exports = router;

