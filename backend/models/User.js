const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: true
  },
  firebaseUid: {
    type: String,
    sparse: true,
    index: true
  },
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
