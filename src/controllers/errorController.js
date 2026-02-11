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