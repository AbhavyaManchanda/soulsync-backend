const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soulsync';
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI not set. Using fallback: mongodb://127.0.0.1:27017/soulsync');
  }
  try {
    await mongoose.connect(uri);
    return true;
  } catch (error) {
    const msg = error.message || '';
    console.error('❌ MongoDB connection failed:', msg);
    if (/whitelist|allowlist|ENOTFOUND|ECONNREFUSED|querySrv/i.test(msg)) {
      console.error('   Tip: For Atlas, add your IP at https://cloud.mongodb.com → Network Access. For local, use mongodb://127.0.0.1:27017/soulsync');
    }
    return false;
  }
};

module.exports = connectDB;