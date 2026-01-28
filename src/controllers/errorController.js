module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Something went wrong';

  if (process.env.NODE_ENV?.trim() === 'development') {
    console.error('[Error]', statusCode, message, err.stack || '');
    res.status(statusCode).json({
      status,
      message,
      stack: err.stack
    });
  } else {
    res.status(statusCode).json({ status, message });
  }
};