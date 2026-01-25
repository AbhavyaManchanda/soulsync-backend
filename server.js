require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 SoulSync Server Started!
  📡 Listening on Port: ${PORT}
  🛠️  Mode: ${process.env.NODE_ENV}
  `);
});

// Handle unhandled promise rejections (e.g., DB connection fails)
// eslint-disable-next-line no-unused-vars
// This will log the error and close the server gracefully
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});