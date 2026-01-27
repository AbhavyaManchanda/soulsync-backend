module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV?.trim() ==='development') {
     
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Isse Render ke logs mein aur frontend par asli wajah dikhegi
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message, // 👈 'Something went very wrong' hata kar ye likho test ke liye
      error: err // 👈 Isse pura error object mil jayega
    });
  }
};