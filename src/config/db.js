const mongoose = require('mongoose');

const connectDB = async () => {
  // Fail fast if DB isn't connected (avoid hanging requests)
  mongoose.set('bufferCommands', false);
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    // Don't hard-exit; allow the server to boot so health checks/UI can load.
    // Routes that rely on MongoDB will fail until MONGO_URI/network is fixed.
    return false;
  }
};

module.exports = connectDB;