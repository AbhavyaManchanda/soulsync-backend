 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
// const AppError = require('./utils/appError');
// const globalErrorHandler = require('./controllers/errorController');

// Routers
const userRouter = require('./routes/userRoutes');
const moodRouter = require('./routes/moodRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const journalRouter = require('./routes/journalRoutes');
const statsRouter = require('./routes/statsRoutes');
const yogaRoutes = require('./routes/yogaRoutes');
const dietRoutes = require('./routes/dietRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

// 1. Global Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://soulsync-friendly-therapist.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. HELMET (With CORS-friendly settings)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.use(express.json()); 
app.use(morgan('dev'));

 

// 3. Health & Welcome Routes
app.get('/', (req, res) => {
  res.send('SoulSync Backend is running successfully!');
});

app.get('/health', (req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'UP',
    message: 'SoulSync Backend is running',
    db
  });
});

// 4. Mounting Routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/moods', moodRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/journals', journalRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/yoga', yogaRoutes);
app.use('/api/v1/diet', dietRoutes);
app.use('/api/v1/blogs', blogRoutes);

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

 
app.use((err, req, res, next) => {
  // 1. Log the full error with stack trace to Render Logs
  // This is the most important part for debugging!
  console.error('ERROR 💥:', err);

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // 2. Send detailed JSON back to your frontend
  res.status(statusCode).json({
    status: status,
    message: err.message || 'Internal Server Error',
    // Including these specifically because 'err' alone becomes {} in JSON
    errorName: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // This will help you see the exact Mongo or JWT error in the browser
    fullErrorDetails: {
      message: err.message,
      name: err.name,
      code: err.code // Useful for MongoDB duplicate key errors (11000)
    }
  });
});
module.exports = app;