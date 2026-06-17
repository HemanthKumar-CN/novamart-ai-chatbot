const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const logger = require('../config/logger');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * Set the JWT as a httpOnly cookie.
 * secure flag is on in production (HTTPS only).
 */
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', { path: '/' });
};

/**
 * POST /auth/signup
 */
exports.signup = asyncHandler(async (req, res) => {
  // Body is already validated by Zod middleware
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with that email already exists.', 400);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  setAuthCookie(res, token);

  logger.info({ userId: user._id, email }, 'User signed up');

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user,
  });
});

/**
 * POST /auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    // Same error for unknown email and wrong password (prevents user enumeration)
    throw new AppError('Invalid email or password.', 401);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user._id);
  setAuthCookie(res, token);

  logger.info({ userId: user._id, email }, 'User logged in');

  res.json({
    message: 'Logged in successfully',
    token,
    user: user.toJSON(),
  });
});

/**
 * GET /auth/me
 */
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

/**
 * POST /auth/logout
 * Clears the cookie and confirms. Client should also drop its local copy.
 */
exports.logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  logger.info({ userId: req.user?._id }, 'User logged out');
  res.json({ message: 'Logged out successfully' });
});
