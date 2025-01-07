const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
  try {
    console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    mongoose.connection.close(); // Close the connection
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

connectDb();