const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const moodRouter = require('./routes/moodRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const journalRouter = require('./routes/journalRoutes');
const statsRouter = require('./routes/statsRoutes');
const yogaRoutes = require('./routes/yogaRoutes');
const dietRoutes = require('./routes/dietRoutes');
const blogRoutes = require('./routes/blogRoutes');

const app = express();

//Global Middleware
app.use(helmet());                // Security headers
app.use(cors());                  // Enable Cross-Origin requests
// const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

// app.use(cors({
//   origin: function (origin, callback) {
//     // allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       return callback(new Error('CORS blocked this origin'), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (origin && allowedOrigins.includes(origin)) res.header('Access-Control-Allow-Origin', origin);
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   if (req.method === 'OPTIONS') return res.sendStatus(200);
//   next();
// });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());          // Parse JSON bodies
app.use(morgan('dev'));           // Log requests to console

app.get('/', (req, res) => {
  res.send('Backend is running successfully!');
});

// Health check: backend alive + DB status
app.get('/health', (req, res) => {
  const db = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'UP',
    message: 'SoulSync Backend is running',
    db
  });
});



// Mounting Routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/moods', moodRouter);
app.use('/api/v1/sessions', sessionRouter);
app.use('/api/v1/journals', journalRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/yoga', yogaRoutes);
app.use('/api/v1/diet', dietRoutes);
app.use('/api/v1/blogs', blogRoutes);

// // 1. Handle Undefined Routes (404)
// app.all(/(.*)/, (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
// });

// serverside/src/app.js
// const cors = require('cors')


// Preflight requests (OPTIONS) ko handle karne ke liye
// app.options('*', cors());


// 2. The Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;