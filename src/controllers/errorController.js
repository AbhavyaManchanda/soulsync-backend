const AppError = require('../utils/appError'); 

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Something went wrong';

  console.error('[SERVER ERROR]:', err);  

  if (process.env.NODE_ENV?.trim() === 'development') {
    res.status(statusCode).json({
      status,
      message,
      stack: err.stack
    });
  } else {
    res.status(statusCode).json({ status, message });
  }
};