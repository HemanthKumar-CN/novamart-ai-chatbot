const { ZodError } = require('zod');
const config = require('../config/env');
const logger = require('../config/logger');

/**
 * 404 handler
 */
const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Zod validation middleware factory.
 *   validate({ body: signupSchema, params: objectIdParamSchema })
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors
        .map((i) => `${i.path.join('.') || 'field'}: ${i.message}`)
        .join('; ');
      return res.status(400).json({ error: message, errors: err.errors });
    }
    next(err);
  }
};

/**
 * Global error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode) || 500;
  const reqId = req.id || '-';

  // Zod
  if (err instanceof ZodError) {
    const message = err.errors
      .map((i) => `${i.path.join('.') || 'field'}: ${i.message}`)
      .join('; ');
    return res.status(400).json({ error: message, errors: err.errors });
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ error: `That ${field} is already in use.` });
  }

  // Mongoose cast error (bad ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}` });
  }

  // Custom AppError
  if (err.statusCode) {
    return res.status(statusCode).json({ error: err.message });
  }

  // Unknown error — log fully with request id
  logger.error({ err, reqId, method: req.method, url: req.originalUrl }, 'Unhandled error');

  res.status(statusCode).json({
    error: config.isProd ? 'Something went wrong' : err.message,
    requestId: config.isProd ? undefined : reqId,
  });
};

/**
 * Async route wrapper — catches rejected promises so they hit errorHandler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { notFound, errorHandler, validate, asyncHandler, AppError };
