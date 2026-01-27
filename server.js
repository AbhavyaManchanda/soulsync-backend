require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 SoulSync Server Started!
  📡 Listening on Port: ${PORT}
  🛠️  Mode: ${process.env.NODE_ENV}
  console.log(✅ MongoDB Connected);
  `);
});

// Connect to Database (non-fatal if it fails)
// connectDB().then((dbConnected) => {
//   if (!dbConnected) {
//     console.warn(
//       '⚠️  MongoDB connection failed. Server will still run, but DB routes will fail until MONGO_URI/network is fixed.'
//     );
//   }
// });

// Handle unhandled promise rejections (don't kill dev server)
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Keep the server alive in dev so you can still open the UI/health endpoint.
  // In production you'd typically exit and let a process manager restart.
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});