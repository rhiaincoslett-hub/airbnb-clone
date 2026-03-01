const mongoose = require('mongoose');

/**
 * User schema for authentication and role-based access.
 * Passwords are stored hashed via bcrypt.
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'host'], default: 'user' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
