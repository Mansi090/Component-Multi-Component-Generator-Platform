const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
    lowercase: true,
    trim: true
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionName: { type: String, required: true },
  chatHistory: [ChatMessageSchema],
  jsxCode: { type: String, default: '' },
  cssCode: { type: String, default: '' },
}, { timestamps: true });

SessionSchema.index({ userId: 1, createdAt: -1 });

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;
