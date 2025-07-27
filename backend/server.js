// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ FIXED CORS: allow localhost, main domain, all *.vercel.app
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || // allow server-to-server, curl, etc.
      origin === 'http://localhost:3000' ||
      origin === 'https://component-multi-component-generator-zeta.vercel.app' ||
      /\.vercel\.app$/.test(origin) // allow any preview Vercel domain
    ) {
      callback(null, true);
    } else {
      console.error('CORS blocked for:', origin);
      callback(new Error('CORS error: Not allowed origin'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// ✅ Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const generateRoutes = require('./routes/generate');

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/generate', generateRoutes);

// ✅ Fallback for `/`
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
