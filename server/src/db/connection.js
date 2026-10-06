const mongoose = require('mongoose');
const config = require('../config/env');

let isConnected = false;

/**
 * Connect to MongoDB with graceful handling.
 * If MongoDB is unavailable, disables bufferCommands so queries fail fast
 * and the Express server continues running smoothly.
 */
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 1000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    mongoose.set('bufferCommands', false);
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${config.mongoUri}: ${error.message}`);
    console.warn('[MongoDB Warning] Proceeding in non-persisted mode for PagePilot POC routes.');
  }
};

module.exports = connectDB;
