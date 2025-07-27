const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Initialize Firebase Admin SDK (safe way)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, useFirebase } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const normalizedEmail = email.toLowerCase();

  try {
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    user = new User({ email: normalizedEmail, passwordHash });
    await user.save();

    if (useFirebase) {
      try {
        await admin.auth().createUser({ email: normalizedEmail, password });
      } catch (e) {
        if (e.code !== 'auth/email-already-exists') {
          console.error("Firebase error:", e.message);
        }
      }
    }

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, useFirebase } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (useFirebase) {
      try {
        await admin.auth().getUserByEmail(normalizedEmail);
      } catch (e) {
        return res.status(401).json({ error: 'Not a Firebase user' });
      }
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, email: user.email, userId: user._id });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
