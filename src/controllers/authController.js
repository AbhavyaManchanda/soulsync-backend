const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// Helper function to create the "Passport" (Token)
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });

    const token = signToken(newUser._id);

    const safeUser = { id: newUser._id, name: newUser.name, email: newUser.email };
    res.status(201).json({
      status: 'success',
      token,
      data: { user: safeUser }
    });
  } catch (err) {
    next(err); // This sends the error to our Global Error Handler!
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Login failed: no user with email', email);
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    const ok = await user.correctPassword(password, user.password);
    if (!ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Login failed: wrong password for', email);
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
};