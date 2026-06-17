const express = require('express');
const { signup, login, me, logout } = require('../controllers/authController');
const { validate } = require('../middleware/errorHandler');
const { signupSchema, loginSchema } = require('../validators/schemas');
const protect = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.get('/me', protect, me);
router.post('/logout', protect, logout);

module.exports = router;
