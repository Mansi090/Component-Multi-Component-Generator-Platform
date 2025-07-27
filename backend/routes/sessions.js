const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// 🔒 Middleware to verify JWT and extract user ID
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// 📥 Create a new session
router.post('/', authenticate, async (req, res) => {
  const { sessionName } = req.body;

  if (!sessionName) {
    return res.status(400).json({ error: 'Session name is required' });
  }

  try {
    const newSession = new Session({
      userId: req.userId,
      sessionName,
      chatHistory: [],
      jsxCode: '',
      cssCode: '',
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// 📤 Get all sessions for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// 📄 Get a specific session by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// 🛠️ Update an existing session
router.put('/:id', authenticate, async (req, res) => {
  const { chatHistory, jsxCode, cssCode } = req.body;

  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        chatHistory,
        jsxCode,
        cssCode,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

module.exports = router;
