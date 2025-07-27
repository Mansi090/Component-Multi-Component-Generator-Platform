// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Final CORS fix: Apply to *all* routes including /generate
const allowedOrigins = [
  'http://localhost:3000',
  'https://component-multi-component-generator-zeta.vercel.app',
  'https://component-multi-compo-git-da1d98-mansi-dixits-projects-3335e2da.vercel.app' // <-- your preview deploy URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error: Not allowed origin'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// ✅ API Routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const generateRoutes = require('./routes/generate');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/generate', generateRoutes);

// ✅ Optional default route (just to avoid "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
