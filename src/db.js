// db.js (simplified for testing)
const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDb };