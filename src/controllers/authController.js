const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// Helper function to create the Token
const signToken = (id) => {
  // Explicit check for JWT_SECRET to prevent 'next is not a function' during jwt.sign
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from Environment Variables!');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d' // Fallback if variable is missing
  });
};

exports.signup = async (req, res, next) => {
  try {
    // 1. Attempt to create the user
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });

    // 2. Generate token
    const token = signToken(newUser._id);

    // 3. Remove password from output for security
    const safeUser = { 
      id: newUser._id, 
      name: newUser.name, 
      email: newUser.email 
    };

    // 4. Send success response
    res.status(201).json({
      status: 'success',
      token,
      data: { user: safeUser }
    });

  } catch (err) {
    // SAFETY: If Express fails to pass 'next', we manually send the error response
    if (typeof next !== 'function') {
      console.error('CRITICAL: Express "next" is missing! Error was:', err.message);
      return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message
      });
    }
    
    // Pass to global error handler
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2. Check if user exists && password is correct
    // We use .select('+password') because it's hidden by default in the schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3. If everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token
    });

  } catch (err) {
    if (typeof next !== 'function') {
      return res.status(500).json({ status: 'error', message: err.message });
    }
    next(err);
  }
};