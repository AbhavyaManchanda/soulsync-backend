const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const moodRouter = require('./routes/moodRoutes');
const sessionRouter = require('./routes/sessionRoutes');

const app = express();

//Global Middleware
app.use(helmet());                // Security headers
app.use(cors());                  // Enable Cross-Origin requests
app.use(express.json());          // Parse JSON bodies
app.use(morgan('dev'));           // Log requests to console

//To verify the backend is alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'SoulSync Backend is running' });
});

// Mounting Routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/moods', moodRouter);
app.use('/api/v1/sessions', sessionRouter);

// 1. Handle Undefined Routes (404)
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
});


// 2. The Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;