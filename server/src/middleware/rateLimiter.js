const rateLimit = require('express-rate-limit');

/**
 * Stricter limiter for chat endpoints to prevent abuse and protect our
 * OpenRouter free quota. 30 messages per 15 min per IP.
 */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'You are sending messages too fast. Please wait a few minutes and try again.',
  },
});

/**
 * Looser limiter for auth endpoints (login/signup).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

module.exports = { chatLimiter, authLimiter };
