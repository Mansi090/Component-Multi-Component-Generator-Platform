const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ Proper CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://component-multi-component-generator-zeta.vercel.app',
  'https://component-multi-component-generator-platform-7zvlaxia3.vercel.app',
  'https://component-multi-compo-git-da1d98-mansi-dixits-projects-3335e2da.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error: Not allowed origin'));
    }
  },
  credentials: true, // if you're using cookies or sessions
}));

// ✅ JSON parser middleware
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/generate', require('./routes/generate'));

// ✅ Basic health check
app.get('/', (req, res) => {
  res.send('🌐 Backend is live!');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
