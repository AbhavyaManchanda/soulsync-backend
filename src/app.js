 

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
app.use(helmet()); 
app.use(express.json()); 
app.use(morgan('dev')); 


app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://soulsync-friendly-therapist.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

 

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
  const statusCode = err.statusCode || 500;
  // Production mein bhi message dikhe isliye err.message direct bhej rahe hain
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    error: err // 👈 Isse aapko Vercel par asli wajah dikhegi
  });
});

module.exports = app;