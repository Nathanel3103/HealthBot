// mongodb.js

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * @returns {Promise<void>} - A promise that resolves when the connection is successful.
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
}

module.exports = connectToDatabase;
