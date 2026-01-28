require('dotenv').config();
const app = require('./src/app');
const dns = require('dns');
const connectDB = require('./src/config/db');
dns.setDefaultResultOrder('ipv4first');
const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET not set. Login/signup will fail. Add it to .env');
}

let server;

async function start() {
  const dbConnected = await connectDB();
  if (!dbConnected) console.warn('⚠️ MongoDB not connected. Auth and data routes will fail.');
  else console.log('✅ MongoDB connected');

  server = app.listen(PORT, () => {
    console.log(`
  🚀 SoulSync Server Started!
  📡 Listening on Port: ${PORT}
  🛠️  Mode: ${process.env.NODE_ENV}
  📦 DB: ${dbConnected ? 'ready' : 'NOT connected'}
    `);
  });
  return server;
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  if (process.env.NODE_ENV === 'production' && server) {
    server.close(() => process.exit(1));
  }
});