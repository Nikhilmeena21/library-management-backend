const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Trim whitespace
    lowercase: true, // Consider storing usernames in lowercase
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'guest', 'user'], // Example: Restrict roles to a set of allowed values
  },
  // Optional additional fields:
  email: {
    type: String,
    unique: true, // Consider making email unique as well
    trim: true,
    lowercase: true, // Store emails in lowercase
    // Add validation for email format if needed
  },
  firstName: { type: String },
  lastName: { type: String },
}, { timestamps: true }); // Add createdAt and updatedAt timestamps

const UserModel = mongoose.model('User', userSchema); // Change model name back to UserModel

module.exports = { UserModel }; // Export as UserModel