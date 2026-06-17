const { z } = require('zod');

/**
 * Centralized request validation schemas using Zod.
 * Used by the `validate` middleware in errorHandler.js.
 */

// ---- Auth ----
const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(160, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

// ---- Chat ----
const sendMessageSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i, 'Invalid conversation id')
    .nullable()
    .optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
});

const objectIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});

module.exports = {
  signupSchema,
  loginSchema,
  sendMessageSchema,
  objectIdParamSchema,
};
